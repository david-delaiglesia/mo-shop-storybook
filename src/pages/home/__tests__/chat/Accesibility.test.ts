import { screen, within } from '@testing-library/react'

import { NetworkResponses, wrap } from 'wrapito'

import { activeFeatureFlags } from '__tests__/helpers'
import { App } from 'app'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
import { ChatEventMother } from 'app/chat/__scenarios__/ChatEventMother'
import { ChatSetupMother } from 'app/chat/__scenarios__/ChatSetupMother'
import {
  closeHelpDeskChat,
  minimizeHelpDeskChatWithFloatingButton,
  minimizeHelpDeskChatWithHeaderButton,
  openContextualOptions,
  openHelpDeskChat,
  tabBackwards,
  tabOnwards,
} from 'pages/home/__tests__/helpers'
import { emitMessageHelDeskChat } from 'services/chat-socket/__tests__/ChatSocket.mock'
import { knownFeatureFlags } from 'services/feature-flags'

vi.unmock('@mercadona/mo.library.web-services/cookies')
vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Home - Chat - A11y', () => {
  beforeEach(() => {
    activeFeatureFlags([knownFeatureFlags.NEW_SUPPORT_CHAT])
  })

  it('should have focus inside the finish chat contextual menu when opened', async () => {
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
    openContextualOptions()

    const contextualMenu = await within(helpDeskChat).findByRole('menu')
    const closeConversationOption = within(contextualMenu).getByRole(
      'menuitem',
      { name: 'End chat' },
    )

    expect(closeConversationOption).toHaveFocus()
  })

  it('should have autofocus in the message input on chat open', async () => {
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
      within(helpDeskChat).getByPlaceholderText('Write a message...'),
    ).toHaveFocus()
  })

  it('should set focus to the close button when pressing Tab at the message input', async () => {
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

    tabOnwards()

    expect(within(helpDeskChat).getByLabelText('End chat')).toHaveFocus()
  })

  it('should set focus to the message input when pressing Shift + Tab at the close button', async () => {
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

    tabOnwards()
    tabBackwards()

    expect(
      within(helpDeskChat).getByPlaceholderText('Write a message...'),
    ).toHaveFocus()
  })

  it('should set focus to open chat button when pressing Tab at the minimize button', async () => {
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

    expect(
      await screen.findByRole('button', { name: 'Open chat' }),
    ).toHaveFocus()
  })

  it('should render the logo of MO with role presentation to avoid read by screen readers', async () => {
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

    expect(within(helpDeskChat).getByRole('presentation')).toBeInTheDocument()
  })

  it('should set focus on continuar consulta button when user open the finish confirmation overlay', async () => {
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
      await within(helpDeskChat).findByRole('button', {
        name: 'Continue my inquiry',
      }),
    ).toHaveFocus()
  })

  it('should have a focus trap between buttons in the finish confirmation overlay', async () => {
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

    tabOnwards()
    tabOnwards()

    expect(
      screen.getByRole('button', { name: 'Continue my inquiry' }),
    ).toHaveFocus()
  })

  it('should have the focus on Finalizar conversacion button when open the finish confirmation overlay and press Shift + Tab', async () => {
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

    tabBackwards()

    expect(
      screen.getByRole('button', { name: 'End conversation' }),
    ).toHaveFocus()
  })

  it('should have aria expanded in floating button when open the chat', async () => {
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
    await within(helpDeskChat).findByText('Hola! ¿cómo podemos ayudarte?')

    expect(
      await screen.findByRole('button', {
        name: /Minimise chat/i,
        expanded: true,
      }),
    ).toBeInTheDocument()
  })

  it('should have aria expanded FALSE in floating button when minimize the chat', async () => {
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
    await within(helpDeskChat).findByText('Hola! ¿cómo podemos ayudarte?')

    minimizeHelpDeskChatWithFloatingButton()

    expect(
      await screen.findByRole('button', {
        name: /Open chat/i,
        expanded: false,
      }),
    ).toBeInTheDocument()
  })

  it('should have the right accesible name the exit door image in the finish confirmation overlay', async () => {
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
    const exitDoorImage = await within(helpDeskChat).findByRole('img', {
      name: 'Exit door',
    })

    expect(exitDoorImage).toBeInTheDocument()
  })

  describe('VoiceOver accessibility', () => {
    it('should announce new incoming messages from agent', async () => {
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
        ChatEventMother.agentTextMessage('Mensaje del agente'),
      )
      within(messages).findByText('Mensaje del agente')
      const ariaLivePortal = await screen.findByTestId('aria-live-portal')
      const voiceOverMessage =
        await within(ariaLivePortal).findByText('Mensaje del agente')

      expect(voiceOverMessage).toBeInTheDocument()
    })

    it('should not announce new messages sent by the user', async () => {
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

      emitMessageHelDeskChat(ChatEventMother.userMessage('Mensaje de usuario'))
      within(messages).findByText('Mensaje de usuario')
      const ariaLivePortal = await screen.findByTestId('aria-live-portal')
      const voiceOverMessage =
        await within(ariaLivePortal).queryByText('Mensaje de usuario')

      expect(voiceOverMessage).not.toBeInTheDocument()
    })
  })
})
