import { within } from '@testing-library/react'
import { screen } from '@testing-library/react'

import {
  minimizeHelpDeskChatWithFloatingButton,
  minimizeHelpDeskChatWithHeaderButton,
  openHelpDeskChat,
} from '../helpers'
import { NetworkResponses, wrap } from 'wrapito'

import { activeFeatureFlags } from '__tests__/helpers'
import { App } from 'app'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
import { ChatSetupMother } from 'app/chat/__scenarios__/ChatSetupMother'
import { knownFeatureFlags } from 'services/feature-flags/constants'
import { Tracker } from 'services/tracker'

vi.unmock('@mercadona/mo.library.web-services/cookies')
vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Home - Chat - Open/Close Metrics', () => {
  beforeEach(() => {
    activeFeatureFlags([knownFeatureFlags.NEW_SUPPORT_CHAT])
  })

  it('should send the chat widget click metric when open the chat using the floating button', async () => {
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

    expect(Tracker.sendInteraction).toHaveBeenCalledWith('chat_widget_click', {
      view: '/',
    })
  })

  it('should send the chat minimize metric when user minimize the chat using the minimize button in the chat header', async () => {
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

    expect(Tracker.sendInteraction).toHaveBeenCalledWith('chat_minimize', {
      view: '/',
      source: 'minimize_button',
    })
  })

  it('should send the chat minimize metric when the chat is minimized using the floating button', async () => {
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

    expect(Tracker.sendInteraction).toHaveBeenCalledWith('chat_minimize', {
      view: '/',
      source: 'floating_button',
    })
  })
})
