import { fireEvent, screen } from '@testing-library/react'

import {
  closeTab,
  confirmOrderEdition,
  searchProducts,
  setOnline,
} from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { cartApiWithQuantityLimitResponse } from 'app/cart/__tests__/cart.mock'
import {
  categories,
  categoryDetail,
} from 'app/catalog/__scenarios__/categories'
import {
  productBaseDetail,
  productWithoutXSelling,
} from 'app/catalog/__scenarios__/product'
import {
  orderCart,
  orderCartDraft,
  orderCartWithValidPrice,
} from 'app/order/__scenarios__/orderCart'
import {
  preparedLines,
  preparingOrder,
} from 'app/order/__scenarios__/orderDetail'
import { ordersList } from 'app/order/__scenarios__/orderList'
import { mockedOrder } from 'app/order/__tests__/order.mock'
import {
  addProduct,
  decreaseProductFromCart,
  increaseProductFromCart,
  laterButtonDraftAlert,
  openProductDetail,
  seeChangesButtonDraftAlert,
} from 'pages/helpers'
import { shoppingLists } from 'pages/shopping-lists/__tests__/scenarios'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Edit order', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should display proper information', async () => {
    const responses = [
      { path: '/customers/1/orders/1235/', responseBody: mockedOrder },
      { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetail },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ]
    wrap(App)
      .atPath('/orders/1235/edit/products/')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Products in my order')

    expect(screen.getByText('Products in my order')).toBeInTheDocument()
    expect(screen.getByText('Save changes')).toBeInTheDocument()
  })

  it('should show the limit products alert', async () => {
    const responses = [
      { path: '/customers/1/orders/1235/', responseBody: mockedOrder },
      {
        path: `/customers/1/orders/1235/cart/`,
        responseBody: cartApiWithQuantityLimitResponse,
      },
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetail },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ]
    wrap(App)
      .atPath('/orders/1235/edit/products/')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Products in my order')
    increaseProductFromCart('Fideos orientales Yakisoba sabor pollo Hacendado')
    const modal = await screen.findByRole('dialog')

    expect(modal).toHaveTextContent('Maximum quantity')
    expect(modal).toHaveTextContent(
      'You have reached the maximum number of units that we can serve you of this product',
    )
    expect(modal).toHaveTextContent('OK')
  })

  it('should display the confirmation alert when the order is edited', async () => {
    const responses = [
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetail },
      { path: '/customers/1/orders/5/', responseBody: mockedOrder },
      {
        path: '/customers/1/orders/5/cart/',
        responseBody: orderCartWithValidPrice,
      },
      {
        path: '/customers/1/orders/5/cart/',
        method: 'put',
        requestBody: {
          cart: {
            id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
            lines: [
              { id: 1, product_id: '3317', quantity: 20.1, sources: ['+CA'] },
              { id: 2, product_id: '71502', quantity: 3, sources: [] },
            ],
          },
        },
        responseBody: {},
      },
      {
        path: '/customers/1/orders/5/lines/prepared/',
        responseBody: preparedLines,
      },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ]
    wrap(App)
      .atPath('/orders/5/edit/products/')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Products in my order')
    increaseProductFromCart('Uva blanca con semillas')
    confirmOrderEdition()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'save_purchase_products_click',
      {
        cart_id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        purchase_id: 5,
        price: 214.61,
      },
    )

    const modal = await screen.findByRole('dialog')

    expect(modal).toHaveTextContent('Order updated')
    expect(modal).toHaveTextContent(
      'You can check the changes made on your order.',
    )
    expect(modal).toHaveTextContent('Understood')
    expect(Tracker.sendViewChange).toHaveBeenCalledWith(
      'edit_purchase_completed_alert',
    )
  })

  it('should not update the product price if is not removed', async () => {
    const responses = [
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetail },
      { path: '/customers/1/orders/1235/', responseBody: mockedOrder },
      { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
      {
        path: '/customers/1/orders/1235/cart/',
        method: 'put',
        requestBody: {
          cart: {
            id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
            lines: [
              { product_id: '58110', quantity: 1, sources: ['+SA'] },
              { id: 1, product_id: '3317', quantity: 1.9, sources: ['-CA'] },
              { id: 2, product_id: '71502', quantity: 3, sources: [] },
            ],
          },
        },
        responseBody: {},
      },
      {
        path: '/customers/1/orders/5/lines/prepared/',
        responseBody: preparedLines,
      },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ]
    wrap(App)
      .atPath('/orders/1235/edit/products/')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Products in my order')
    searchProducts('jam')
    await screen.findByText('Jamón serrano Hacendado')
    addProduct('Jamón serrano Hacendado')
    decreaseProductFromCart('Uva blanca con semillas')
    confirmOrderEdition()
    await screen.findByRole('dialog')

    expect('/customers/1/orders/1235/cart/').toHaveBeenFetchedWith({
      method: 'PUT',
      body: {
        cart: {
          id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
          lines: [
            { product_id: '58110', quantity: 1, sources: ['+SA'] },
            { id: 1, product_id: '3317', quantity: 1.9, sources: ['-CA'] },
            { id: 2, product_id: '71502', quantity: 3, sources: [] },
          ],
        },
      },
    })
  })

  it('should update the product price for new products added to the order', async () => {
    const responses = [
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetail },
      { path: '/customers/1/orders/1235/', responseBody: mockedOrder },
      { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
      {
        path: '/customers/1/orders/1235/cart/',
        method: 'put',
        requestBody: {
          cart: {
            id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
            lines: [
              { product_id: '58110', quantity: 1, sources: ['+SA'] },
              { id: 1, product_id: '3317', quantity: 2, sources: [] },
              { id: 2, product_id: '71502', quantity: 3, sources: [] },
            ],
          },
        },
        responseBody: {},
      },
      {
        path: '/customers/1/orders/5/lines/prepared/',
        responseBody: preparedLines,
      },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ]
    wrap(App)
      .atPath('/orders/1235/edit/products/')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Products in my order')
    searchProducts('jam')
    await screen.findByText('Jamón serrano Hacendado')
    addProduct('Jamón serrano Hacendado')
    confirmOrderEdition()
    await screen.findByRole('dialog')

    expect('/customers/1/orders/1235/cart/').toHaveBeenFetchedWith({
      method: 'PUT',
      body: {
        cart: {
          id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
          lines: [
            { product_id: '58110', quantity: 1, sources: ['+SA'] },
            { id: 1, product_id: '3317', quantity: 2, sources: [] },
            { id: 2, product_id: '71502', quantity: 3, sources: [] },
          ],
        },
      },
    })
  })

  it('should display the alert after close the tab', async () => {
    const responses = [
      { path: '/customers/1/orders/1235/', responseBody: mockedOrder },
      { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetail },
      {
        path: '/customers/1/orders/5/lines/prepared/',
        responseBody: preparedLines,
      },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ]
    wrap(App)
      .atPath('/orders/1235/edit/products/')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Products in my order')
    increaseProductFromCart('Uva blanca con semillas')
    closeTab()

    expect(Tracker.sendViewChange).toHaveBeenCalledWith(
      'system_dismiss_edit_purchase_alert',
    )
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'system_dismiss_edit_purchase_alert_confirm_click',
    )
  })

  it('should send a log when lost the connectivity', async () => {
    const responses = [
      { path: '/customers/1/orders/1235/', responseBody: mockedOrder },
      { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetail },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ]
    wrap(App)
      .atPath('/orders/1235/edit/products/')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Products in my order')
    setOnline()

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'lost_connectivity_editing_order',
    )
  })

  it('should redirect to order list when the user try to edit a not editable order', async () => {
    const responses = [
      { path: '/customers/1/orders/1235/', responseBody: preparingOrder },
      { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetail },
      { path: `/customers/1/orders/`, responseBody: ordersList },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ]
    wrap(App)
      .atPath('/orders/1235/edit/products/')
      .withNetwork(responses)
      .withLogin()
      .mount()

    const title = await screen.findByRole('heading', { name: 'My orders' })

    expect(title).toBeInTheDocument()
    expect(Tracker.sendViewChange).toHaveBeenCalledWith('my_purchases')
  })

  it('should not show the breadcrumb in the product detail', async () => {
    const responses = [
      { path: '/customers/1/orders/1235/', responseBody: mockedOrder },
      { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetail },
      { path: `/customers/1/orders/`, responseBody: ordersList },
      { path: `/products/8731/`, responseBody: productBaseDetail },
      {
        path: `/products/8731/xselling/`,
        responseBody: productWithoutXSelling,
      },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ]
    wrap(App)
      .atPath('/orders/1235/edit/products/')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Products in my order')
    await openProductDetail('Fideos orientales Yakisoba sabor pollo Hacendado')
    await screen.findByText(
      'Descripción Fideos orientales Yakisoba sabor pollo',
    )

    const productDetail = await screen.findByRole('dialog')
    expect(productDetail).not.toHaveTextContent('Arroz, legumbres y pasta')
  })

  it('should update the draft when the user add a product', async () => {
    const responses = [
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetail },
      { path: '/customers/1/orders/1235/', responseBody: mockedOrder },
      { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
      {
        path: '/customers/1/orders/1235/cart/draft/',
        method: 'put',
        requestBody: {
          id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
          lines: [
            { quantity: 1, product_id: '58110', sources: ['+SA'] },
            { id: 1, quantity: 2, product_id: '3317', sources: [] },
            { id: 2, quantity: 3, product_id: '71502', sources: [] },
          ],
        },
        responseBody: {},
      },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ]
    wrap(App)
      .atPath('/orders/1235/edit/products/')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Products in my order')
    searchProducts('jam')

    await screen.findAllByText('Jamón serrano Hacendado')
    addProduct('Jamón serrano Hacendado')

    expect('/customers/1/orders/1235/cart/draft/').toHaveBeenFetchedWith({
      method: 'PUT',
      body: {
        id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        lines: [
          { quantity: 1, product_id: '58110', sources: ['+SA'] },
          { id: 1, quantity: 2, product_id: '3317', sources: [] },
          { id: 2, quantity: 3, product_id: '71502', sources: [] },
        ],
        origin: 'edit_order',
      },
    })
  })

  it('should update the draft when the user decrease a product', async () => {
    const responses = [
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetail },
      { path: '/customers/1/orders/1235/', responseBody: mockedOrder },
      { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
      {
        path: '/customers/1/orders/1235/cart/draft/',
        method: 'put',
        requestBody: {
          id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
          lines: [
            { id: 1, quantity: 2, product_id: '3317', sources: [] },
            { id: 2, quantity: 2, product_id: '71502', sources: ['-CA'] },
          ],
        },
        responseBody: {},
      },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ]
    wrap(App)
      .atPath('/orders/1235/edit/products/')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Products in my order')

    decreaseProductFromCart(
      'Plataforma mopa grande abrillantadora Bosque Verde',
    )

    expect('/customers/1/orders/1235/cart/draft/').toHaveBeenFetchedWith({
      method: 'PUT',
      body: {
        origin: 'edit_order',
        id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        lines: [
          { id: 1, product_id: '3317', quantity: 2, sources: [] },
          { id: 2, product_id: '71502', quantity: 2, sources: ['-CA'] },
        ],
      },
    })
  })

  it('should get the draft when the user arrives to order', async () => {
    const responses = [
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetail },
      { path: '/customers/1/orders/1235/', responseBody: mockedOrder },
      { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
      {
        path: '/customers/1/orders/1235/cart/draft/',
        responseBody: orderCartDraft,
      },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ]
    wrap(App)
      .atPath('/orders/1235/edit/products/')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Products in my order')
    const cartProducts = screen.getAllByTestId('cart-product-cell')

    expect(cartProducts[0]).toHaveTextContent(
      'Uva blanca con semillas2,11 € /200 gIn cart5 kgAdd to cart',
    )

    expect('/customers/1/orders/1235/cart/draft/').toHaveBeenFetchedTimes(1)
  })

  it('should get the cart order when the user arrives to order and the draft is undefined ', async () => {
    const responses = [
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetail },
      { path: '/customers/1/orders/1235/', responseBody: mockedOrder },
      { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
      {
        path: '/customers/1/orders/1235/cart/draft/',
        responseBody: undefined,
      },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ]
    wrap(App)
      .atPath('/orders/1235/edit/products/')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Products in my order')
    const cartProducts = screen.getAllByTestId('cart-product-cell')

    expect(cartProducts[0]).toHaveTextContent(
      'Uva blanca con semillas2,11 € /200 gIn cart2 kgAdd to cart',
    )
  })

  it('should  not show a reminder modal if the user goes to another tab and comes back after 20 minutes if there is no draft', async () => {
    const responses = [
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetail },
      { path: '/customers/1/orders/1235/', responseBody: mockedOrder },
      { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
      {
        path: '/customers/1/orders/1235/cart/draft/',
        responseBody: undefined,
      },
      {
        path: '/customers/1/orders/cart/drafts/?lang=en&wh=vlc1',
        responseBody: undefined,
      },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ]
    wrap(App)
      .atPath('/orders/1235/edit/products/')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Products in my order')

    Object.defineProperty(document, 'visibilityState', {
      value: 'hidden',
      writable: true,
    })

    fireEvent(document, new Event('visibilitychange'))

    Object.defineProperty(document, 'visibilityState', {
      value: 'visible',
      writable: true,
    })
    fireEvent(document, new Event('visibilitychange'))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('should show a reminder modal if the user goes to another tab and comes back after 60 minutes', async () => {
    const responses = [
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetail },
      { path: '/customers/1/orders/1235/', responseBody: mockedOrder },
      { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
      {
        path: '/customers/1/orders/1235/cart/draft/',
        responseBody: undefined,
      },
      {
        path: '/customers/1/orders/cart/drafts/?lang=en&wh=vlc1',
        responseBody: {
          order_id: 26523,
          payment_status: 0,
          start_date: '2023-11-13T19:00:00Z',
          end_date: '2023-11-13T20:00:00Z',
          service_rating_token: null,
          warehouse_code: 'vlc1',
        },
      },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ]
    wrap(App)
      .atPath('/orders/1235/edit/products/')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Products in my order')

    Object.defineProperty(document, 'visibilityState', {
      value: 'hidden',
      writable: true,
    })

    fireEvent(document, new Event('visibilitychange'))

    Object.defineProperty(document, 'visibilityState', {
      value: 'visible',
      writable: true,
    })
    fireEvent(document, new Event('visibilitychange'))

    await screen.findByRole('dialog')

    expect(
      await screen.findByRole('heading', {
        name: 'You have made unsaved changes to your order',
      }),
    ).toBeInTheDocument()
  })

  it('should not navigate to the order page if it is already on the order page when click on the alertDraft modal', async () => {
    const responses = [
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetail },
      { path: '/customers/1/orders/1235/', responseBody: mockedOrder },
      { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
      {
        path: '/customers/1/orders/1235/cart/draft/',
        responseBody: undefined,
      },
      {
        path: '/customers/1/orders/cart/drafts/?lang=en&wh=vlc1',
        responseBody: {
          order_id: 1235,
          payment_status: 0,
          start_date: '2023-11-13T19:00:00Z',
          end_date: '2023-11-13T20:00:00Z',
          service_rating_token: null,
          warehouse_code: 'vlc1',
        },
      },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ]
    wrap(App)
      .atPath('/orders/1235/edit/products/')
      .withNetwork(responses)
      .withLogin()
      .mount()
    const pushSpy = vi.spyOn(history, 'push')
    await screen.findByText('Products in my order')

    screen.findByRole('heading', {
      name: 'You have made unsaved changes to your order',
    })

    seeChangesButtonDraftAlert()
    expect(pushSpy).not.toHaveBeenCalled()
  })

  describe('Metrics', () => {
    beforeEach(() => vi.useFakeTimers())

    afterEach(async () => {
      vi.runOnlyPendingTimers()
    })
    it('should send metric unsaved_edition_modal_view when show the draft alert', async () => {
      const responses = [
        { path: '/categories/', responseBody: categories },
        { path: '/categories/112/', responseBody: categoryDetail },
        { path: '/customers/1/orders/1235/', responseBody: mockedOrder },
        { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
        {
          path: '/customers/1/orders/1235/cart/draft/',
          responseBody: undefined,
        },
        {
          path: '/customers/1/orders/cart/drafts/?lang=en&wh=vlc1',
          responseBody: {
            order_id: 26523,
            payment_status: 0,
            start_date: '2023-11-13T19:00:00Z',
            end_date: '2023-11-13T20:00:00Z',
            service_rating_token: null,
            warehouse_code: 'vlc1',
          },
        },
        { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
      ]
      wrap(App)
        .atPath('/orders/1235/edit/products/')
        .withNetwork(responses)
        .withLogin()
        .mount()

      await screen.findByText('Products in my order')

      Object.defineProperty(document, 'visibilityState', {
        value: 'hidden',
        writable: true,
      })

      fireEvent(document, new Event('visibilitychange'))

      Object.defineProperty(document, 'visibilityState', {
        value: 'visible',
        writable: true,
      })
      fireEvent(document, new Event('visibilitychange'))

      await screen.findByRole('dialog')

      await screen.findByRole('heading', {
        name: 'You have made unsaved changes to your order',
      })

      expect(Tracker.sendInteraction).toHaveBeenCalledWith(
        'unsaved_edition_modal_view',
        {
          order_id: 26523,
          isShowhedByTime: 'false',
        },
      )
    })

    it('should send metric unsaved_edition_modal_click when user clicks on the later draft alert', async () => {
      const responses = [
        { path: '/categories/', responseBody: categories },
        { path: '/categories/112/', responseBody: categoryDetail },
        { path: '/customers/1/orders/1235/', responseBody: mockedOrder },
        { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
        {
          path: '/customers/1/orders/1235/cart/draft/',
          responseBody: undefined,
        },
        {
          path: '/customers/1/orders/cart/drafts/?lang=en&wh=vlc1',
          responseBody: {
            order_id: 26523,
            payment_status: 0,
            start_date: '2023-11-13T19:00:00Z',
            end_date: '2023-11-13T20:00:00Z',
            service_rating_token: null,
            warehouse_code: 'vlc1',
          },
        },
        { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
      ]
      wrap(App)
        .atPath('/orders/1235/edit/products/')
        .withNetwork(responses)
        .withLogin()
        .mount()

      await screen.findByText('Products in my order')

      Object.defineProperty(document, 'visibilityState', {
        value: 'hidden',
        writable: true,
      })

      fireEvent(document, new Event('visibilitychange'))

      Object.defineProperty(document, 'visibilityState', {
        value: 'visible',
        writable: true,
      })
      fireEvent(document, new Event('visibilitychange'))

      await screen.findByRole('dialog')

      await screen.findByRole('heading', {
        name: 'You have made unsaved changes to your order',
      })
      laterButtonDraftAlert()

      expect(Tracker.sendInteraction).toHaveBeenCalledWith(
        'unsaved_edition_modal_view',
        {
          order_id: 26523,
          isShowhedByTime: 'false',
        },
      )
      expect(Tracker.sendInteraction).toHaveBeenCalledWith(
        'unsaved_edition_modal_click',
        {
          order_id: 26523,
          option: 'view_later',
        },
      )
    })
    it('should send metric unsaved_edition_modal_click when user clicks on the see changes draft alert', async () => {
      const responses = [
        { path: '/categories/', responseBody: categories },
        { path: '/categories/112/', responseBody: categoryDetail },
        { path: '/customers/1/orders/1235/', responseBody: mockedOrder },
        { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
        {
          path: '/customers/1/orders/1235/cart/draft/',
          responseBody: undefined,
        },
        {
          path: '/customers/1/orders/cart/drafts/?lang=en&wh=vlc1',
          responseBody: {
            order_id: 26523,
            payment_status: 0,
            start_date: '2023-11-13T19:00:00Z',
            end_date: '2023-11-13T20:00:00Z',
            service_rating_token: null,
            warehouse_code: 'vlc1',
          },
        },
        { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
      ]
      wrap(App)
        .atPath('/orders/1235/edit/products/')
        .withNetwork(responses)
        .withLogin()
        .mount()

      await screen.findByText('Products in my order')

      Object.defineProperty(document, 'visibilityState', {
        value: 'hidden',
        writable: true,
      })

      fireEvent(document, new Event('visibilitychange'))

      Object.defineProperty(document, 'visibilityState', {
        value: 'visible',
        writable: true,
      })
      fireEvent(document, new Event('visibilitychange'))

      await screen.findByRole('dialog')

      await screen.findByRole('heading', {
        name: 'You have made unsaved changes to your order',
      })
      seeChangesButtonDraftAlert()

      expect(Tracker.sendInteraction).toHaveBeenCalledWith(
        'unsaved_edition_modal_view',
        {
          order_id: 26523,
          isShowhedByTime: 'false',
        },
      )
      expect(Tracker.sendInteraction).toHaveBeenCalledWith(
        'unsaved_edition_modal_click',
        {
          order_id: 26523,
          option: 'view_changes',
        },
      )
    })
  })
})
