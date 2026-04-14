import { screen, within } from '@testing-library/react'

import { openLanguageSelector, selectLanguage } from '../../helpers'
import { goToFAQs } from './helpers'
import userEvent from '@testing-library/user-event'
import i18n from 'i18next'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { cookies } from 'app/cookie/__scenarios__/cookies'
import { emptyOrderList } from 'app/order/__scenarios__/orderList'
import { Cookie } from 'services/cookie'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')
vi.mock('app/i18n/service', async () => {
  return {
    fetchLocaleByLanguage: async (selectedLanguage) => {
      const locale = await vi.importActual(
        `./../../../../public/locales/${selectedLanguage}`,
      )
      return Promise.resolve(locale)
    },
  }
})

vi.spyOn(Cookie, 'get').mockImplementation((cookie) => cookies[cookie])

describe('User area - FAQs link', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  beforeEach(() => {
    i18n.isInitialized = false
  })

  it('should open the FAQs page in English', async () => {
    const responses = [
      { path: '/customers/1/orders/', responseBody: emptyOrderList },
    ]
    wrap(App)
      .atPath('/user-area/orders')
      .withNetwork(responses)
      .withLogin()
      .mount()
    await screen.findByText('My orders')

    const FAQLink = screen.getByRole('link', { name: 'FAQ' })
    goToFAQs()

    expect(FAQLink).toHaveAttribute(
      'href',
      'https://mercadona.zendesk.com/hc/en-us',
    )
    expect(Tracker.sendInteraction).toHaveBeenCalledWith('faq_click')
  })

  it('should open the FAQs page in Valenciano', async () => {
    const responses = [
      { path: '/customers/1/orders/', responseBody: emptyOrderList },
    ]
    wrap(App)
      .atPath('/user-area/orders')
      .withNetwork(responses)
      .withLogin()
      .mount()
    await screen.findByText('My orders')

    openLanguageSelector()
    selectLanguage('Valencian')
    await screen.findByText('Les meues comandes')
    userEvent.click(screen.getByRole('button', { name: 'Hola John' }))
    const FAQLink = within(screen.getAllByRole('complementary')[0]).getByRole(
      'link',
      { name: 'Preguntes freqüents' },
    )
    userEvent.click(FAQLink)

    expect(FAQLink).toHaveAttribute(
      'href',
      'https://mercadona.zendesk.com/hc/es',
    )
    expect(Tracker.sendInteraction).toHaveBeenCalledWith('faq_click')
  })
})
