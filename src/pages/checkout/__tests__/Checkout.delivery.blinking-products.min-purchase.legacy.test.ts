import { screen } from '@testing-library/react'

import {
  continueWithoutBlinkingProduct,
  keepShopping,
  selectDeliveryDate,
} from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { address } from 'app/address/__scenarios__/address'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
import { checkoutWithoutSlotWithBlinkingProduct } from 'app/checkout/__scenarios__/checkout'
import { slotsMock } from 'containers/slots-container/__tests__/mocks'
import { Storage } from 'services/storage'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Checkout - Delivery - Blinking Products', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    vi.clearAllMocks()
    Storage.clear()
    localStorage.clear()
  })

  it('should see a modal if remove blinking products set a checkout under 50€', async () => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    wrap(App)
      .atPath('/checkout/5')
      .withNetwork([
        {
          path: '/customers/1/checkouts/5/',
          responseBody: checkoutWithoutSlotWithBlinkingProduct(tomorrow),
        },
        {
          path: '/customers/1/addresses/1/slots/',
          responseBody: slotsMock,
        },
        {
          path: '/customers/1/checkouts/5/remove-lines/',
          method: 'post',
          requestBody: {
            product_ids: ['28745'],
          },
          status: 406,
        },
        {
          path: '/customers/1/addresses/',
          responseBody: { results: [address] },
        },
      ])
      .withLogin()
      .mount()

    await screen.findByText('60,00 €')
    selectDeliveryDate(tomorrow.getDate())
    continueWithoutBlinkingProduct()

    const modal = await screen.findByRole('dialog', {
      name: 'Minimum order. The amount has been reduced, the minimum to be able to place your order is 50€.',
    })

    expect(modal).toHaveTextContent(
      'The amount has been reduced, the minimum to be able to place your order is 50€.',
    )
  })

  it('should go to the home with the cart updated after confirm the modal under 50€', async () => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    wrap(App)
      .atPath('/checkout/5')
      .withNetwork([
        {
          path: '/customers/1/checkouts/5/',
          responseBody: checkoutWithoutSlotWithBlinkingProduct(tomorrow),
        },
        {
          path: '/customers/1/addresses/1/slots/',
          responseBody: slotsMock,
        },
        {
          path: '/customers/1/checkouts/5/remove-lines/',
          method: 'post',
          requestBody: {
            product_ids: ['28745'],
          },
          status: 406,
        },
        { path: '/customers/1/home/', responseBody: homeWithGrid },
        {
          path: '/customers/1/addresses/',
          responseBody: { results: [address] },
        },
      ])
      .withLogin()
      .mount()

    await screen.findByText('60,00 €')
    selectDeliveryDate(tomorrow.getDate())
    continueWithoutBlinkingProduct()
    await screen.findByRole('dialog', {
      name: 'Minimum order. The amount has been reduced, the minimum to be able to place your order is 50€.',
    })
    keepShopping()
    await screen.findByText('Novedades')

    expect('/customers/1/cart/').toHaveBeenFetchedTimes(3)
    expect(
      screen.queryByRole('dialog', {
        name: 'Minimum order. The amount has been reduced, the minimum to be able to place your order is 50€.',
      }),
    ).not.toBeInTheDocument()
  })

  it('should go to the home with the cart updated and opened after confirm the modal under 50€', async () => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    wrap(App)
      .atPath('/checkout/5')
      .withNetwork([
        {
          path: '/customers/1/checkouts/5/',
          responseBody: checkoutWithoutSlotWithBlinkingProduct(tomorrow),
        },
        {
          path: '/customers/1/addresses/1/slots/',
          responseBody: slotsMock,
        },
        {
          path: '/customers/1/checkouts/5/remove-lines/',
          method: 'post',
          requestBody: {
            product_ids: ['28745'],
          },
          status: 406,
        },
        { path: '/customers/1/home/', responseBody: homeWithGrid },
        {
          path: '/customers/1/addresses/',
          responseBody: { results: [address] },
        },
      ])
      .withLogin()
      .mount()

    await screen.findByText('60,00 €')
    selectDeliveryDate(tomorrow.getDate())
    continueWithoutBlinkingProduct()
    await screen.findByRole('dialog', {
      name: 'Minimum order. The amount has been reduced, the minimum to be able to place your order is 50€.',
    })
    keepShopping()
    await screen.findByText('Novedades')
    const overlay = screen.getByTestId('overlay-container')
    const cartSidebar = screen.getByLabelText('Cart')

    expect('/customers/1/cart/').toHaveBeenFetchedTimes(3)
    expect(
      screen.queryByRole('dialog', {
        name: 'Minimum order. The amount has been reduced, the minimum to be able to place your order is 50€.',
      }),
    ).not.toBeInTheDocument()
    expect(overlay).toHaveClass('overlay--show')
    expect(cartSidebar).toHaveClass('cart--open')
  })

  it('should send metric when see a modal when remove blinking products set a checkout under 50€', async () => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    wrap(App)
      .atPath('/checkout/5')
      .withNetwork([
        {
          path: '/customers/1/checkouts/5/',
          responseBody: checkoutWithoutSlotWithBlinkingProduct(tomorrow),
        },
        {
          path: '/customers/1/addresses/1/slots/',
          responseBody: slotsMock,
        },
        {
          path: '/customers/1/checkouts/5/remove-lines/',
          method: 'post',
          requestBody: {
            product_ids: ['28745'],
          },
          status: 406,
        },
        {
          path: '/customers/1/addresses/',
          responseBody: { results: [address] },
        },
      ])
      .withLogin()
      .mount()

    await screen.findByText('60,00 €')
    selectDeliveryDate(tomorrow.getDate())
    continueWithoutBlinkingProduct()
    await screen.findByRole('dialog', {
      name: 'Minimum order. The amount has been reduced, the minimum to be able to place your order is 50€.',
    })

    expect(Tracker.sendViewChange).toHaveBeenCalledWith(
      'unavailable_products_minimum_price_alert',
      {
        cart_mode: 'purchase',
      },
    )
  })

  it('should send metric when go to the home after confirm the modal under 50€', async () => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    wrap(App)
      .atPath('/checkout/5')
      .withNetwork([
        {
          path: '/customers/1/checkouts/5/',
          responseBody: checkoutWithoutSlotWithBlinkingProduct(tomorrow),
        },
        {
          path: '/customers/1/addresses/1/slots/',
          responseBody: slotsMock,
        },
        {
          path: '/customers/1/checkouts/5/remove-lines/',
          method: 'post',
          requestBody: {
            product_ids: ['28745'],
          },
          status: 406,
        },
        { path: '/customers/1/home/', responseBody: homeWithGrid },
        {
          path: '/customers/1/addresses/',
          responseBody: { results: [address] },
        },
      ])
      .withLogin()
      .mount()

    await screen.findByText('60,00 €')
    selectDeliveryDate(tomorrow.getDate())
    continueWithoutBlinkingProduct()
    await screen.findByRole('dialog', {
      name: 'Minimum order. The amount has been reduced, the minimum to be able to place your order is 50€.',
    })
    keepShopping()
    await screen.findByText('Novedades')

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'continue_minimum_price_alert_click',
    )
  })
})
