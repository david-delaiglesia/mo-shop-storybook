import { screen } from '@testing-library/react'

import {
  addCartToOngoingOrder,
  cancelBlinkingProductMerge,
  continueBlinkingProductMerge,
  openCart,
} from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import {
  cartWithOngoingOrder,
  expensiveCartRequest,
  mergedCartWithBlinkingProduct,
} from 'app/cart/__scenarios__/cart'
import { homeWithWidget } from 'app/catalog/__scenarios__/home'
import { order } from 'app/order/__scenarios__/orderDetail'
import { shoppingLists } from 'pages/shopping-lists/__tests__/scenarios'
import { Storage } from 'services/storage'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Home - Add to ongoing order Blinking Products - Indirect - Metrics', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    vi.clearAllMocks()
    Storage.clear()
    localStorage.clear()
  })
  it('should send metric when see the blinking product alert', async () => {
    wrap(App)
      .atPath('/')
      .withNetwork([
        { path: '/customers/1/home/', responseBody: homeWithWidget },
        {
          path: '/customers/1/orders/44051/cart/validate-merge/',
          method: 'post',
          requestBody: expensiveCartRequest,
          responseBody: { ...mergedCartWithBlinkingProduct },
        },
        {
          path: '/customers/1/orders/44051/',
          responseBody: { ...order },
        },
      ])
      .withLogin({ cart: cartWithOngoingOrder })
      .mount()

    await screen.findByText('Próxima entrega')
    openCart()
    await screen.findByText('Add to current order')
    addCartToOngoingOrder()
    await screen.findByRole('dialog', {
      name: 'These products will not be available on the day of delivery',
    })

    expect(Tracker.sendViewChange).toHaveBeenCalledWith(
      'unavailable_day_product_alert',
      {
        cart_id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        merca: ['8731'],
        weekday: 'wed',
        cart_mode: 'merge',
        purchase_id: 44051,
      },
    )
  })

  it('should send metric when cancel remove blinking products', async () => {
    wrap(App)
      .atPath('/')
      .withNetwork([
        { path: '/customers/1/home/', responseBody: homeWithWidget },
        {
          path: '/customers/1/orders/44051/cart/validate-merge/',
          method: 'post',
          requestBody: expensiveCartRequest,
          responseBody: { ...mergedCartWithBlinkingProduct },
        },
        {
          path: '/customers/1/orders/44051/',
          responseBody: { ...order },
        },
      ])
      .withLogin({ cart: cartWithOngoingOrder })
      .mount()

    await screen.findByText('Próxima entrega')
    openCart()
    await screen.findByText('Add to current order')
    addCartToOngoingOrder()
    await screen.findByRole('dialog', {
      name: 'These products will not be available on the day of delivery',
    })
    cancelBlinkingProductMerge()

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'pick_other_day_unavailable_day_product_alert_click',
      {
        cart_id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        merca: ['8731'],
        weekday: 'wed',
        cart_mode: 'merge',
        purchase_id: 44051,
      },
    )
  })

  it('should send metric when cancel remove blinking products', async () => {
    wrap(App)
      .atPath('/')
      .withNetwork([
        { path: '/customers/1/home/', responseBody: homeWithWidget },
        {
          path: '/customers/1/orders/44051/cart/validate-merge/',
          method: 'post',
          requestBody: expensiveCartRequest,
          responseBody: { ...mergedCartWithBlinkingProduct },
        },
        {
          path: '/customers/1/orders/44051/',
          responseBody: { ...order },
        },
        { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
      ])
      .withLogin({ cart: cartWithOngoingOrder })
      .mount()

    await screen.findByText('Próxima entrega')
    openCart()
    await screen.findByText('Add to current order')
    addCartToOngoingOrder()
    await screen.findByRole('dialog', {
      name: 'These products will not be available on the day of delivery',
    })
    continueBlinkingProductMerge()
    await screen.findByRole('complementary', {
      name: 'Products in my order',
    })

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'continue_unavailable_day_product_alert_click',
      {
        cart_id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        merca: ['8731'],
        weekday: 'wed',
        cart_mode: 'merge',
        purchase_id: 44051,
      },
    )
  })
})
