import { screen, within } from '@testing-library/react'

import { NetworkResponses, wrap } from 'wrapito'

import { activeFeatureFlags } from '__tests__/helpers'
import { App } from 'app'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
import { ChatSetupMother } from 'app/chat/__scenarios__/ChatSetupMother'
import {
  closeHelpDeskChatFromContextualMenu,
  openContextualOptions,
  openHelpDeskChat,
  userClickOutsideChat,
} from 'pages/home/__tests__/helpers'
import { knownFeatureFlags } from 'services/feature-flags'

vi.unmock('@mercadona/mo.library.web-services/cookies')
vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Home - Chat - Open/Close', () => {
  beforeEach(() => {
    activeFeatureFlags([knownFeatureFlags.NEW_SUPPORT_CHAT])
  })

  it('should close the contextual options menu when clicking outside of it', async () => {
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
    userClickOutsideChat()

    expect(within(helpDeskChat).queryByRole('menu')).not.toBeInTheDocument()
  })

  it('should open the contextual options menu containing its expected menu items', async () => {
    activeFeatureFlags([
      knownFeatureFlags.NEW_SUPPORT_CHAT,
      knownFeatureFlags.WEB_NEW_SUPPORT_CHAT_TOGGLE_SOUND,
    ])

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
    expect(contextualMenu).toBeInTheDocument()
    const closeConversationOption = within(contextualMenu).getByRole(
      'menuitem',
      { name: 'End chat' },
    )
    const toggleSoundOption = within(contextualMenu).getByRole('menuitem', {
      name: 'Mute sound',
    })

    expect(closeConversationOption).toBeInTheDocument()
    expect(within(closeConversationOption).getByRole('img')).toBeInTheDocument()
    expect(toggleSoundOption).toBeInTheDocument()
  })

  it('should open the contextual options menu containing its expected menu items (remove with web_new_support_chat_toggle_sound)', async () => {
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
    expect(contextualMenu).toBeInTheDocument()
    const closeConversationOption = within(contextualMenu).getByRole(
      'menuitem',
      { name: 'End chat' },
    )

    const toggleSoundOption = within(contextualMenu).queryByRole('menuitem', {
      name: 'Mute sound',
    })

    expect(closeConversationOption).toBeInTheDocument()
    expect(within(closeConversationOption).getByRole('img')).toBeInTheDocument()
    expect(toggleSoundOption).not.toBeInTheDocument()
  })

  it('should open the close conversation overlay from the contextual menu option', async () => {
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
    closeHelpDeskChatFromContextualMenu()

    expect(
      await within(helpDeskChat).findByRole('button', {
        name: 'End conversation',
      }),
    ).toBeInTheDocument()
    expect(within(helpDeskChat).queryByRole('menu')).not.toBeInTheDocument()
  })
})
