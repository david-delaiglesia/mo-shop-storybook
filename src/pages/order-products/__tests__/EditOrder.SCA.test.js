import { screen } from '@testing-library/react'

import {
  confirmOrderEdition,
  incrementProductInCart,
  scaChallengeSuccess,
} from './helpers'
import i18n from 'i18next'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import {
  categories,
  categoryDetail,
} from 'app/catalog/__scenarios__/categories'
import { cookies } from 'app/cookie/__scenarios__/cookies'
import { orderCartWithValidPrice } from 'app/order/__scenarios__/orderCart'
import { order, preparedLines } from 'app/order/__scenarios__/orderDetail'
import {
  paymentAuthenticationRequired,
  redsysPsd2Parameters,
} from 'app/payment/__scenarios__/payments'
import { shoppingLists } from 'pages/shopping-lists/__tests__/scenarios'
import { Cookie } from 'services/cookie'
import { Storage } from 'services/storage'
import { SystemAlert } from 'services/system-alert'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Edit order - SCA', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  const defaultResponses = [
    { path: '/customers/1/orders/44051/', responseBody: order },
    {
      path: '/customers/1/orders/44051/cart/',
      responseBody: orderCartWithValidPrice,
    },
    { path: '/categories/', responseBody: categories },
    { path: '/categories/112/', responseBody: categoryDetail },
    { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
  ]

  beforeEach(() => {
    vi.spyOn(Cookie, 'get').mockImplementation((cookie) => cookies[cookie])
    i18n.isInitialized = false
    window.open = vi.fn()
  })

  afterEach(() => {
    vi.clearAllMocks()
    Storage.clear()
    vi.spyOn(window.history, 'state', 'get').mockReturnValue()
  })

  it('should confirm an edited order with authentication', async () => {
    delete global.window.location
    window.location = {
      origin: 'https://tienda.mercadona.es',
      host: 'tienda.mercadona.es',
      protocol: 'https:',
      pathname: '/orders/54384/edit/products',
      toString: () => 'https://tienda.mercadona.es/orders/54384/edit/products',
    }
    const responses = [
      ...defaultResponses,
      {
        path: '/customers/1/orders/44051/cart/',
        method: 'put',
        status: 418,
        responseBody: paymentAuthenticationRequired,
        requestBody: {
          cart: {
            id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
            lines: [
              { quantity: 1, product_id: '8731', sources: ['+CT'] },
              { id: 1, quantity: 20, product_id: '3317', sources: [] },
              { id: 2, quantity: 3, product_id: '71502', sources: [] },
            ],
          },
        },
      },
      {
        path: '/customers/1/payment-cards/auth/sca_id/?lang=en&wh=vlc1&ok_url=https://tienda.mercadona.es/sca_confirm_ok.html?url=https://tienda.mercadona.es/orders/54384/edit/products&ko_url=https://tienda.mercadona.es/sca_confirm_ko.html?url=https://tienda.mercadona.es/orders/54384/edit/products&checkout_auto_confirm=yes',
        responseBody: redsysPsd2Parameters,
        catchParams: true,
      },
    ]
    const responsesAfterSCA = [
      { path: '/customers/1/orders/44051/', responseBody: order },
      {
        path: '/customers/1/orders/44051/cart/',
        method: 'put',
        responseBody: orderCartWithValidPrice,
        requestBody: {
          cart: {
            id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
            lines: [
              { quantity: 1, product_id: '8731', sources: ['+CT'] },
              { id: 1, quantity: 20, product_id: '3317', sources: [] },
              { id: 2, quantity: 3, product_id: '71502', sources: [] },
            ],
          },
        },
      },
      {
        path: '/customers/1/orders/44051/lines/prepared/',
        responseBody: preparedLines,
      },
    ]
    const mountApp = (responses) =>
      wrap(App)
        .atPath('/orders/44051/edit/products')
        .withNetwork(responses)
        .withLogin()
        .mount()

    mountApp(responses)

    await screen.findByText('Modify order')
    incrementProductInCart()
    confirmOrderEdition()

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'save_purchase_products_click',
      {
        cart_id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        purchase_id: 44051,
        price: 214.4,
      },
    )

    await screen.findByTestId('sca-form')

    expect(Tracker.sendInteraction).not.toHaveBeenCalledWith(
      'log_start_psd2_flow',
    )
    expect(Tracker.sendInteraction).toHaveBeenCalledWith('start_psd2_flow', {
      payment_method_type: 'card',
      type: 'authentication',
      provider: 'redsys',
      payment_authentication_uuid: 'sca_id',
      user_flow: 'edit_order',
      is_MIT: false,
    })

    scaChallengeSuccess(() => mountApp(responsesAfterSCA))
    await screen.findByText('Order updated')

    expect(window.history.state).toBeUndefined()
    expect(screen.getByText('Order 44051')).toBeInTheDocument()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith('end_psd2_flow', {
      status: 'success',
      user_flow: 'edit_order',
      payment_authentication_uuid: 'sca_id',
    })
    expect(Tracker.sendInteraction).toHaveBeenCalledWith('edition_confirmed', {
      order_id: '44051',
      price: 221.61,
    })
    expect(Storage.getItem('sca_confirm')).toBeUndefined()
  })
  it('should not show the draft modal when confirm an edited order with authentication', async () => {
    delete global.window.location
    window.location = {
      origin: 'https://tienda.mercadona.es',
      host: 'tienda.mercadona.es',
      protocol: 'https:',
      pathname: '/orders/54384/edit/products',
      toString: () => 'https://tienda.mercadona.es/orders/54384/edit/products',
    }
    const responses = [
      ...defaultResponses,
      {
        path: '/customers/1/orders/44051/cart/draft/?lang=en&wh=vlc1',
        method: 'put',
        requestBody: {
          id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
          lines: [
            { quantity: 1, product_id: '8731', sources: ['+CT'] },
            { id: 1, quantity: 20, product_id: '3317', sources: [] },
            { id: 2, quantity: 3, product_id: '71502', sources: [] },
          ],
        },
        responseBody: undefined,
      },
      {
        path: '/customers/1/orders/44051/cart/',
        method: 'put',
        status: 418,
        responseBody: paymentAuthenticationRequired,
        requestBody: {
          cart: {
            id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
            lines: [
              { quantity: 1, product_id: '8731', sources: ['+CT'] },
              { id: 1, quantity: 20, product_id: '3317', sources: [] },
              { id: 2, quantity: 3, product_id: '71502', sources: [] },
            ],
          },
        },
      },
      {
        path: '/customers/1/payment-cards/auth/sca_id/?lang=en&wh=vlc1&ok_url=https://tienda.mercadona.es/sca_confirm_ok.html?url=https://tienda.mercadona.es/orders/54384/edit/products&ko_url=https://tienda.mercadona.es/sca_confirm_ko.html?url=https://tienda.mercadona.es/orders/54384/edit/products&checkout_auto_confirm=yes',
        responseBody: redsysPsd2Parameters,
        catchParams: true,
      },
    ]
    const responsesAfterSCA = [
      { path: '/customers/1/orders/44051/', responseBody: order },
      {
        path: '/customers/1/orders/44051/cart/',
        method: 'put',
        responseBody: orderCartWithValidPrice,
        requestBody: {
          cart: {
            id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
            lines: [
              { quantity: 1, product_id: '8731', sources: ['+CT'] },
              { id: 1, quantity: 20, product_id: '3317', sources: [] },
              { id: 2, quantity: 3, product_id: '71502', sources: [] },
            ],
          },
        },
      },
      {
        path: '/customers/1/orders/44051/lines/prepared/',
        responseBody: preparedLines,
      },
    ]
    const mountApp = (responses) =>
      wrap(App)
        .atPath('/orders/44051/edit/products')
        .withNetwork(responses)
        .withLogin()
        .mount()

    mountApp(responses)

    await screen.findByText('Modify order')
    incrementProductInCart()
    confirmOrderEdition()

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'save_purchase_products_click',
      {
        cart_id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        purchase_id: 44051,
        price: 214.4,
      },
    )

    await screen.findByTestId('sca-form')

    scaChallengeSuccess(() => mountApp(responsesAfterSCA))
    await screen.findByText('Order updated')

    expect(
      screen.queryByRole('heading', {
        name: 'draft_unsaved_changes_title',
      }),
    ).not.toBeInTheDocument()

    expect(window.history.state).toBeUndefined()
    expect(screen.getByText('Order 44051')).toBeInTheDocument()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith('end_psd2_flow', {
      status: 'success',
      user_flow: 'edit_order',
      payment_authentication_uuid: 'sca_id',
    })
    expect(Tracker.sendInteraction).not.toHaveBeenCalledWith(
      'unsaved_edition_modal_view',
    )

    expect(Tracker.sendInteraction).toHaveBeenCalledWith('edition_confirmed', {
      order_id: '44051',
      price: 221.61,
    })
    expect(Storage.getItem('sca_confirm')).toBeUndefined()
  })

  it('should replace the location before the challenge with the KO url', async () => {
    const replaceState = vi.spyOn(window.history, 'replaceState')
    const responses = [
      ...defaultResponses,
      {
        path: '/customers/1/orders/44051/cart/',
        method: 'put',
        status: 418,
        responseBody: paymentAuthenticationRequired,
        requestBody: {
          cart: {
            id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
            lines: [
              { quantity: 1, product_id: '8731', sources: ['+CT'] },
              { id: 1, quantity: 20, product_id: '3317', sources: [] },
              { id: 2, quantity: 3, product_id: '71502', sources: [] },
            ],
          },
        },
      },
      {
        path: '/customers/1/payment-cards/auth/sca_id/',
        responseBody: redsysPsd2Parameters,
      },
    ]
    wrap(App)
      .atPath('/orders/44051/edit/products')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Modify order')
    incrementProductInCart()
    confirmOrderEdition()
    await screen.findByTestId('sca-form')

    expect(replaceState).toHaveBeenCalledWith(
      window.history.state,
      import.meta.env.VITE_WEBSITE_NAME,
      expect.stringContaining('sca_confirm_ko.html'),
    )
  })

  it('should disable the close tab system alert before the challenge', async () => {
    SystemAlert.deactivate = vi.fn()
    const responses = [
      ...defaultResponses,
      {
        path: '/customers/1/orders/44051/cart/',
        method: 'put',
        status: 418,
        responseBody: paymentAuthenticationRequired,
        requestBody: {
          cart: {
            id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
            lines: [
              { quantity: 1, product_id: '8731', sources: ['+CT'] },
              { id: 1, quantity: 20, product_id: '3317', sources: [] },
              { id: 2, quantity: 3, product_id: '71502', sources: [] },
            ],
          },
        },
      },
      {
        path: '/customers/1/payment-cards/auth/sca_id/',
        responseBody: redsysPsd2Parameters,
      },
    ]
    wrap(App)
      .atPath('/orders/44051/edit/products')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Modify order')
    incrementProductInCart()
    confirmOrderEdition()
    await screen.findByTestId('sca-form')

    expect(SystemAlert.deactivate).toHaveBeenCalled()
  })

  it('should be able to handle a server error in the update order request', async () => {
    const responses = [
      ...defaultResponses,
      {
        path: '/customers/1/orders/44051/cart/',
        method: 'put',
        status: 500,
        requestBody: {
          cart: {
            id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
            lines: [
              { quantity: 1, product_id: '8731', sources: ['+CT'] },
              { id: 1, quantity: 20, product_id: '3317', sources: [] },
              { id: 2, quantity: 3, product_id: '71502', sources: [] },
            ],
          },
        },
      },
    ]
    wrap(App)
      .atPath('/orders/44051/edit/products')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Modify order')
    incrementProductInCart()
    confirmOrderEdition()
    const errorTitle = await screen.findByText(
      'Sorry, the content of this page cannot be displayed.',
    )

    expect(errorTitle).toBeInTheDocument()
  })

  it('should redirect to the order detail page if the user tries to go back after a successful challenge', async () => {
    // As we can't simulate the go back, the test is setting the state of the app manually.
    const responsesAfterSCA = [
      { path: '/customers/1/orders/44051/', responseBody: order },
      {
        path: '/customers/1/orders/44051/lines/prepared/',
        responseBody: preparedLines,
      },
    ]
    const mountApp = (responses) =>
      wrap(App)
        .atPath('/orders/44051/edit/products')
        .withNetwork(responses)
        .withLogin()
        .mount()

    scaChallengeSuccess(() => mountApp(responsesAfterSCA))
    await screen.findByText('Modify order')

    expect(screen.getByText('Confirmed')).toBeInTheDocument()
  })
})
