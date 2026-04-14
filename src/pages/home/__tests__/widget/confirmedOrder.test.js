import { screen } from '@testing-library/react'

import { vi } from 'vitest'
import { wrap } from 'wrapito'

import { App } from 'app.jsx'
import {
  homeWithConfirmedWidget,
  homeWithPreparingWidget,
} from 'app/catalog/__scenarios__/home'
import { openLanguageSelector, selectLanguage } from 'pages/helpers'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

it('should show the new content', async () => {
  wrap(App)
    .atPath('/')
    .withNetwork([
      {
        path: '/customers/1/home/',
        responseBody: homeWithConfirmedWidget,
      },
    ])
    .withLogin()
    .mount()

  await screen.findByText('Próxima entrega')

  expect(screen.queryByText('Confirmed')).not.toBeInTheDocument()
  expect(screen.getByText('Saturday 20 june')).toBeInTheDocument()
  expect(screen.getByText('Delivery from 09:00 to 10:00')).toBeInTheDocument()
})

it('should show the usual content if we are not displaying a confirmed order', async () => {
  wrap(App)
    .atPath('/')
    .withNetwork([
      {
        path: '/customers/1/home/',
        responseBody: homeWithPreparingWidget,
      },
    ])
    .withLogin()
    .mount()

  await screen.findByText('Próxima entrega')

  expect(screen.queryByText('Preparing')).toBeInTheDocument()
})

it('should display the first letter fo the day name in upper case', async () => {
  wrap(App)
    .atPath('/')
    .withNetwork([
      {
        path: '/customers/1/home/',
        responseBody: homeWithConfirmedWidget,
      },
    ])
    .withLogin()
    .mount()

  await screen.findByText('Próxima entrega')
  openLanguageSelector()
  selectLanguage('Valencian')
  await screen.findByText('Próxima entrega')

  expect(screen.getByText('Dissabte 20 juny')).toBeInTheDocument()
})
