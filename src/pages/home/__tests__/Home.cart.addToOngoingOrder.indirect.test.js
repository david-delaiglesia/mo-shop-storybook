import { screen } from '@testing-library/react'

import {
  addCartToOngoingOrder,
  confirmQuantityProductLimitAlert,
  openCart,
} from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import {
  cartWithOngoingOrder,
  expensiveCartRequest,
  mergedCart,
  mergedCartRequest,
  mergedCartWithExceededProducts,
  mergedCartWithExceededProductsRequest,
} from 'app/cart/__scenarios__/cart'
import {
  categories,
  categoryDetail,
} from 'app/catalog/__scenarios__/categories'
import { homeWithWidget } from 'app/catalog/__scenarios__/home'
import { order, preparedLines } from 'app/order/__scenarios__/orderDetail'
import {
  cancelOrderEdition,
  closeTab,
  confirmOrderEdition,
} from 'pages/order-products/__tests__/helpers'
import { shoppingLists } from 'pages/shopping-lists/__tests__/scenarios'
import { Storage } from 'services/storage'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Home - Add to ongoing order - Indirect', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    vi.clearAllMocks()
    Storage.clear()
    localStorage.clear()
  })

  const defaultResponses = [
    { path: '/customers/1/home/', responseBody: homeWithWidget },
    {
      path: '/customers/1/orders/44051/cart/validate-merge/',
      method: 'post',
      requestBody: expensiveCartRequest,
      responseBody: { ...mergedCart },
    },
    {
      path: '/customers/1/orders/44051/',
      responseBody: { ...order },
    },
    { path: '/categories/', responseBody: categories },
    {
      path: `/categories/${categoryDetail.id}/`,
      responseBody: categoryDetail,
    },
    { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
  ]

  it('should go to edit order when clicks on add to ongoing order button', async () => {
    wrap(App)
      .atPath('/')
      .withNetwork(defaultResponses)
      .withLogin({ cart: cartWithOngoingOrder })
      .mount()

    await screen.findByText('Próxima entrega')
    openCart()
    await screen.findByText('Add to current order')
    addCartToOngoingOrder()
    await screen.findByText('Products in my order')
    const editOrderCart = screen.getByLabelText('Products in my order')

    const expectedCartMetricProperty = {
      cart_id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
      price: 170,
      products_count: 1,
      units_count: 200,
      water_liters: 0,
    }
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'add_product_to_order_click',
      expectedCartMetricProperty,
    )
    expect(editOrderCart).toHaveTextContent('200 units')
    expect(screen.getByLabelText('Cart')).not.toHaveClass('cart--open')
  })

  it('should clean cart_to_ongoing_order storage when leave the order edition', async () => {
    wrap(App)
      .atPath('/')
      .withNetwork(defaultResponses)
      .withLogin({ cart: cartWithOngoingOrder })
      .mount()

    await screen.findByText('Próxima entrega')
    openCart()
    await screen.findByText('Add to current order')
    addCartToOngoingOrder()
    await screen.findByText('Products in my order')
    closeTab()

    expect(Storage.getItem('cart_to_ongoing_order')).toBeUndefined()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'clean_ongoing_order_cart_from_leave_edition',
    )
  })

  it('should show the unsaved changes alert when cancel the order merge', async () => {
    wrap(App)
      .atPath('/')
      .withNetwork(defaultResponses)
      .withLogin({ cart: cartWithOngoingOrder })
      .mount()

    await screen.findByText('Próxima entrega')
    openCart()
    await screen.findByText('Add to current order')
    addCartToOngoingOrder()
    await screen.findByText('Products in my order')
    cancelOrderEdition()

    const cancelAlert = screen.getByRole('dialog')
    expect(cancelAlert).toBeInTheDocument()
    expect(cancelAlert).toHaveTextContent('Are you sure?')
    expect(cancelAlert).toHaveTextContent(
      'If you continue, you will lose all the changes you have made.',
    )
    expect(cancelAlert).toHaveTextContent('Stay')
    expect(cancelAlert).toHaveTextContent('Exit without saving')
  })

  it('should finish the add to ongoing order with the indirect flow', async () => {
    const removeCartFromStorage = vi.spyOn(Storage, 'removeItem')
    const responses = [
      ...defaultResponses,
      {
        path: '/customers/1/cart/',
        multipleResponses: [
          { responseBody: cartWithOngoingOrder },
          { responseBody: cartWithOngoingOrder },
          {
            responseBody: {
              id: '54444444-5444-4444-8444-544444444445',
              lines: [],
            },
          },
        ],
      },
      {
        path: '/customers/1/orders/44051/cart/',
        method: 'put',
        requestBody: { ...mergedCartRequest },
        responseBody: {},
      },
      {
        path: `/customers/1/orders/${order.id}/lines/prepared/`,
        responseBody: preparedLines,
      },
      {
        path: '/customers/1/cart/',
        method: 'put',
        requestBody: { id: '10000000-1000-4000-8000-100000000000', lines: [] },
        responseBody: { id: '54444444-5444-4444-8444-544444444445', lines: [] },
      },
    ]

    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Próxima entrega')
    openCart()
    await screen.findByText('Add to current order')
    addCartToOngoingOrder()
    await screen.findByText('Products in my order')
    confirmOrderEdition()
    const confirmAlert = await screen.findByRole('dialog')

    expect(confirmAlert).toBeInTheDocument()
    expect(confirmAlert).toHaveTextContent('Order updated')
    expect(screen.getByLabelText('Show cart')).toHaveOnlyIcon()
    expect(removeCartFromStorage).toHaveBeenCalledWith('cart_to_ongoing_order')
  })

  it('should confirms the add products to ongoing order when appears quantity product alert', async () => {
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithWidget },
      {
        path: '/customers/1/orders/44051/cart/validate-merge/',
        method: 'post',
        requestBody: expensiveCartRequest,
        responseBody: { ...mergedCartWithExceededProducts },
      },
      {
        path: '/customers/1/orders/44051/cart/',
        method: 'put',
        requestBody: { ...mergedCartWithExceededProductsRequest },
        responseBody: {},
      },
      {
        path: '/customers/1/cart/',
        method: 'put',
        requestBody: {
          id: '10000000-1000-4000-8000-100000000000',
          lines: [],
        },
      },
      {
        path: '/customers/1/orders/44051/',
        responseBody: { ...order },
      },
      {
        path: `/customers/1/orders/${order.id}/lines/prepared/`,
        responseBody: preparedLines,
      },
      { path: '/categories/', responseBody: categories },
      {
        path: `/categories/${categoryDetail.id}/`,
        responseBody: categoryDetail,
      },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ]

    wrap(App)
      .atPath('/')
      .withNetwork(responses)
      .withLogin({ cart: cartWithOngoingOrder })
      .mount()

    await screen.findByText('Próxima entrega')
    openCart()
    await screen.findByText('Add to current order')
    addCartToOngoingOrder()
    await screen.findByText('The maximum amount is exceeded for some products')
    confirmQuantityProductLimitAlert()
    await screen.findByText('Products in my order')
    confirmOrderEdition()
    const confirmAlert = await screen.findByRole('dialog')

    expect(confirmAlert).toBeInTheDocument()
    expect(confirmAlert).toHaveTextContent('Order updated')
    expect(screen.getByLabelText('Show cart')).toHaveOnlyIcon()
  })
})
