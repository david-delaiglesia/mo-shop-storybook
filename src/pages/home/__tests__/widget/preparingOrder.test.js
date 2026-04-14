import { screen } from '@testing-library/react'

import MockDate from 'mockdate'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { homeWithPreparingWidget } from 'app/catalog/__scenarios__/home'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

configure({
  changeRoute: (route) => history.push(route),
})

it('should show the preparing order widget section for tomorrow', async () => {
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

  expect(screen.getByTestId('purchase-status-image')).toBeInTheDocument()
  expect(screen.getByText('Order 1002')).toBeInTheDocument()
  expect(screen.getByText('Preparing')).toBeInTheDocument()
  expect(
    screen.getByText('Delivery tomorrow from 16:00 to 17:00'),
  ).toBeInTheDocument()
  expect(screen.getByText('See order')).toBeInTheDocument()
  expect(screen.queryByText('Modify')).not.toBeInTheDocument()
  expect(screen.queryByText('See ticket')).not.toBeInTheDocument()
})

it('should show the preparing order widget section for tomorrow', async () => {
  MockDate.set(new Date('2020-08-26T11:00:00Z'))
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

  expect(screen.getByTestId('purchase-status-image')).toBeInTheDocument()
  expect(screen.getByText('Order 1002')).toBeInTheDocument()
  expect(screen.getByText('Preparing')).toBeInTheDocument()
  expect(
    screen.getByText('Delivery today from 16:00 to 17:00'),
  ).toBeInTheDocument()
  expect(screen.getByText('See order')).toBeInTheDocument()
  expect(screen.queryByText('Modify')).not.toBeInTheDocument()
  expect(screen.queryByText('See ticket')).not.toBeInTheDocument()
})
