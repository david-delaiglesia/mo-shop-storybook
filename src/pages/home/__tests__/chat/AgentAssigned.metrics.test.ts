import { screen, within } from '@testing-library/react'

import { NetworkResponses, wrap } from 'wrapito'

import { activeFeatureFlags } from '__tests__/helpers'
import { App } from 'app'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
import { ChatEventMother } from 'app/chat/__scenarios__/ChatEventMother'
import { ChatSetupMother } from 'app/chat/__scenarios__/ChatSetupMother'
import { openHelpDeskChat } from 'pages/home/__tests__/helpers'
import { emitMessageHelDeskChat } from 'services/chat-socket/__tests__/ChatSocket.mock'
import { knownFeatureFlags } from 'services/feature-flags'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Chat Assigned to Agent Metric', () => {
  beforeEach(() => {
    activeFeatureFlags([knownFeatureFlags.NEW_SUPPORT_CHAT])
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should send chat_assigned_to_agent metric when an agent is assigned to the chat', async () => {
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

    const chatOpenTime = Date.now()
    vi.setSystemTime(chatOpenTime)

    openHelpDeskChat()
    const helpDeskChat = await screen.findByLabelText('Customer service')
    await within(helpDeskChat).findByRole('log')

    const timePassedMs = 5000
    const timePassedSeconds = 5
    vi.setSystemTime(chatOpenTime + timePassedMs)

    const agentAssignedEventResponse = ChatEventMother.agentAssigned()
    emitMessageHelDeskChat(agentAssignedEventResponse)

    await within(helpDeskChat).findByText('Soporte MO')

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'chat_assigned_to_agent',
      {
        session_id: 'chat-id',
        agent_name: 'Soporte MO',
        time_since_chat_opened: timePassedSeconds,
      },
    )
  })
})
