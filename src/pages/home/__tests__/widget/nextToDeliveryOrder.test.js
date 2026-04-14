import { screen } from '@testing-library/react'

import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { homeWithNextToDeliveryWidget } from 'app/catalog/__scenarios__/home'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

configure({
  changeRoute: (route) => history.push(route),
})

it('should show the next to delivery order widget section', async () => {
  wrap(App)
    .atPath('/')
    .withNetwork([
      {
        path: '/customers/1/home/',
        responseBody: homeWithNextToDeliveryWidget,
      },
    ])
    .withLogin()
    .mount()

  await screen.findByText('Próxima entrega')

  expect(screen.getByTestId('purchase-status-image')).toBeInTheDocument()
  expect(screen.getByText('Order 1004')).toBeInTheDocument()
  expect(screen.getByText('On the way')).toBeInTheDocument()
  expect(
    screen.getByText('Your order is next in line for delivery'),
  ).toBeInTheDocument()
  expect(screen.getByText('See order')).toBeInTheDocument()
  expect(screen.queryByText('Modify')).not.toBeInTheDocument()
  expect(screen.getByText('See ticket')).toBeInTheDocument()
})
