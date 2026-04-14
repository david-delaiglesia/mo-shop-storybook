import { screen, within } from '@testing-library/react'

import { NetworkResponses, wrap } from 'wrapito'

import { activeFeatureFlags } from '__tests__/helpers'
import { App } from 'app'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
import { ChatEventMother } from 'app/chat/__scenarios__/ChatEventMother'
import { ChatSetupMother } from 'app/chat/__scenarios__/ChatSetupMother'
import {
  openHelpDeskChat,
  sendMessageToHelDeskChatWithButton,
  writeMessageHelpDeskChat,
} from 'pages/home/__tests__/helpers'
import { emitMessageHelDeskChat } from 'services/chat-socket/__tests__/ChatSocket.mock'
import { knownFeatureFlags } from 'services/feature-flags/constants'

vi.unmock('@mercadona/mo.library.web-services/cookies')
vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Home - Chat status', () => {
  beforeEach(() => {
    activeFeatureFlags([knownFeatureFlags.NEW_SUPPORT_CHAT])
  })

  it('should show online status when user open the chat', async () => {
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
    await within(helpDeskChat).findByRole('log')

    expect(
      within(helpDeskChat).getByRole('status', {
        name: /available/i,
        exact: false,
      }),
    ).toBeInTheDocument()
  })

  it('should show offline status when user open the chat', async () => {
    const responses: NetworkResponses = [
      { path: '/customers/1/home/', responseBody: homeWithGrid },
      {
        path: '/conversations/chats/setup/',
        method: 'post',
        requestBody: {
          user_id: '1',
        },
        responseBody: ChatSetupMother.withOfflineStatus(),
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Novedades')
    openHelpDeskChat()
    const helpDeskChat = await screen.findByLabelText('Customer service')
    await within(helpDeskChat).findByRole('log')

    expect(
      within(helpDeskChat).getByRole('status', {
        name: /not available/i,
        exact: false,
      }),
    ).toBeInTheDocument()
  })

  it('should switch to offline status when a conversation:type_changed with type offline is received', async () => {
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

    writeMessageHelpDeskChat('Necesito ayuda')
    sendMessageToHelDeskChatWithButton()

    await within(messages).findByText('Necesito ayuda')

    emitMessageHelDeskChat(ChatEventMother.conversationUpdatedToOffline())
    expect(
      await within(helpDeskChat).findByRole('status', {
        name: /not available/i,
        exact: false,
      }),
    ).toBeInTheDocument()
  })
})
