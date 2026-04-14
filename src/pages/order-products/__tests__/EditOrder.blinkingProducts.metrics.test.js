import { act, screen } from '@testing-library/react'

import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import {
  categories,
  categoryDetailWithBlinkingProductDay,
} from 'app/catalog/__scenarios__/categories'
import {
  productBaseWithUnavailableDay,
  productXSelling,
} from 'app/catalog/__scenarios__/product'
import { orderCart } from 'app/order/__scenarios__/orderCart'
import { mockedOrder } from 'app/order/__tests__/order.mock'
import {
  addProduct,
  addProductFromDetail,
  openProductDetail,
} from 'pages/helpers'
import { closeBlinkingProductAlert } from 'pages/order-products/__tests__/helpers'
import { shoppingLists } from 'pages/shopping-lists/__tests__/scenarios'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Edit order Blinking Products', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should send metric when see the alert after add produdct in cell', async () => {
    const responses = [
      { path: '/customers/1/orders/5/', responseBody: mockedOrder },
      { path: '/customers/1/orders/5/cart/', responseBody: orderCart },
      { path: '/categories/', responseBody: categories },
      {
        path: '/categories/112/',
        responseBody: categoryDetailWithBlinkingProductDay(5),
      },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ]
    wrap(App)
      .atPath('/orders/5/edit/products/')
      .withNetwork(responses)
      .withLogin()
      .mount()
    await screen.findByText('Products in my order')

    addProduct('Fideos orientales Yakisoba sabor pollo Hacendado')

    expect(Tracker.sendViewChange).toHaveBeenCalledWith(
      'edit_purchase_unavailable_day_product_alert',
      {
        purchase_id: 5,
        merca: '8731',
        weekday: 'fri',
      },
    )
  })

  it('should send metric when close the alert after see it and add product in the cell', async () => {
    const responses = [
      { path: '/customers/1/orders/1235/', responseBody: mockedOrder },
      { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
      { path: '/categories/', responseBody: categories },
      {
        path: '/categories/112/',
        responseBody: categoryDetailWithBlinkingProductDay(5),
      },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ]
    wrap(App)
      .atPath('/orders/1235/edit/products/')
      .withNetwork(responses)
      .withLogin()
      .mount()
    await screen.findByText('Products in my order')

    addProduct('Fideos orientales Yakisoba sabor pollo Hacendado')
    closeBlinkingProductAlert()

    expect(Tracker.sendViewChange).toHaveBeenCalledWith(
      'edit_purchase_continue_unavailable_day_product_alert_click',
      {
        purchase_id: 5,
        merca: '8731',
        weekday: 'fri',
      },
    )
  })

  it('should send metric when see the alert after add produdct in detail', async () => {
    const responses = [
      { path: '/customers/1/orders/1235/', responseBody: mockedOrder },
      { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
      { path: '/categories/', responseBody: categories },
      {
        path: '/categories/112/',
        responseBody: categoryDetailWithBlinkingProductDay(5),
      },
      {
        path: '/products/8731/',
        responseBody: productBaseWithUnavailableDay(5),
      },
      {
        path: '/products/8731/xselling/',
        responseBody: productXSelling,
      },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ]
    wrap(App)
      .atPath('/orders/1235/edit/products/')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Products in my order')
    await act(async () => {
      await openProductDetail(
        'Fideos orientales Yakisoba sabor pollo Hacendado',
      )
      await addProductFromDetail()
    })
    await screen.findByText('Related products')

    expect(Tracker.sendViewChange).toHaveBeenCalledWith(
      'edit_purchase_unavailable_day_product_alert',
      {
        purchase_id: 5,
        merca: '8731',
        weekday: 'fri',
      },
    )
  })

  it('should send metric when close the alert after see it and add product in the detail', async () => {
    const responses = [
      { path: '/customers/1/orders/1235/', responseBody: mockedOrder },
      { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
      { path: '/categories/', responseBody: categories },
      {
        path: '/categories/112/',
        responseBody: categoryDetailWithBlinkingProductDay(5),
      },
      {
        path: '/products/8731/',
        responseBody: productBaseWithUnavailableDay(5),
      },
      {
        path: '/products/8731/xselling/',
        responseBody: productXSelling,
      },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ]
    wrap(App)
      .atPath('/orders/1235/edit/products/')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Products in my order')
    await act(async () => {
      await openProductDetail(
        'Fideos orientales Yakisoba sabor pollo Hacendado',
      )
      await addProductFromDetail()
    })
    await screen.findByText('Related products')
    closeBlinkingProductAlert()

    expect(Tracker.sendViewChange).toHaveBeenCalledWith(
      'edit_purchase_continue_unavailable_day_product_alert_click',
      {
        purchase_id: 5,
        merca: '8731',
        weekday: 'fri',
      },
    )
  })
})
