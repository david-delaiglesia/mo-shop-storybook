import { screen } from '@testing-library/react'

import { createCheckout, goBack } from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { expensiveCart } from 'app/cart/__scenarios__/cart'
import { homeWithWidgets } from 'app/catalog/__scenarios__/home'
import { CheckoutMother } from 'app/checkout/__scenarios__/CheckoutMother'
import { Storage } from 'services/storage'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('CreateCheckout - Bizum support', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    Storage.clear()
  })

  it('should create the a second checkout with the proper url', async () => {
    wrap(App)
      .atPath('/')
      .withNetwork([
        { path: '/customers/1/home/', responseBody: homeWithWidgets },
        {
          path: '/customers/1/checkouts/',
          method: 'post',
          requestBody: {
            cart: {
              id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
              lines: [{ quantity: 200, product_id: '8731', sources: [] }],
            },
          },
          multipleResponses: [
            { responseBody: CheckoutMother.default() },
            { responseBody: { ...CheckoutMother.default(), id: 123 } },
          ],
        },
        { path: '/customers/1/orders/', responseBody: { results: [] } },
        {
          path: '/customers/1/checkouts/5/',
          responseBody: CheckoutMother.default(),
        },
        {
          path: '/customers/1/checkouts/123/',
          responseBody: { ...CheckoutMother.default(), id: 123 },
        },
      ])
      .withLogin({ cart: expensiveCart })
      .mount()

    await screen.findByLabelText('Home')
    createCheckout()
    await screen.findByText('Summary')
    goBack()
    await screen.findByLabelText('Home')
    createCheckout()
    await screen.findByText('Summary')

    expect(window.location.pathname).toBe('/checkout/123')
  })

  it('should create a valid checkout with the proper url', async () => {
    wrap(App)
      .atPath('/')
      .withNetwork([
        { path: '/customers/1/home/', responseBody: homeWithWidgets },
        {
          path: '/customers/1/checkouts/',
          method: 'post',
          requestBody: {
            cart: {
              id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
              lines: [{ quantity: 200, product_id: '8731', sources: [] }],
            },
          },
          responseBody: CheckoutMother.default(),
        },
        { path: '/customers/1/orders/', responseBody: { results: [] } },
        {
          path: '/customers/1/checkouts/5/',
          responseBody: CheckoutMother.filled(),
        },
      ])
      .withLogin({ cart: expensiveCart })
      .mount()

    await screen.findByLabelText('Home')
    createCheckout()
    await screen.findByText('Summary')

    expect(window.location.pathname).toBe('/checkout/5')
    expect('/customers/1/checkouts/').toHaveBeenFetchedWith({
      method: 'POST',
      body: {
        cart: {
          id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
          lines: [{ quantity: 200, product_id: '8731', sources: [] }],
        },
      },
    })
  })
})
