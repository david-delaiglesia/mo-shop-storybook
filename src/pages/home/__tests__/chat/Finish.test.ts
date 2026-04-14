import { screen, within } from '@testing-library/react'

import { NetworkResponses, wrap } from 'wrapito'

import { activeFeatureFlags } from '__tests__/helpers'
import { App } from 'app'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
import { ChatEventMother } from 'app/chat/__scenarios__/ChatEventMother'
import { ChatSetupMother } from 'app/chat/__scenarios__/ChatSetupMother'
import { startNewChat } from 'pages/__tests__/helpers/chat'
import {
  closeHelpDeskChat,
  continueHelpDeskChat,
  finishHelpDeskChat,
  openHelpDeskChat,
} from 'pages/home/__tests__/helpers'
import {
  disconnectSocketMock,
  emitMessageHelDeskChat,
} from 'services/chat-socket/__tests__/ChatSocket.mock'
import { knownFeatureFlags } from 'services/feature-flags'

vi.unmock('@mercadona/mo.library.web-services/cookies')
vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Home - Chat - Finish chat', () => {
  beforeEach(() => {
    activeFeatureFlags([knownFeatureFlags.NEW_SUPPORT_CHAT])
  })

  it('should can receive that the chat has finished', async () => {
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
    emitMessageHelDeskChat(ChatEventMother.conversationReleased())

    expect(within(messages).getByText('Conversation ended')).toBeInTheDocument()
    expect(within(messages).getByText('Conversation ended')).toHaveClass(
      'chat-messages__system-status-update-text footnote1-r',
    )
  })

  it('should can see a button to open new chat insted input to send message', async () => {
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
    await within(helpDeskChat).findByRole('log')
    emitMessageHelDeskChat(ChatEventMother.conversationReleased())

    expect(within(messages).getByText('Conversation ended')).toBeInTheDocument()
    expect(
      within(helpDeskChat).queryByLabelText('Adjuntar imágenes o archivos'),
    ).not.toBeInTheDocument()
    expect(
      within(helpDeskChat).queryByLabelText('message for the chat'),
    ).not.toBeInTheDocument()
    expect(
      within(helpDeskChat).queryByLabelText('send the message in the chat'),
    ).not.toBeInTheDocument()
    expect(
      within(helpDeskChat).getByRole('button', {
        name: 'Start new chat',
      }),
    ).toBeInTheDocument()
  })

  it('should can open a new conversation after remote finish', async () => {
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
    await screen.findByLabelText('Customer service')
    emitMessageHelDeskChat(ChatEventMother.conversationReleased())
    startNewChat()

    const helpDeskChat = await screen.findByLabelText('Customer service')
    const messages = await within(helpDeskChat).findByRole('log')

    expect('/conversations/chats/setup/').toHaveBeenFetchedTimes(2)
    expect(
      within(messages).getAllByText('Hola! ¿cómo podemos ayudarte?'),
    ).toHaveLength(1)
    expect(
      within(messages).queryByText('Conversación finalizada'),
    ).not.toBeInTheDocument()
    expect(
      within(helpDeskChat).getByLabelText('Attach images or files'),
    ).toBeInTheDocument()
    expect(
      within(helpDeskChat).getByLabelText('message for the chat'),
    ).toBeInTheDocument()
    expect(
      within(helpDeskChat).getByLabelText('Send message'),
    ).toBeInTheDocument()
  })

  it('should NOT render the finish confirmation overlay when the agent ends the chat and user closes it', async () => {
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
    emitMessageHelDeskChat(ChatEventMother.conversationReleased())
    await within(messages).findByText('Conversation ended')
    closeHelpDeskChat()

    expect(
      within(helpDeskChat).queryByText('Shall we end this conversation?'),
    ).not.toBeInTheDocument()
  })

  it('should do NOT send another setup when the agent ends the chat and user closes it', async () => {
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
    emitMessageHelDeskChat(ChatEventMother.conversationReleased())
    await within(messages).findByText('Conversation ended')
    closeHelpDeskChat()

    expect('/conversations/chats/setup/').toHaveBeenFetchedTimes(1)
    expect(
      within(helpDeskChat).queryByText('Shall we end this conversation?'),
    ).not.toBeInTheDocument()
  })

  it('should open the finish confirmation overlay when user try to finish the chat with the close button', async () => {
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
    closeHelpDeskChat()

    expect(
      within(helpDeskChat).getByText('Shall we end this conversation?'),
    ).toBeInTheDocument()
    expect(
      within(helpDeskChat).getByText(
        "Feel free to write to us again whenever you need. We'll be here to help.",
      ),
    ).toBeInTheDocument()
    expect(
      within(helpDeskChat).getByRole('button', {
        name: 'End conversation',
      }),
    ).toBeInTheDocument()
    expect(
      within(helpDeskChat).getByRole('button', {
        name: 'Continue my inquiry',
      }),
    ).toBeInTheDocument()
  })

  it('should continue the conversation when user open the finish confirmation overlay and click in continue conversation button', async () => {
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
    closeHelpDeskChat()
    continueHelpDeskChat()

    expect(
      within(helpDeskChat).queryByText('Shall we end this conversation?'),
    ).not.toBeInTheDocument()
    expect(
      within(helpDeskChat).queryByText(
        "Feel free to write to us again whenever you need. We'll be here to help.",
      ),
    ).not.toBeInTheDocument()
    expect(
      within(helpDeskChat).queryByRole('button', {
        name: 'End conversation',
      }),
    ).not.toBeInTheDocument()
    expect(
      within(helpDeskChat).queryByRole('button', {
        name: 'Continue my inquiry',
      }),
    ).not.toBeInTheDocument()
  })

  it('should finish the conversation when user open the finish confirmation overlay and click in finish button', async () => {
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
      {
        path: '/conversations/chats/chat-id/release/',
        method: 'post',
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Novedades')
    openHelpDeskChat()
    const helpDeskChat = await screen.findByLabelText('Customer service')
    await within(helpDeskChat).findByRole('log')
    closeHelpDeskChat()
    await within(helpDeskChat).findByRole('dialog', {
      name: 'Shall we end this conversation?',
    })

    finishHelpDeskChat()

    expect('/conversations/chats/chat-id/release/').toHaveBeenFetched()
    expect(helpDeskChat).not.toBeInTheDocument()
  })

  it('should disconnect the websocket when user finish the chat', async () => {
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
    closeHelpDeskChat()
    await within(helpDeskChat).findByRole('dialog', {
      name: 'Shall we end this conversation?',
    })

    finishHelpDeskChat()

    await screen.findByRole('button', { name: 'Open chat' })

    expect(disconnectSocketMock).toHaveBeenCalled()
  })

  it('should not open finish confirmation overlay after finish a chat and open again the help desk chat', async () => {
    const responses: NetworkResponses = [
      { path: '/customers/1/home/', responseBody: homeWithGrid },
      {
        path: '/conversations/chats/setup/',
        method: 'post',
        requestBody: {
          user_id: '1',
        },
        multipleResponses: [
          {
            responseBody: ChatSetupMother.default(),
          },
          {
            responseBody: ChatSetupMother.default(),
          },
        ],
      },
      {
        path: '/conversations/chats/chat-id/release/',
        method: 'post',
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Novedades')
    openHelpDeskChat()
    await screen.findByLabelText('Customer service')
    closeHelpDeskChat()
    finishHelpDeskChat()
    await screen.findByRole('button', { name: /Open chat/i })
    openHelpDeskChat()
    const helpDeskChat = await screen.findByLabelText('Customer service')
    await within(helpDeskChat).findByRole('log')

    expect(
      screen.queryByRole('dialog', {
        name: 'Shall we end this conversation?',
      }),
    ).not.toBeInTheDocument()
  })

  it('should not open finish confirmation overlay if the setup fails and user click on close button', async () => {
    const responses: NetworkResponses = [
      { path: '/customers/1/home/', responseBody: homeWithGrid },
      {
        path: '/conversations/chats/setup/',
        method: 'post',
        requestBody: {
          user_id: '1',
        },
        responseBody: ChatSetupMother.default(),
        status: 500,
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Novedades')
    openHelpDeskChat()

    await screen.findByRole('heading', {
      name: 'Sorry, we couldn’t start the chat.',
    })
    closeHelpDeskChat()

    expect(
      screen.queryByRole('dialog', {
        name: 'Shall we end this conversation?',
      }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Open chat/i }),
    ).toBeInTheDocument()
  })

  it('should do channel setup again when user finish the chat and open again the help desk chat', async () => {
    const responses: NetworkResponses = [
      { path: '/customers/1/home/', responseBody: homeWithGrid },
      {
        path: '/conversations/chats/setup/',
        method: 'post',
        requestBody: {
          user_id: '1',
        },
        multipleResponses: [
          {
            responseBody: ChatSetupMother.default(),
          },
          {
            responseBody: ChatSetupMother.default(),
          },
        ],
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Novedades')
    openHelpDeskChat()
    await screen.findByLabelText('Customer service')
    closeHelpDeskChat()
    finishHelpDeskChat()
    await screen.findByRole('button', { name: /Open chat/i })
    openHelpDeskChat()

    await screen.findByText('Hola! ¿cómo podemos ayudarte?')

    expect('/conversations/chats/setup/').toHaveBeenFetchedTimes(2)
  })

  it('should hidde the send message form while finish confirmation overlay is open', async () => {
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
    closeHelpDeskChat()
    await within(helpDeskChat).findByRole('dialog', {
      name: 'Shall we end this conversation?',
    })

    expect(
      within(helpDeskChat).queryByPlaceholderText('Write a message...'),
    ).not.toBeInTheDocument()
    expect(
      within(helpDeskChat).queryByRole('button', {
        name: 'send the message in the chat',
      }),
    ).not.toBeInTheDocument()
    expect(
      within(helpDeskChat).queryByLabelText('Adjuntar imágenes o archivos'),
    ).not.toBeInTheDocument()
  })

  it('should show the send message form when finish confirmation overlay is closed', async () => {
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
    closeHelpDeskChat()
    await within(helpDeskChat).findByRole('dialog', {
      name: 'Shall we end this conversation?',
    })
    continueHelpDeskChat()

    expect(
      await within(helpDeskChat).findByPlaceholderText('Write a message...'),
    ).toBeInTheDocument()
    expect(
      within(helpDeskChat).getByRole('button', {
        name: 'Send message',
      }),
    ).toBeInTheDocument()
    expect(
      within(helpDeskChat).getByLabelText('Attach images or files'),
    ).toBeInTheDocument()
  })

  it('should disable the close button when finish confirmation overlay is open', async () => {
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
    closeHelpDeskChat()

    expect(screen.getByRole('button', { name: 'End chat' })).toBeDisabled()
  })

  it('should disable the context menu when finish confirmation overlay is open', async () => {
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
    closeHelpDeskChat()

    expect(screen.getByRole('button', { name: 'More options' })).toBeDisabled()
  })
})
