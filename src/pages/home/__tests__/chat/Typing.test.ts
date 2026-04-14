import { screen, waitFor, within } from '@testing-library/react'

import { NetworkResponses, wrap } from 'wrapito'

import { activeFeatureFlags } from '__tests__/helpers'
import { App } from 'app'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
import { ChatEventMother } from 'app/chat/__scenarios__/ChatEventMother'
import { ChatSetupMother } from 'app/chat/__scenarios__/ChatSetupMother'
import { openHelpDeskChat } from 'pages/home/__tests__/helpers'
import { emitMessageHelDeskChat } from 'services/chat-socket/__tests__/ChatSocket.mock'
import { knownFeatureFlags } from 'services/feature-flags'

vi.unmock('@mercadona/mo.library.web-services/cookies')
vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Home - Chat - Agent Typing', () => {
  beforeEach(() => {
    activeFeatureFlags([knownFeatureFlags.NEW_SUPPORT_CHAT])
  })

  it('should show agent typing indicator when receiving agent_typing_start event', async () => {
    const responses: NetworkResponses = [
      { path: '/customers/1/home/', responseBody: homeWithGrid },
      {
        path: '/conversations/chats/setup/',
        method: 'post',
        requestBody: {
          user_id: '1',
        },
        responseBody: ChatSetupMother.default(),
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Novedades')
    openHelpDeskChat()
    const helpDeskChat = await screen.findByLabelText('Customer service')
    const messages = await within(helpDeskChat).findByRole('log')
    emitMessageHelDeskChat(ChatEventMother.agentTypingStart())

    expect(
      await within(messages).findByRole('status', { name: 'Agent is typing' }),
    ).toBeInTheDocument()
  })

  it('should hide agent typing indicator when receiving agent_typing_end event', async () => {
    const responses: NetworkResponses = [
      { path: '/customers/1/home/', responseBody: homeWithGrid },
      {
        path: '/conversations/chats/setup/',
        method: 'post',
        requestBody: {
          user_id: '1',
        },
        responseBody: ChatSetupMother.default(),
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Novedades')
    openHelpDeskChat()
    const helpDeskChat = await screen.findByLabelText('Customer service')
    const messages = await within(helpDeskChat).findByRole('log')

    vi.useFakeTimers()
    emitMessageHelDeskChat(ChatEventMother.agentTypingStart())
    emitMessageHelDeskChat(ChatEventMother.agentTypingEnd())
    vi.advanceTimersByTime(300)
    vi.useRealTimers()

    await waitFor(() => {
      expect(
        within(messages).queryByRole('status', { name: 'Agent is typing' }),
      ).not.toBeInTheDocument()
    })
  })

  it('should hide agent typing indicator when an agent message arrives without agent_typing_end', async () => {
    const responses: NetworkResponses = [
      { path: '/customers/1/home/', responseBody: homeWithGrid },
      {
        path: '/conversations/chats/setup/',
        method: 'post',
        requestBody: {
          user_id: '1',
        },
        responseBody: ChatSetupMother.default(),
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Novedades')
    openHelpDeskChat()
    const helpDeskChat = await screen.findByLabelText('Customer service')
    const messages = await within(helpDeskChat).findByRole('log')
    emitMessageHelDeskChat(ChatEventMother.agentTypingStart())
    emitMessageHelDeskChat(ChatEventMother.agentTextMessage())

    await waitFor(() => {
      expect(
        within(messages).queryByRole('status', { name: 'Agent is typing' }),
      ).not.toBeInTheDocument()
    })
  })
})
