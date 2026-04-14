import {
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from '@testing-library/react'

import { NetworkResponses, wrap } from 'wrapito'

import { activeFeatureFlags } from '__tests__/helpers'
import { App } from 'app'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
import { ChatEventMother } from 'app/chat/__scenarios__/ChatEventMother'
import { ChatSetupMother } from 'app/chat/__scenarios__/ChatSetupMother'
import { retryStartNewChat } from 'pages/__tests__/helpers/chat'
import {
  clearMessageHelpDeskChat,
  openHelpDeskChat,
  sendMessageToHelDeskChatWithButton,
  sendMessageToHelDeskChatWithKeyboard,
  writeMessageHelpDeskChat,
} from 'pages/home/__tests__/helpers'
import { emitMessageHelDeskChat } from 'services/chat-socket/__tests__/ChatSocket.mock'
import { knownFeatureFlags } from 'services/feature-flags'
import { Support } from 'services/support'

vi.unmock('@mercadona/mo.library.web-services/cookies')
vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Home - Chat - Logged User', () => {
  beforeEach(() => {
    activeFeatureFlags([knownFeatureFlags.NEW_SUPPORT_CHAT])
  })

  it('should see the chat button', async () => {
    const responses = [{ path: '/home/', responseBody: homeWithGrid }]
    wrap(App).atPath('/').withNetwork(responses).mount()

    await screen.findByText('Novedades')

    expect(
      screen.getByRole('button', { name: /Open chat/i }),
    ).toBeInTheDocument()
  })

  it('should not see the chat button if the flag is not active', async () => {
    activeFeatureFlags([])
    const responses = [{ path: '/home/', responseBody: homeWithGrid }]
    wrap(App).atPath('/').withNetwork(responses).mount()

    await screen.findByText('Novedades')

    expect(
      screen.queryByRole('button', { name: /Open chat/i }),
    ).not.toBeInTheDocument()
  })

  it('should apply default Zendesk settings if the flag is not active', async () => {
    activeFeatureFlags([])
    const responses = [{ path: '/home/', responseBody: homeWithGrid }]
    wrap(App).atPath('/').withNetwork(responses).mount()

    await screen.findByText('Novedades')

    expect(Support.updateSettings).toHaveBeenCalledWith({
      webWidget: {
        color: {
          bypassAccessibilityRequirement: true,
          launcherText: '#ffffff',
        },
        helpCenter: {
          title: {
            es: 'Ayuda',
            ca: 'Ajuda',
            'en-us': 'Help',
            '*': 'Ayuda',
          },
          chatButton: {
            es: 'Abrir chat',
            ca: 'Obrir xat',
            'en-us': 'Open chat',
            '*': 'Abrir chat',
          },
          searchPlaceholder: {
            es: 'Ej.: Pago, gastos de envío, contacto',
            ca: "Ex.: Pagament, despeses d'enviament, contacte",
            'en-us': 'E.g.: payment, shipping costs, contact information',
            '*': 'Ej.: Pago, gastos de envío, contacto',
          },
          suppress: false,
        },
        chat: {
          tags: ['formulario'],
          visitor: {
            departments: {
              department: 'ACMO',
            },
          },
          suppress: false,
        },
        contactForm: {
          suppress: false,
        },
      },
    })
  })

  it('should apply hide Zendesk settings', async () => {
    const responses = [{ path: '/home/', responseBody: homeWithGrid }]
    wrap(App).atPath('/').withNetwork(responses).mount()

    await screen.findByText('Novedades')

    expect(Support.updateSettings).toHaveBeenCalledWith({
      webWidget: {
        color: {
          bypassAccessibilityRequirement: true,
          launcherText: '#ffffff',
        },
        helpCenter: {
          title: {
            es: 'Ayuda',
            ca: 'Ajuda',
            'en-us': 'Help',
            '*': 'Ayuda',
          },
          chatButton: {
            es: 'Abrir chat',
            ca: 'Obrir xat',
            'en-us': 'Open chat',
            '*': 'Abrir chat',
          },
          searchPlaceholder: {
            es: 'Ej.: Pago, gastos de envío, contacto',
            ca: "Ex.: Pagament, despeses d'enviament, contacte",
            'en-us': 'E.g.: payment, shipping costs, contact information',
            '*': 'Ej.: Pago, gastos de envío, contacto',
          },
          suppress: true,
        },
        chat: {
          tags: ['formulario'],
          visitor: {
            departments: {
              department: 'ACMO',
            },
          },
          suppress: true,
        },
        contactForm: {
          suppress: true,
        },
      },
    })
  })

  it('should see the chat button to open the chat', async () => {
    const responses = [{ path: '/home/', responseBody: homeWithGrid }]
    wrap(App).atPath('/').withNetwork(responses).mount()

    await screen.findByText('Novedades')

    expect(
      screen.getByRole('button', { name: /Open chat/i }),
    ).toBeInTheDocument()
    expect(screen.queryByLabelText('Customer service')).not.toBeInTheDocument()
  })

  it('should have the submit button initially disabled', async () => {
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
      within(helpDeskChat).getByRole('button', {
        name: 'Send message',
      }),
    ).toBeDisabled()
  })

  it('should render the loader until the chat setup is complete', async () => {
    const responses: NetworkResponses = [
      { path: '/customers/1/home/', responseBody: homeWithGrid },
      {
        path: '/conversations/chats/setup/',
        method: 'post',
        requestBody: {
          user_id: '1',
        },
        delay: 100,
        responseBody: ChatSetupMother.default(),
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Novedades')
    openHelpDeskChat()
    const loader = await screen.findByLabelText('loader')
    await waitForElementToBeRemoved(loader)
    expect(screen.queryByLabelText('loader')).not.toBeInTheDocument()
    expect(await screen.findByLabelText('Customer service')).toBeInTheDocument()
  })

  it('should enable the submit button when the user types', async () => {
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

    writeMessageHelpDeskChat('Necesito ayuda')
    expect(
      within(helpDeskChat).getByRole('button', {
        name: 'Send message',
      }),
    ).toBeEnabled()
  })

  it('should disable the submit button again when the user clears the input', async () => {
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
    writeMessageHelpDeskChat('Necesito ayuda')
    clearMessageHelpDeskChat()

    expect(
      within(helpDeskChat).getByRole('button', {
        name: 'Send message',
      }),
    ).toBeDisabled()
  })

  it('should can start the chat after open it', async () => {
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

    expect(
      within(messages).getByText('Hola! ¿cómo podemos ayudarte?'),
    ).toBeInTheDocument()
    expect(
      within(messages).getByText('Hola! ¿cómo podemos ayudarte?'),
    ).toHaveClass('chat-messages__message-text--support footnote1-r')
  })

  it('should see an error start the chat fails', async () => {
    const responses: NetworkResponses = [
      { path: '/customers/1/home/', responseBody: homeWithGrid },
      {
        path: '/conversations/chats/setup/',
        method: 'post',
        requestBody: {
          user_id: '1',
        },
        status: 500,
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Novedades')
    openHelpDeskChat()
    const helpDeskChat = await screen.findByLabelText('Customer service')

    await waitFor(() =>
      expect('/conversations/chats/setup/').toHaveBeenFetchedTimes(1),
    )
    expect(
      within(helpDeskChat).getByText('Sorry, we couldn’t start the chat.'),
    ).toHaveAttribute('aria-live', 'assertive')
    expect(
      within(helpDeskChat).getByText('Please try again'),
    ).toBeInTheDocument()
    expect(within(helpDeskChat).getByRole('button', { name: 'Try again' }))
    expect(
      within(helpDeskChat).queryByLabelText(
        'Mensajes del chat con Customer service',
      ),
    ).not.toBeInTheDocument()
  })

  it('should can start again a chat after fails', async () => {
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
            status: 500,
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
    const helpDeskChat = await screen.findByLabelText('Customer service')
    await within(helpDeskChat).findByText('Sorry, we couldn’t start the chat.')
    retryStartNewChat()
    const newHelpDeskChat = await screen.findByLabelText('Customer service')
    const messages = await within(newHelpDeskChat).findByRole('log')

    expect(
      within(messages).getByText('Hola! ¿cómo podemos ayudarte?'),
    ).toBeInTheDocument()
    expect('/conversations/chats/setup/').toHaveBeenFetchedTimes(2)
  })

  it('should can see the privacy policy when start a chat', async () => {
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
    const privacyPolicy = await within(messages).findByText(
      'By starting this chat, you confirm that you have read and agree to our',
    )
    expect(privacyPolicy).toBeInTheDocument()
    expect(
      within(privacyPolicy).getByRole('link', { name: 'Privacy Policy' }),
    ).toHaveAttribute('href', '/legal/privacy/en/')
  })

  it('should can send a mesagge after start the chat ussing the button to send', async () => {
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
        path: '/conversations/chats/chat-id/messages/10000000-1000-4000-8000-100000000000/',
        method: 'put',
        requestBody: {
          message: 'Necesito ayuda',
        },
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Novedades')
    openHelpDeskChat()
    const helpDeskChat = await screen.findByLabelText('Customer service')
    const messages = await within(helpDeskChat).findByRole('log')
    writeMessageHelpDeskChat('Necesito ayuda')
    sendMessageToHelDeskChatWithButton()

    await waitFor(() => {
      expect(
        '/conversations/chats/chat-id/messages/10000000-1000-4000-8000-100000000000/',
      ).toHaveBeenFetchedWith({
        method: 'PUT',
        body: {
          message: 'Necesito ayuda',
        },
      })
    })
    expect(within(messages).getByText('Necesito ayuda')).toBeInTheDocument()
    expect(within(messages).getByText('Necesito ayuda')).toHaveClass(
      'chat-messages__message-text--user footnote1-r',
    )
  })

  it('should reset the form (clear the input and disable the submit button) after submitting a message', async () => {
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
        path: '/conversations/chats/chat-id/messages/10000000-1000-4000-8000-100000000000/',
        method: 'put',
        requestBody: {
          message: 'Necesito ayuda',
        },
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Novedades')
    openHelpDeskChat()
    const helpDeskChat = await screen.findByLabelText('Customer service')
    await within(helpDeskChat).findByRole('log')
    writeMessageHelpDeskChat('Necesito ayuda')
    sendMessageToHelDeskChatWithButton()

    expect(
      within(helpDeskChat).getByPlaceholderText('Write a message...'),
    ).not.toHaveValue()
    expect(
      within(helpDeskChat).getByRole('button', {
        name: 'Send message',
      }),
    ).toBeDisabled()
  })

  it('should can send a mesagge after start the chat ussing the keyboard to send', async () => {
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
        path: '/conversations/chats/chat-id/messages/10000000-1000-4000-8000-100000000000/',
        method: 'put',
        requestBody: {
          message: 'Necesito ayuda',
        },
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Novedades')
    openHelpDeskChat()
    const helpDeskChat = await screen.findByLabelText('Customer service')
    const messages = await within(helpDeskChat).findByRole('log')
    writeMessageHelpDeskChat('Necesito ayuda')
    sendMessageToHelDeskChatWithKeyboard()

    await waitFor(() => {
      expect(
        '/conversations/chats/chat-id/messages/10000000-1000-4000-8000-100000000000/',
      ).toHaveBeenFetchedWith({
        method: 'PUT',
        body: {
          message: 'Necesito ayuda',
        },
      })
    })
    expect(within(messages).getByText('Necesito ayuda')).toBeInTheDocument()
    expect(within(messages).getByText('Necesito ayuda')).toHaveClass(
      'chat-messages__message-text--user footnote1-r',
    )
  })

  it('should can receive a mesagge from support after the chat has started', async () => {
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
      ChatEventMother.agentTextMessage('Necesitamos más información'),
    )

    expect(
      within(messages).getByText('Hola! ¿cómo podemos ayudarte?'),
    ).toBeInTheDocument()
    expect(
      within(messages).getByText('Hola! ¿cómo podemos ayudarte?'),
    ).toHaveClass('chat-messages__message-text--support footnote1-r')
    expect(
      within(messages).getByText('Necesitamos más información'),
    ).toBeInTheDocument()
    expect(
      within(messages).getByText('Necesitamos más información'),
    ).toHaveClass('chat-messages__message-text--support footnote1-r')
    expect(within(messages).getAllByText('Soporte MO')).toHaveLength(2)
  })

  it('should can receive the name of the agent who joins the conversation after the chat has started', async () => {
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
    emitMessageHelDeskChat(ChatEventMother.agentAssigned())

    expect(
      within(messages).getByText('Soporte MO joined the chat'),
    ).toBeInTheDocument()
    expect(
      within(messages).getByText('Soporte MO joined the chat'),
    ).toHaveClass('chat-messages__system-status-update-text footnote1-r')
  })

  it('should can receive the queue position after the chat has started', async () => {
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
    emitMessageHelDeskChat(ChatEventMother.updateQueuePosition())

    expect(
      within(messages).getByText('You are number 3 in the queue'),
    ).toBeInTheDocument()
    expect(
      within(messages).getByText('You are number 3 in the queue'),
    ).toHaveClass('chat-messages__system-status-update-text footnote1-r')
  })

  it('should update the queue position if receive more events', async () => {
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
        path: '/conversations/chats/chat-id/message/',
        method: 'post',
        requestBody: {
          message: 'Necesito ayuda',
        },
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Novedades')
    openHelpDeskChat()
    const helpDeskChat = await screen.findByLabelText('Customer service')
    const messages = await within(helpDeskChat).findByRole('log')
    emitMessageHelDeskChat(ChatEventMother.updateQueuePosition())
    emitMessageHelDeskChat(ChatEventMother.updateQueuePosition(2))

    expect(
      within(messages).getByText('You are number 2 in the queue'),
    ).toBeInTheDocument()
    expect(
      within(messages).queryByText('You are number 3 in the queue'),
    ).not.toBeInTheDocument()
  })

  it('should replace the queue position if receive agent assigned event', async () => {
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
    emitMessageHelDeskChat(ChatEventMother.updateQueuePosition())
    emitMessageHelDeskChat(ChatEventMother.agentAssigned())

    expect(
      within(messages).getByText('Soporte MO joined the chat'),
    ).toBeInTheDocument()
    expect(
      within(messages).queryByText('You are number 3 in the queue'),
    ).not.toBeInTheDocument()
  })

  it('should discard the queue position if have agent assigned in the chat', async () => {
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
    emitMessageHelDeskChat(ChatEventMother.agentAssigned())
    emitMessageHelDeskChat(ChatEventMother.updateQueuePosition())

    expect(
      within(messages).getByText('Soporte MO joined the chat'),
    ).toBeInTheDocument()
    expect(
      within(messages).queryByText('You are number 3 in the queue'),
    ).not.toBeInTheDocument()
  })
})
