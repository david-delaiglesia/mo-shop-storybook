import { screen } from '@testing-library/react'

import { openLanguageSelector, selectLanguage } from '../../helpers'
import { vi } from 'vitest'
import { wrap } from 'wrapito'

import { App } from 'app.jsx'
import {
  homeWithWidgetsEN,
  homeWithWidgetsVAI,
} from 'app/catalog/__scenarios__/home'

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

it('should see the dates in Valencian format', async () => {
  const responses = [
    {
      path: '/customers/1/home/?lang=en&wh=vlc1',
      responseBody: homeWithWidgetsEN,
      catchParams: true,
    },
    {
      path: '/customers/1/home/?lang=vai&wh=vlc1',
      responseBody: homeWithWidgetsVAI,
      catchParams: true,
    },
  ]
  wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

  await screen.findByText('Next delivery')
  openLanguageSelector()
  selectLanguage('Valencian')
  await screen.findByText('Pròxima entrega')

  expect(screen.getByText('Dissabte 20 juny')).toBeInTheDocument()
  expect(screen.getByText('Entrega de 09:00 a 10:00')).toBeInTheDocument()
})
