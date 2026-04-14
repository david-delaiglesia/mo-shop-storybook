import { screen, waitFor } from '@testing-library/react'

import { openCart, startCheckout } from './helpers'
import { wrap } from 'wrapito'

import { App } from 'app'
import { MinPurchaseAmountNotReachedException } from 'app/cart'
import { cartApiResponseWithUnpublishedAndMinimumPrice } from 'app/cart/__tests__/cart.mock'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
import { confirmMinimumPurchaseAlert } from 'pages/helpers'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Minimum purchase amount', () => {
  it('should NOT display the minimum purchase amount if the backend does not throw an error', async () => {
    wrap(App)
      .atPath('/')
      .withNetwork([
        { path: '/customers/1/home/', responseBody: homeWithGrid },
        {
          path: '/customers/1/cart/',
          responseBody: cartApiResponseWithUnpublishedAndMinimumPrice,
        },
      ])
      .withLogin()
      .mount()

    await screen.findByText('Estimated cost')
    openCart()
    await screen.findByText('Checkout')
    startCheckout()

    await waitFor(() => {
      expect(
        screen.queryByRole('dialog', {
          name: 'Minimum order. Remember that to place your order the minimum amount is €50',
        }),
      ).not.toBeInTheDocument()
    })
  })

  it('should display the minimum purchase amount when the backend throws the error min_purchase_amount_in_cart_not_reached_error', async () => {
    const checkoutPostRequestBody = {
      cart: {
        id: '5529dc8b-0a94-4ae0-8145-de5197b542c6',
        lines: [
          { quantity: 5, product_id: '28757', sources: [] },
          { quantity: 2, product_id: '3317', sources: [] },
          { quantity: 3, product_id: '71502', sources: [] },
        ],
      },
    }
    wrap(App)
      .atPath('/')
      .withNetwork([
        { path: '/customers/1/home/', responseBody: homeWithGrid },
        {
          path: '/customers/1/cart/',
          responseBody: cartApiResponseWithUnpublishedAndMinimumPrice,
        },
        {
          path: '/customers/1/checkouts/?lang=en&wh=vlc1',
          method: 'post',
          status: 400,
          requestBody: checkoutPostRequestBody,
          responseBody: {
            errors: [
              MinPurchaseAmountNotReachedException.toJSON({
                detail:
                  'Remember that to place your order the minimum amount is €50',
              }),
            ],
          },
        },
      ])
      .withLogin()
      .mount()

    await screen.findByText('Estimated cost')
    openCart()
    await screen.findByText('Checkout')
    startCheckout()

    const alert = await screen.findByRole('dialog', {
      name: 'Minimum order. Remember that to place your order the minimum amount is €50',
    })

    expect(alert).toBeInTheDocument()
    expect(Tracker.sendViewChange).toHaveBeenCalledWith('minimum_price_alert', {
      cart_mode: 'purchase',
      price: 71.42999999999999,
    })

    confirmMinimumPurchaseAlert()

    expect(alert).not.toBeInTheDocument()
  })

  it('should delegate to the NetworkErrorHandler the error if the error is not related with the minimum purchase', async () => {
    const checkoutPostRequestBody = {
      cart: {
        id: '5529dc8b-0a94-4ae0-8145-de5197b542c6',
        lines: [
          { quantity: 5, product_id: '28757', sources: [] },
          { quantity: 2, product_id: '3317', sources: [] },
          { quantity: 3, product_id: '71502', sources: [] },
        ],
      },
    }
    wrap(App)
      .atPath('/')
      .withNetwork([
        { path: '/customers/1/home/', responseBody: homeWithGrid },
        {
          path: '/customers/1/cart/',
          responseBody: cartApiResponseWithUnpublishedAndMinimumPrice,
        },
        {
          path: '/customers/1/checkouts/?lang=en&wh=vlc1',
          method: 'post',
          status: 400,
          requestBody: checkoutPostRequestBody,
          responseBody: {
            errors: [
              {
                code: 'another error',
                detail: 'Another error text',
              },
            ],
          },
        },
      ])
      .withLogin()
      .mount()

    await screen.findByText('Estimated cost')
    openCart()
    await screen.findByText('Checkout')
    startCheckout()

    expect(
      await screen.findByRole('dialog', {
        name: 'Your request cannot be processed. Another error text',
      }),
    ).toBeInTheDocument()
  })
})
