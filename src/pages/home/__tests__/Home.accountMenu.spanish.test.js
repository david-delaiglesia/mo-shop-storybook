import { screen } from '@testing-library/react'

import { openLanguageSelector, selectLanguage } from '../../helpers'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { wrap } from 'wrapito'

import { App } from 'app.jsx'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
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

it('should open the FAQs page in current language', async () => {
  const responses = [{ path: '/customers/1/home/', responseBody: homeWithGrid }]
  wrap(App).atPath('/').withNetwork(responses).withLogin().mount()
  await screen.findByText('Novedades')

  openLanguageSelector()
  selectLanguage('Spanish')
  await screen.findByText('Categorías')
  userEvent.click(screen.getByRole('button', { name: 'Hola John' }))
  const FAQLink = screen.getByRole('link', { name: 'Preguntas frecuentes' })
  userEvent.click(FAQLink)

  expect(FAQLink).toHaveAttribute('href', 'https://mercadona.zendesk.com/hc/es')
  expect(Tracker.sendInteraction).toHaveBeenCalledWith('faq_click')
})
