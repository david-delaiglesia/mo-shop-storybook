import { screen, within } from '@testing-library/react'

import { NetworkResponses, wrap } from 'wrapito'

import { activeFeatureFlags } from '__tests__/helpers'
import { App } from 'app'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
import { ChatEventMother } from 'app/chat/__scenarios__/ChatEventMother'
import { ChatSetupMother } from 'app/chat/__scenarios__/ChatSetupMother'
import {
  minimizeHelpDeskChatWithFloatingButton,
  minimizeHelpDeskChatWithHeaderButton,
  openHelpDeskChat,
  openHelpDeskChatWithPendingMessages,
} from 'pages/home/__tests__/helpers'
import { emitMessageHelDeskChat } from 'services/chat-socket/__tests__/ChatSocket.mock'
import { knownFeatureFlags } from 'services/feature-flags'

vi.unmock('@mercadona/mo.library.web-services/cookies')
vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

beforeEach(() => {
  activeFeatureFlags([knownFeatureFlags.NEW_SUPPORT_CHAT])
})

it('should see unread messages from an agent when the chat is minimized', async () => {
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
  emitMessageHelDeskChat(
    ChatEventMother.agentTextMessage('Necesitamos más información'),
  )
  minimizeHelpDeskChatWithFloatingButton()
  emitMessageHelDeskChat(ChatEventMother.agentTextMessage('Por favor'))
  emitMessageHelDeskChat(
    ChatEventMother.agentTextMessage('indíquenos su problema'),
  )

  const chatButtonWithPendingMessages = await screen.findByRole('button', {
    name: 'Open chat. You have 2 unread messages',
  })
  expect(chatButtonWithPendingMessages).toBeInTheDocument()
})

it('should not see unread messages when the chat is minimized since the received messages are not from an agent', async () => {
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

  emitMessageHelDeskChat(
    ChatEventMother.agentTextMessage('Necesitamos más información'),
  )
  emitMessageHelDeskChat(
    ChatEventMother.agentTextMessage('Por favor, indíquenos su problema'),
  )
  minimizeHelpDeskChatWithFloatingButton()
  /* Receiving events that are not agent messages.
   * This is an unreal scenario, although it serves for testing purposes.
   */
  emitMessageHelDeskChat(ChatEventMother.updateQueuePosition())
  emitMessageHelDeskChat(ChatEventMother.agentAssigned())
  emitMessageHelDeskChat(ChatEventMother.userMessage())
  emitMessageHelDeskChat(ChatEventMother.conversationReleased())

  const chatButtonWithoutPendingMessages = await screen.findByRole('button', {
    name: 'Open chat',
  })
  expect(chatButtonWithoutPendingMessages).toBeInTheDocument()
})

it('should reset unread messages from agent when the chat opens and get minimized again', async () => {
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
  minimizeHelpDeskChatWithFloatingButton()
  emitMessageHelDeskChat(
    ChatEventMother.agentTextMessage('Necesitamos más información'),
  )
  emitMessageHelDeskChat(
    ChatEventMother.agentTextMessage('Por favor, indíquenos su problema'),
  )

  openHelpDeskChatWithPendingMessages(2)
  minimizeHelpDeskChatWithFloatingButton()

  const chatButtonWithoutPendingMessages = await screen.findByRole('button', {
    name: 'Open chat',
  })
  expect(chatButtonWithoutPendingMessages).toBeInTheDocument()
})

it('should reset unread messages from agent when the chat opens and get minimized again with the minimize header', async () => {
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
  minimizeHelpDeskChatWithHeaderButton()
  emitMessageHelDeskChat(
    ChatEventMother.agentTextMessage('Necesitamos más información'),
  )
  emitMessageHelDeskChat(
    ChatEventMother.agentTextMessage('Por favor, indíquenos su problema'),
  )

  openHelpDeskChatWithPendingMessages(2)
  minimizeHelpDeskChatWithHeaderButton()

  const chatButtonWithoutPendingMessages = await screen.findByRole('button', {
    name: 'Open chat',
  })
  expect(chatButtonWithoutPendingMessages).toBeInTheDocument()
})
