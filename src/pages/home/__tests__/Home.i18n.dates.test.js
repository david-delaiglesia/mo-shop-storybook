import { screen } from '@testing-library/react'

import { openLanguageSelector, selectLanguage } from '../../helpers'
import { vi } from 'vitest'
import { wrap } from 'wrapito'

import { App } from 'app.jsx'
import {
  homeWithConfirmedWidget,
  homeWithWidgetsEN,
  homeWithWidgetsES,
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

describe('Home - i18n - dates', () => {
  it('should see the dates in English format', async () => {
    const responses = [
      {
        path: '/customers/1/home/?lang=en&wh=vlc1',
        responseBody: homeWithConfirmedWidget,
        catchParams: true,
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Próxima entrega')

    expect(screen.getByText('Saturday 20 june'))
    expect(screen.getByText('Delivery from 09:00 to 10:00'))
  })

  it('should see the dates in Spanish format', async () => {
    const responses = [
      {
        path: '/customers/1/home/?lang=en&wh=vlc1',
        responseBody: homeWithWidgetsEN,
        catchParams: true,
      },
      {
        path: '/customers/1/home/?lang=es&wh=vlc1',
        responseBody: homeWithWidgetsES,
        catchParams: true,
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Next delivery')
    openLanguageSelector()
    selectLanguage('Spanish')
    await screen.findByText('Próxima entrega')

    expect(screen.getByText('Sábado 20 junio'))
    expect(screen.getByText('Entrega de 09:00 a 10:00'))
  })
})
