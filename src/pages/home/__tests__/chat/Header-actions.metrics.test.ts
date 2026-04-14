import { screen, within } from '@testing-library/react'

import { NetworkResponses, wrap } from 'wrapito'

import { activeFeatureFlags } from '__tests__/helpers'
import { App } from 'app'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
import { ChatSetupMother } from 'app/chat/__scenarios__/ChatSetupMother'
import {
  openContextualOptions,
  openHelpDeskChat,
  toggleHelpDeskChatSoundEffects,
} from 'pages/home/__tests__/helpers'
import { knownFeatureFlags } from 'services/feature-flags'
import { Tracker } from 'services/tracker'

vi.unmock('@mercadona/mo.library.web-services/cookies')
vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

it('should track event on toggle sound when toggling the contextual menu option', async () => {
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
  toggleHelpDeskChatSoundEffects()
  await within(contextualMenu).findByRole('menuitem', {
    name: 'Unmute sound',
  })

  expect(Tracker.sendInteraction).toHaveBeenCalledWith('chat_sound_toggled', {
    status: 'off',
    chat_id: 'chat-id',
  })

  toggleHelpDeskChatSoundEffects()
  await within(contextualMenu).findByRole('menuitem', {
    name: 'Mute sound',
  })

  expect(Tracker.sendInteraction).toHaveBeenCalledWith('chat_sound_toggled', {
    status: 'on',
    chat_id: 'chat-id',
  })
})
