import { screen, within } from '@testing-library/react'

import { openHelpDeskChat, openPrivacyPolicyFromHelpDeskChat } from '../helpers'
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

describe('Home - Chat - Privacy Link Metric', () => {
  beforeEach(() => {
    activeFeatureFlags([knownFeatureFlags.NEW_SUPPORT_CHAT])
  })

  it('should send a metric when use click on privacy policy link', async () => {
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

    openPrivacyPolicyFromHelpDeskChat()

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'chat_privacy_link_clicked',
    )
  })
})
