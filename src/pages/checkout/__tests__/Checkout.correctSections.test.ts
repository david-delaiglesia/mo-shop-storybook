import { screen, within } from '@testing-library/react'

import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { CheckoutMother } from 'app/checkout/__scenarios__/CheckoutMother'
import { cookies } from 'app/cookie/__scenarios__/cookies'
import { order } from 'app/order/__scenarios__/orderDetail'
import { Cookie } from 'services/cookie'
import { Storage } from 'services/storage'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

configure({
  changeRoute: (route) => history.push(route),
})

beforeEach(() => {
  vi.spyOn(Cookie, 'get').mockImplementation((cookie) => cookies[cookie])
})

afterEach(() => {
  vi.clearAllMocks()
  Storage.clear()
})

it('displays the correct sections for an existing checkout', async () => {
  wrap(App)
    .atPath('/checkout/5')
    .withNetwork([
      {
        path: '/customers/1/checkouts/5/',
        responseBody: CheckoutMother.filled(),
      },
      { path: '/customers/1/orders/', responseBody: { results: [] } },
      {
        path: '/customers/1/checkouts/5/orders/',
        method: 'post',
      },
      {
        path: '/customers/1/orders/5/',
        responseBody: order,
      },
    ])
    .withLogin()
    .mount()

  await screen.findByRole('heading', { name: 'Checkout', level: 1 })

  const deliverySection = screen.getByRole('region', { name: 'Delivery' })
  expect(
    within(deliverySection).getByRole('heading', {
      name: 'Delivery',
      level: 2,
    }),
  ).toBeInTheDocument()
  expect(deliverySection).not.toHaveAttribute('aria-disabled')

  const contactSection = screen.getByRole('region', { name: 'Phone' })
  expect(
    within(contactSection).getByRole('heading', {
      name: 'Phone',
      level: 2,
    }),
  ).toBeInTheDocument()
  expect(contactSection).toHaveAttribute('aria-disabled', 'false')

  const paymentSection = screen.getByRole('region', { name: 'Payment method' })
  expect(
    within(paymentSection).getByRole('heading', {
      name: 'Payment method',
      level: 2,
    }),
  ).toBeInTheDocument()
  expect(paymentSection).toHaveAttribute('aria-disabled', 'false')

  const summarySection = screen.getByRole('region', { name: 'Summary' })
  expect(
    within(summarySection).getByRole('heading', {
      name: 'Summary',
      level: 2,
    }),
  ).toBeInTheDocument()
})
