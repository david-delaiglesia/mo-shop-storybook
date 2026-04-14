import { screen, within } from '@testing-library/react'

import { NetworkResponses, wrap } from 'wrapito'

import { activeFeatureFlags } from '__tests__/helpers'
import { App } from 'app'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
import { ChatEventMother } from 'app/chat/__scenarios__/ChatEventMother'
import { ChatSetupMother } from 'app/chat/__scenarios__/ChatSetupMother'
import {
  minimizeHelpDeskChatWithFloatingButton,
  openHelpDeskChat,
  scrollMessagesUp,
} from 'pages/home/__tests__/helpers'
import { emitMessageHelDeskChat } from 'services/chat-socket/__tests__/ChatSocket.mock'
import { knownFeatureFlags } from 'services/feature-flags'

vi.unmock('@mercadona/mo.library.web-services/cookies')
vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

const scrollToMock = vi.fn()

beforeEach(() => {
  activeFeatureFlags([knownFeatureFlags.NEW_SUPPORT_CHAT])
  scrollToMock.mockClear()

  Object.defineProperty(window.HTMLElement.prototype, 'scrollTo', {
    value: scrollToMock,
    writable: true,
  })
})

it.each([
  {
    event: ChatEventMother.userMessage(),
    description: 'the user sends a new message',
    textMatch: ChatEventMother.userMessage().payload.content.text,
  },
  {
    event: ChatEventMother.agentTextMessage('Danos más información'),
    description: 'the user receives a new message',
    textMatch: 'Danos más información',
  },
  {
    event: ChatEventMother.conversationReleased(),
    description: 'the chat is finished',
    textMatch: 'Conversation ended',
  },
  {
    event: ChatEventMother.updateQueuePosition(),
    description: 'the queue position is updated',
    textMatch: 'You are number 3 in the queue',
  },
])(
  'should scroll to bottom when $description',
  async ({ event, textMatch }) => {
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

    emitMessageHelDeskChat(event)

    await within(messages).findByText('Hola! ¿cómo podemos ayudarte?')

    expect(within(messages).getByText(textMatch)).toBeInTheDocument()
    expect(scrollToMock).toHaveBeenCalledTimes(2)
    expect(scrollToMock).toHaveBeenCalledWith(
      expect.objectContaining({ behavior: 'smooth', top: expect.any(Number) }),
    )
  },
)

it('should scroll to bottom on setup conversation', async () => {
  const responses: NetworkResponses = [
    { path: '/customers/1/home/', responseBody: homeWithGrid },
    {
      path: '/conversations/chats/setup/',
      method: 'post',
      requestBody: {
        user_id: '1',
      },
      responseBody: ChatSetupMother.withMultipleMessages(),
    },
  ]

  wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

  await screen.findByText('Novedades')

  openHelpDeskChat()

  const helpDeskChat = await screen.findByLabelText('Customer service')
  const messages = await within(helpDeskChat).findByRole('log')

  await within(messages).findByText('Ah vale, muchas gracias por la ayuda!')

  expect(scrollToMock).toHaveBeenCalledTimes(1)
  expect(scrollToMock).toHaveBeenCalledWith(
    expect.objectContaining({ behavior: 'smooth', top: expect.any(Number) }),
  )
})

it('should scroll to bottom on minimizing and reopening chat again', async () => {
  const responses: NetworkResponses = [
    { path: '/customers/1/home/', responseBody: homeWithGrid },
    {
      path: '/conversations/chats/setup/',
      method: 'post',
      requestBody: {
        user_id: '1',
      },
      responseBody: ChatSetupMother.withMultipleMessages(),
    },
  ]

  wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

  await screen.findByText('Novedades')

  openHelpDeskChat()

  const helpDeskChat = await screen.findByLabelText('Customer service')
  const messages = await within(helpDeskChat).findByRole('log')

  await within(messages).findByText('Ah vale, muchas gracias por la ayuda!')

  minimizeHelpDeskChatWithFloatingButton()
  openHelpDeskChat()

  expect(scrollToMock).toHaveBeenCalledTimes(2)
  expect(scrollToMock).toHaveBeenCalledWith(
    expect.objectContaining({ behavior: 'smooth', top: expect.any(Number) }),
  )
})

it('should not scroll to bottom when new messages if the user scroll up above a threshold of 50px in a container height of 500px', async () => {
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

  emitMessageHelDeskChat(
    ChatEventMother.agentTextMessage('Danos más información'),
  )

  await within(messages).findByText('Danos más información')

  scrollMessagesUp(messages, 440)

  emitMessageHelDeskChat(
    ChatEventMother.agentTextMessage(
      'Por favor, indícanos tu número de pedido',
    ),
  )

  await within(messages).findByText('Por favor, indícanos tu número de pedido')

  expect(scrollToMock).toHaveBeenCalledTimes(2)
  expect(scrollToMock).toHaveBeenCalledWith(
    expect.objectContaining({ behavior: 'smooth', top: expect.any(Number) }),
  )
})

it('should scroll to bottom when new messages if the user scroll up below a threshold of 50px in a container height of 500px', async () => {
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

  emitMessageHelDeskChat(
    ChatEventMother.agentTextMessage('Danos más información'),
  )

  await within(messages).findByText('Danos más información')

  scrollMessagesUp(messages, 480)

  emitMessageHelDeskChat(
    ChatEventMother.agentTextMessage(
      'Por favor, indícanos tu número de pedido',
    ),
  )

  await within(messages).findByText('Por favor, indícanos tu número de pedido')

  expect(scrollToMock).toHaveBeenCalledTimes(3)
  expect(scrollToMock).toHaveBeenCalledWith(
    expect.objectContaining({ behavior: 'smooth', top: expect.any(Number) }),
  )
})
