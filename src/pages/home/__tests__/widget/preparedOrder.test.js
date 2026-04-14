import { screen } from '@testing-library/react'

import MockDate from 'mockdate'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import {
  homeWithPreparedNotPaidWidget,
  homeWithPreparedWidget,
} from 'app/catalog/__scenarios__/home'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

configure({
  changeRoute: (route) => history.push(route),
})

it('for tomorrows orders should display that the delivery is going to be tomorrow', async () => {
  MockDate.set(new Date('2020-05-20T21:00:00Z'))
  wrap(App)
    .atPath('/')
    .withNetwork([
      {
        path: '/customers/1/home/',
        responseBody: homeWithPreparedWidget,
      },
    ])
    .withLogin()
    .mount()

  await screen.findByText('Próxima entrega')

  expect(screen.getByTestId('purchase-status-image')).toBeInTheDocument()
  expect(screen.getByText('Order 1003')).toBeInTheDocument()
  expect(screen.getByText('Prepared')).toBeInTheDocument()
  expect(
    screen.getByText('Delivery tomorrow from 09:00 to 10:00'),
  ).toBeInTheDocument()
  expect(screen.getByText('See order')).toBeInTheDocument()
  expect(screen.getByText('See ticket')).toBeInTheDocument()
  expect(screen.queryByText('Modify')).not.toBeInTheDocument()
})

it('for todays orders should display that the delivery is going to be today', async () => {
  MockDate.set(new Date('2020-06-20T21:00:00Z'))
  wrap(App)
    .atPath('/')
    .withNetwork([
      {
        path: '/customers/1/home/',
        responseBody: homeWithPreparedWidget,
      },
    ])
    .withLogin()
    .mount()

  await screen.findByText('Próxima entrega')

  expect(screen.getByTestId('purchase-status-image')).toBeInTheDocument()
  expect(screen.getByText('Order 1003')).toBeInTheDocument()
  expect(screen.getByText('Prepared')).toBeInTheDocument()
  expect(
    screen.getByText('Delivery today from 09:00 to 10:00'),
  ).toBeInTheDocument()
  expect(screen.getByText('See order')).toBeInTheDocument()
  expect(screen.getByText('See ticket')).toBeInTheDocument()
  expect(screen.queryByText('Modify')).not.toBeInTheDocument()
})

it('should not show see ticket button for prepared but not paid orders', async () => {
  MockDate.set(new Date('2020-06-20T21:00:00Z'))
  wrap(App)
    .atPath('/')
    .withNetwork([
      {
        path: '/customers/1/home/',
        responseBody: homeWithPreparedNotPaidWidget,
      },
    ])
    .withLogin()
    .mount()

  await screen.findByText('Próxima entrega')

  expect(screen.getByTestId('purchase-status-image')).toBeInTheDocument()
  expect(screen.getByText('Order 1009')).toBeInTheDocument()
  expect(screen.getByText('Prepared')).toBeInTheDocument()
  expect(
    screen.getByText('Delivery today from 09:00 to 10:00'),
  ).toBeInTheDocument()
  expect(screen.getByText('See order')).toBeInTheDocument()
  expect(screen.queryByText('See ticket')).not.toBeInTheDocument()
  expect(screen.queryByText('Modify')).not.toBeInTheDocument()
})
