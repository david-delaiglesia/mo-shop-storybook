import { screen, waitFor, within } from '@testing-library/react'

import {
  closeHelpDeskChat,
  finishHelpDeskChat,
  openHelpDeskChat,
} from '../helpers'
import { NetworkResponses, configure, wrap } from 'wrapito'

import { activeFeatureFlags } from '__tests__/helpers'
import { App, history } from 'app'
import {
  homeWithDelayedWidget,
  homeWithGrid,
} from 'app/catalog/__scenarios__/home'
import { ChatSetupMother } from 'app/chat/__scenarios__/ChatSetupMother'
import {
  serviceRating,
  thankYouStep,
} from 'app/service-rating/__scenarios__/serviceRating'
import {
  openChatFromHelp,
  openChatFromLogin,
  openChatFromOrderWidget,
  openChatFromUserMenu,
} from 'pages/__tests__/helpers/chat'
import { openAccountDropdown, openSignInModal } from 'pages/helpers'
import { openACMOChat } from 'pages/service-rating/__tests__/helpers'
import { knownFeatureFlags } from 'services/feature-flags/constants'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Chat Open Metric', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  beforeEach(() => {
    localStorage.clear()
    activeFeatureFlags([knownFeatureFlags.NEW_SUPPORT_CHAT])
  })

  it('should send the chat open metric with the correct source when opening the chat from the user menu', async () => {
    const responses: NetworkResponses = [
      { path: '/home/', responseBody: homeWithGrid },
      {
        path: '/conversations/chats/setup/',
        method: 'post',
        requestBody: {
          anonymous_id: '10000000-1000-4000-8000-100000000000',
        },
        responseBody: ChatSetupMother.default(),
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).mount()

    await screen.findByText('Novedades')
    openAccountDropdown()
    openChatFromUserMenu()

    expect(Tracker.sendInteraction).toHaveBeenCalledWith('chat_help_click', {
      view: '/',
      source: 'user_menu',
    })
  })

  it('should send the chat open metric with the correct source when opening the chat from the password recovery', async () => {
    const responses: NetworkResponses = [
      {
        path: '/conversations/chats/setup/',
        method: 'post',
        requestBody: {
          anonymous_id: '10000000-1000-4000-8000-100000000000',
        },
        responseBody: ChatSetupMother.default(),
      },
    ]
    wrap(App).atPath('/password-recovery/12345').withNetwork(responses).mount()

    await screen.findAllByText('Reset password')

    openChatFromHelp()

    expect(Tracker.sendInteraction).toHaveBeenCalledWith('chat_help_click', {
      view: '/password-recovery/12345',
      source: 'restore_password',
    })
  })

  it('should send the chat open metric with the correct source when opening the chat from the login', async () => {
    const responses: NetworkResponses = [
      { path: '/home/', responseBody: homeWithGrid },
      {
        path: '/conversations/chats/setup/',
        method: 'post',
        requestBody: {
          anonymous_id: '10000000-1000-4000-8000-100000000000',
        },
        responseBody: ChatSetupMother.default(),
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).mount()

    await screen.findByText('Novedades')
    openAccountDropdown()
    openSignInModal()
    openChatFromLogin()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith('chat_help_click', {
      view: '/',
      source: 'login',
    })
  })

  it('should send the chat open metric with the correct source when opening the chat from the service rating', async () => {
    const token = '12345'
    const responses: NetworkResponses = [
      {
        path: `/service-rating/${token}/`,
        responseBody: serviceRating,
      },
      {
        path: `/service-rating/${token}/steps/1/`,
        responseBody: thankYouStep,
      },
      { path: '/customers/1/home/', responseBody: homeWithGrid },
      {
        path: '/conversations/chats/setup/',
        method: 'post',
        requestBody: {
          user_id: '1',
          events: [
            {
              message:
                'Id pedido: 50331 \n\n Entrega impuntual > Tarde \n\n Ha llegado tarde',
            },
          ],
        },
        responseBody: ChatSetupMother.withUserMessage(
          'Id pedido: 50331 \n\n Entrega impuntual > Tarde \n\n Ha llegado tarde',
        ),
      },
    ]
    wrap(App)
      .atPath(`/service-rating/${token}`)
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Gracias por tu opinión')
    openACMOChat()

    expect(Tracker.sendInteraction).toHaveBeenCalledWith('chat_help_click', {
      view: `/service-rating/${token}`,
      source: 'service_rating',
    })
  })

  it('should send the chat open metric with the correct source when opening the chat from the help page', async () => {
    const responses: NetworkResponses = [
      { path: '/home/', responseBody: homeWithGrid },
      {
        path: '/conversations/chats/setup/',
        method: 'post',
        requestBody: {
          anonymous_id: '10000000-1000-4000-8000-100000000000',
        },
        responseBody: ChatSetupMother.default(),
      },
    ]
    wrap(App).atPath('/help').withNetwork(responses).mount()

    await screen.findByText('Novedades')

    const helpDeskChat = await screen.findByLabelText('Customer service')
    await within(helpDeskChat).findByRole('log')

    expect(Tracker.sendInteraction).toHaveBeenCalledWith('chat_help_click', {
      view: '/help',
      source: 'help',
    })
  })

  it('should send the chat open metric with the correct source when opening the chat from the pending order', async () => {
    const responses: NetworkResponses = [
      { path: '/customers/1/home/', responseBody: homeWithDelayedWidget },
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

    await screen.findByText('Próxima entrega')
    openChatFromOrderWidget(
      'Order 1008, Incident with the deliveryThere has been a problem',
    )
    const helpDeskChat = await screen.findByLabelText('Customer service')
    await within(helpDeskChat).findByRole('log')

    expect(Tracker.sendInteraction).toHaveBeenCalledWith('chat_help_click', {
      view: '/',
      source: 'pending_order',
    })
  })

  it('should send the chat open new conversation metric when the user starts a new chat after finishing another one', async () => {
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

    await waitFor(() => {
      expect(
        screen.queryByLabelText('Customer service'),
      ).not.toBeInTheDocument()
    })

    openHelpDeskChat()
    const reopenedChat = await screen.findByLabelText('Customer service')
    await within(reopenedChat).findByRole('log')

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'chat_open_new_conversation',
    )
  })
})
