import { act, screen, within } from '@testing-library/react'

import {
  cancelOrderEdition,
  closeTab,
  goToOrderDetailWithoutChanges,
  modifyConfirmedOrder,
  stayInEditOrderProduct,
} from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import {
  cartWithOngoingOrder,
  expensiveCartRequest,
  mergedCart,
} from 'app/cart/__scenarios__/cart'
import {
  categories,
  categoryDetail,
} from 'app/catalog/__scenarios__/categories'
import { homeWithWidget, homeWithWidgets } from 'app/catalog/__scenarios__/home'
import { orderCart } from 'app/order/__scenarios__/orderCart'
import { order, preparedLines } from 'app/order/__scenarios__/orderDetail'
import { exitOrder, increaseProductFromCart } from 'pages/helpers'
import { addCartToOngoingOrder, openCart } from 'pages/home/__tests__/helpers'
import { shoppingLists } from 'pages/shopping-lists/__tests__/scenarios'
import { Storage } from 'services/storage'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Edit order - ', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should display the cancel edit order alert', async () => {
    const responses = [
      { path: '/customers/1/orders/44051/', responseBody: order },
      { path: '/customers/1/orders/44051/cart/', responseBody: orderCart },
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetail },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ]
    wrap(App)
      .atPath('/orders/44051/edit/products/')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Products in my order')
    increaseProductFromCart('Uva blanca con semillas')
    cancelOrderEdition()

    const alert = screen.getByRole('dialog')
    expect(within(alert).getByText('Are you sure?')).toBeInTheDocument()
    expect(
      within(alert).getByText(
        'If you continue, you will lose all the changes you have made.',
      ),
    ).toBeInTheDocument()
    expect(
      within(alert).getByRole('button', { name: 'Stay' }),
    ).toBeInTheDocument()
    expect(
      within(alert).getByRole('button', { name: 'Exit without saving' }),
    ).toBeInTheDocument()
  })

  it('should stay in edit order products when cancel the confirmation alert', async () => {
    const responses = [
      { path: '/customers/1/orders/44051/', responseBody: order },
      { path: '/customers/1/orders/44051/cart/', responseBody: orderCart },
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetail },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ]
    wrap(App)
      .atPath('/orders/44051/edit/products/')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Products in my order')
    increaseProductFromCart('Uva blanca con semillas')
    cancelOrderEdition()
    const alert = screen.getByRole('dialog')
    stayInEditOrderProduct()

    expect(alert).not.toBeInTheDocument()
    expect(screen.getByText('Products in my order')).toBeInTheDocument()
    expect(Tracker.sendInteraction).toHaveBeenCalledTimes(2)
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'dismiss_edit_purchase_changes_click',
      {
        option: 'cancel',
      },
    )
  })

  it('should go to user area when exit without saving', async () => {
    const responses = [
      { path: '/customers/1/orders/44051/', responseBody: order },
      { path: '/customers/1/orders/44051/cart/', responseBody: orderCart },
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetail },
      {
        path: '/customers/1/orders/44051/lines/prepared/',
        responseBody: preparedLines,
      },
      {
        path: '/customers/1/orders/44051/cart/draft/?lang=en&wh=vlc1',
        method: 'put',
        requestBody: {
          id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
          lines: [
            { id: 1, quantity: 2.1, product_id: '3317', sources: ['+CA'] },
            { id: 2, quantity: 3, product_id: '71502', sources: [] },
          ],
        },
        responseBody: {},
      },
      {
        path: '/customers/1/orders/44051/cart/draft/?lang=en&wh=vlc1',
        responseBody: undefined,
      },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ]
    wrap(App)
      .atPath('/orders/44051/edit/products/')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Products in my order')
    increaseProductFromCart('Uva blanca con semillas')
    cancelOrderEdition()
    goToOrderDetailWithoutChanges()
    const myOrdersLink = await screen.findByRole('link', { name: 'My orders' })

    expect(myOrdersLink).toBeInTheDocument()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'dismiss_edit_purchase_changes_click',
      {
        option: 'confirm',
      },
    )
  })

  it('should go to user area when exit without saving and deleting the draft', async () => {
    const responses = [
      { path: '/customers/1/orders/44051/', responseBody: order },
      { path: '/customers/1/orders/44051/cart/', responseBody: orderCart },
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetail },
      {
        path: '/customers/1/orders/44051/lines/prepared/',
        responseBody: preparedLines,
      },
      {
        path: '/customers/1/orders/44051/cart/draft/?lang=en&wh=vlc1',
        method: 'put',
        requestBody: {
          id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
          lines: [
            { id: 1, quantity: 2.1, product_id: '3317', sources: ['+CA'] },
            { id: 2, quantity: 3, product_id: '71502', sources: [] },
          ],
        },
        responseBody: {},
      },
      {
        path: '/customers/1/orders/44051/cart/draft/?lang=en&wh=vlc1',
        responseBody: undefined,
      },
      {
        path: '/customers/1/orders/cart/drafts/?lang=en&wh=vlc1',
        responseBody: undefined,
      },
      {
        path: '/customers/1/orders/44051/cart/draft/?lang=en&wh=vlc1',
        method: 'delete',
        requestBody: undefined,
      },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ]
    wrap(App)
      .atPath('/orders/44051/edit/products/')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Products in my order')
    increaseProductFromCart('Uva blanca con semillas')
    exitOrder()
    await screen.findByText('Are you sure?')

    await act(async () => goToOrderDetailWithoutChanges())
    expect(
      '/customers/1/orders/44051/cart/draft/?lang=en&wh=vlc1',
    ).toHaveBeenFetchedWith({
      method: 'DELETE',
      body: {},
    })
  })

  it('should go to the order page, then increase a product and exit without saving clicking on the browser back button', async () => {
    window.location = {
      reload: vi.fn(),
    }
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithWidgets },
      { path: '/customers/1/orders/1001/', responseBody: order },
      { path: '/customers/1/orders/1001/cart/', responseBody: orderCart },
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetail },
      {
        path: '/customers/1/orders/1001/lines/prepared/',
        responseBody: preparedLines,
      },
      {
        path: '/customers/1/orders/1001/cart/draft/?lang=en&wh=vlc1',
        method: 'put',
        requestBody: {
          id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
          lines: [
            { id: 1, quantity: 2.1, product_id: '3317', sources: ['+CA'] },
            { id: 2, quantity: 3, product_id: '71502', sources: [] },
          ],
        },
        responseBody: {},
      },
      {
        path: '/customers/1/orders/1001/cart/draft/?lang=en&wh=vlc1',
        responseBody: undefined,
      },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    const nextDelivery = await screen.findByText('Próxima entrega')
    modifyConfirmedOrder()
    await screen.findByText('Products in my order')
    increaseProductFromCart('Uva blanca con semillas')
    expect(nextDelivery).not.toBeInTheDocument()

    history.goBack()

    await screen.findByText('Exit without saving')
    goToOrderDetailWithoutChanges()
    expect(await screen.findByText('Próxima entrega')).toBeInTheDocument()
  })

  it('should clean cart_to_ongoing_order storage when leave the order edition', async () => {
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
      {
        path: '/customers/1/orders/44051/cart/draft/?lang=en&wh=vlc1',
        method: 'delete',
        requestBody: undefined,
      },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ]
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
    expect(
      '/customers/1/orders/44051/cart/draft/?lang=en&wh=vlc1',
    ).toHaveBeenFetchedWith({
      method: 'DELETE',
      body: {},
    })
  })
})
