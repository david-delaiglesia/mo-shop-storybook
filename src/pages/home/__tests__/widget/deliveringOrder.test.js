import { screen } from '@testing-library/react'

import MockDate from 'mockdate'
import { vi } from 'vitest'
import { wrap } from 'wrapito'

import { App } from 'app.jsx'
import { homeWithDeliveringWidget } from 'app/catalog/__scenarios__/home'
import { cloneDeep } from 'utils/objects'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

afterEach(() => {
  MockDate.reset()
})

it('should show the delivering today message', async () => {
  MockDate.set(new Date('2020-08-25T19:00:00Z'))
  wrap(App)
    .atPath('/')
    .withNetwork([
      {
        path: '/customers/1/home/',
        responseBody: homeWithDeliveringWidget,
      },
    ])
    .withLogin()
    .mount()

  await screen.findByText('Próxima entrega')

  expect(screen.getByTestId('purchase-status-image')).toBeInTheDocument()
  expect(screen.getByText('Order 1004')).toBeInTheDocument()
  expect(screen.getByText('Out for delivery')).toBeInTheDocument()
  expect(
    screen.getByText('Delivery today from 21:00 to 22:00'),
  ).toBeInTheDocument()
  expect(screen.getByText('See order')).toBeInTheDocument()
  expect(screen.queryByText('Modify')).not.toBeInTheDocument()
  expect(screen.getByText('See ticket')).toBeInTheDocument()
})

it('should display the correct message when delivering for a future date', async () => {
  MockDate.set(new Date('2020-08-25T19:00:00Z'))
  const homeWithDeliveringWidgetClone = cloneDeep(homeWithDeliveringWidget)
  homeWithDeliveringWidgetClone.sections[0].content.items[0].start_date =
    '2020-08-26T19:00:00Z'
  homeWithDeliveringWidgetClone.sections[0].content.items[0].end_date =
    '2020-08-26T20:00:00Z'
  wrap(App)
    .atPath('/')
    .withNetwork([
      {
        path: '/customers/1/home/',
        responseBody: homeWithDeliveringWidgetClone,
      },
    ])
    .withLogin()
    .mount()

  await screen.findByText('Próxima entrega')

  expect(screen.getByText('Wednesday 26 august')).toBeInTheDocument()
  expect(screen.getByText('Delivery from 21:00 to 22:00')).toBeInTheDocument()
})

it('should display the correct message when delivering for a past date', async () => {
  MockDate.set(new Date('2020-08-25T19:00:00Z'))
  const homeWithDeliveringWidgetClone = cloneDeep(homeWithDeliveringWidget)
  homeWithDeliveringWidgetClone.sections[0].content.items[0].start_date =
    '2020-08-24T19:00:00Z'
  homeWithDeliveringWidgetClone.sections[0].content.items[0].end_date =
    '2020-08-24T20:00:00Z'
  wrap(App)
    .atPath('/')
    .withNetwork([
      {
        path: '/customers/1/home/',
        responseBody: homeWithDeliveringWidgetClone,
      },
    ])
    .withLogin()
    .mount()

  await screen.findByText('Próxima entrega')

  expect(screen.getByText('Monday 24 august')).toBeInTheDocument()
  expect(screen.getByText('Delivery from 21:00 to 22:00')).toBeInTheDocument()
})
