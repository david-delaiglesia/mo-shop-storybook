import { screen } from '@testing-library/react'

import { openLanguageSelector, selectLanguage } from '../../helpers'
import { openLoggedUserDropdown } from './helpers'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { wrap } from 'wrapito'

import { App } from 'app.jsx'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
import { goToFAQs } from 'pages/helpers'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')
vi.mock('app/i18n/service', () => {
  return {
    fetchLocaleByLanguage: (selectedLanguage) => {
      const locale = vi.importActual(
        `./../../../../public/locales/${selectedLanguage}`,
      )
      return Promise.resolve(locale)
    },
  }
})

describe('Home - Account menu', () => {
  it('should open the FAQs page in English', async () => {
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithGrid },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()
    await screen.findByText('Novedades')

    openLoggedUserDropdown('John')
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
      { path: '/customers/1/home/', responseBody: homeWithGrid },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()
    await screen.findByText('Novedades')

    openLanguageSelector()
    selectLanguage('Valencian')
    await screen.findByText('Categories')
    userEvent.click(await screen.findByRole('button', { name: 'Hola John' }))
    const FAQLink = screen.getByRole('link', { name: 'Preguntes freqüents' })
    userEvent.click(FAQLink)

    expect(FAQLink).toHaveAttribute(
      'href',
      'https://mercadona.zendesk.com/hc/es',
    )
    expect(Tracker.sendInteraction).toHaveBeenCalledWith('faq_click')
  })
})
