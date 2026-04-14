import { screen, within } from '@testing-library/react'

import { NetworkResponses, wrap } from 'wrapito'

import { activeFeatureFlags } from '__tests__/helpers'
import { App } from 'app'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
import { ChatSetupMother } from 'app/chat/__scenarios__/ChatSetupMother'
import {
  minimizeHelpDeskChatWithFloatingButton,
  minimizeHelpDeskChatWithHeaderButton,
  openHelpDeskChat,
} from 'pages/home/__tests__/helpers'
import { knownFeatureFlags } from 'services/feature-flags'

vi.unmock('@mercadona/mo.library.web-services/cookies')
vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Home - Chat - Open/Close', () => {
  beforeEach(() => {
    activeFeatureFlags([knownFeatureFlags.NEW_SUPPORT_CHAT])
  })

  it('should open the chat on floating button click', async () => {
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

    expect(helpDeskChat).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Minimise chat', expanded: true }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /Open chat/i }),
    ).not.toBeInTheDocument()
  })

  it('should minimize the chat on floating button click', async () => {
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

    expect(screen.queryByLabelText('Customer service')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Minimise chat' }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Open chat/i }),
    ).toBeInTheDocument()
  })

  it('should minimize the chat on header button click', async () => {
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

    expect(screen.queryByLabelText('Customer service')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Minimise chat', expanded: true }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Open chat/i }),
    ).toBeInTheDocument()
  })

  it('should setup the chat only once when user open and minimize multiple times the chat', async () => {
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
    openHelpDeskChat()
    await within(helpDeskChat).findByText('Hola! ¿cómo podemos ayudarte?')

    expect('/conversations/chats/setup/').toHaveBeenFetchedTimes(1)
  })
})
