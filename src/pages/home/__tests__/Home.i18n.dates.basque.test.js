import { screen } from '@testing-library/react'

import { openLanguageSelector, selectLanguage } from '../../helpers'
import { vi } from 'vitest'
import { wrap } from 'wrapito'

import { App } from 'app.jsx'
import {
  homeWithWidgetsEN,
  homeWithWidgetsEU,
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

it('should see the dates in Basque format', async () => {
  const responses = [
    {
      path: '/customers/1/home/?lang=en&wh=vlc1',
      responseBody: homeWithWidgetsEN,
      catchParams: true,
    },
    {
      path: '/customers/1/home/?lang=eu&wh=vlc1',
      responseBody: homeWithWidgetsEU,
      catchParams: true,
    },
  ]
  wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

  await screen.findByText('Next delivery')
  openLanguageSelector()
  selectLanguage('Basque')
  await screen.findByText('Hurrengo entrega')

  expect(screen.getByText('Larunbata 20 ekaina')).toBeInTheDocument()
  expect(screen.getByText('Entrega-ordutegia: 09:00-10:00')).toBeInTheDocument()
})
