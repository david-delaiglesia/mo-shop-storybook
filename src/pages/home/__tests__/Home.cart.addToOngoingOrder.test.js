import { screen, within } from '@testing-library/react'

import {
  addCartToOngoingOrder,
  cancelQuantityProductLimitAlert,
  closeCart,
  closeGenericAlert,
  closeWaterLimitAlert,
  createNewOrder,
  goBackToCart,
  openCart,
} from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import {
  cart,
  cartWithOngoingOrder,
  expensiveCartRequest,
  mergedCartWithExceededProducts,
} from 'app/cart/__scenarios__/cart'
import { homeWithWidget } from 'app/catalog/__scenarios__/home'
import { CheckoutMother } from 'app/checkout/__scenarios__/CheckoutMother'
import { Storage } from 'services/storage'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Home - Cart - Add to last purchase', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    vi.clearAllMocks()
    Storage.clear()
    localStorage.clear()
  })

  it('should display "Add to order" button when there is an ongoing order', async () => {
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithWidget },
      { path: '/customers/1/cart/', responseBody: cartWithOngoingOrder },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Próxima entrega')
    openCart()
    const addToOngoingOrderButton = await screen.findByText(
      'Add to current order',
    )

    const expectedCartMetricProperty = expect.objectContaining({
      ongoing_order: true,
    })
    expect(addToOngoingOrderButton).toBeInTheDocument()
    expect(screen.getByText('Confirm new order')).toBeInTheDocument()
    expect(screen.queryByText('Checkout')).not.toBeInTheDocument()
    expect(Tracker.sendViewChange).toHaveBeenCalledWith(
      'cart',
      expectedCartMetricProperty,
    )
  })

  it('should not display "Add to order" button when there is not an ongoing order', async () => {
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithWidget },
      { path: '/customers/1/cart/', responseBody: cart },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Próxima entrega')
    openCart()
    const createCheckoutButton = await screen.findByText('Checkout')

    const expectedCartMetricProperty = expect.objectContaining({
      ongoing_order: false,
    })
    expect(createCheckoutButton).toBeInTheDocument()
    expect(screen.queryByText('Confirm new order')).not.toBeInTheDocument()
    expect(screen.queryByText('Add to current order')).not.toBeInTheDocument()
    expect(Tracker.sendViewChange).toHaveBeenCalledWith(
      'cart',
      expectedCartMetricProperty,
    )
  })

  it('should display the product limit alert', async () => {
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithWidget },
      { path: '/customers/1/cart/', responseBody: cartWithOngoingOrder },
      {
        path: '/customers/1/orders/44051/cart/validate-merge/',
        method: 'post',
        requestBody: expensiveCartRequest,
        responseBody: { ...mergedCartWithExceededProducts },
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Próxima entrega')
    openCart()
    await screen.findByText('Add to current order')
    addCartToOngoingOrder()

    expect(screen.getByLabelText('Loading')).toBeInTheDocument()

    await screen.findByText('The maximum amount is exceeded for some products')

    const cart = screen.getByRole('complementary')
    const image = screen.getByAltText('Warning triangle')
    const { getByAltText: getByAltTextInCart } = within(cart)
    expect(image).toBeInTheDocument()
    expect(cart).toHaveTextContent(
      'The maximum amount is exceeded for some products',
    )
    expect(cart).toHaveTextContent(
      'We are currently limiting the number of units that can be purchased in an order. The following products are affected.',
    )
    expect(cart).toHaveTextContent('Accept')
    expect(cart).toHaveTextContent('Back')
    expect(cart).not.toHaveTextContent('Cart')
    expect(cart).toHaveTextContent(
      'Fideos orientales Yakisoba sabor pollo Hacendado',
    )
    expect(
      getByAltTextInCart('Fideos orientales Yakisoba sabor pollo Hacendado'),
    ).toBeInTheDocument()
    expect(cart).toHaveTextContent('You will receive:')
    expect(cart).toHaveTextContent('1000 units')
    expect(Tracker.sendViewChange).toHaveBeenCalledWith('product_limitations', {
      limit_product_count: 1,
    })
  })

  it('should hide the product limit alert when the sidebar is closed', async () => {
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithWidget },
      { path: '/customers/1/cart/', responseBody: cartWithOngoingOrder },
      {
        path: '/customers/1/orders/44051/cart/validate-merge/',
        method: 'post',
        requestBody: expensiveCartRequest,
        responseBody: { ...mergedCartWithExceededProducts },
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Próxima entrega')
    openCart()
    await screen.findByText('Add to current order')
    addCartToOngoingOrder()
    await screen.findByText('The maximum amount is exceeded for some products')
    closeCart()
    openCart()
    await screen.findByText('Add to current order')

    expect(
      screen.queryByText('The maximum amount is exceeded for some products'),
    ).not.toBeInTheDocument()
    expect(screen.getByText('Cart')).toBeInTheDocument()
  })

  it('should go back to cart when appears quantity product alert and click go back button', async () => {
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithWidget },
      { path: '/customers/1/cart/', responseBody: cartWithOngoingOrder },
      {
        path: '/customers/1/orders/44051/cart/validate-merge/',
        method: 'post',
        requestBody: expensiveCartRequest,
        responseBody: { ...mergedCartWithExceededProducts },
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Próxima entrega')
    openCart()
    await screen.findByText('Add to current order')
    addCartToOngoingOrder()
    await screen.findByText('The maximum amount is exceeded for some products')
    closeCart()
    openCart()
    await screen.findByText('Add to current order')

    expect(
      screen.queryByText('The maximum amount is exceeded for some products'),
    ).not.toBeInTheDocument()
    expect(screen.getByText('Cart')).toBeInTheDocument()
  })

  it('should go back to cart when appears quantity product alert and click go back button', async () => {
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithWidget },
      { path: '/customers/1/cart/', responseBody: cartWithOngoingOrder },
      {
        path: '/customers/1/orders/44051/cart/validate-merge/',
        method: 'post',
        requestBody: expensiveCartRequest,
        responseBody: { ...mergedCartWithExceededProducts },
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Próxima entrega')
    openCart()
    await screen.findByText('Add to current order')
    addCartToOngoingOrder()
    await screen.findByText('The maximum amount is exceeded for some products')

    goBackToCart()

    expect(screen.getByText('Cart')).toBeInTheDocument()
  })

  it('should go back to cart when appears quantity product alert and cancels it', async () => {
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithWidget },
      { path: '/customers/1/cart/', responseBody: cartWithOngoingOrder },
      {
        path: '/customers/1/orders/44051/cart/validate-merge/',
        method: 'post',
        requestBody: expensiveCartRequest,
        responseBody: { ...mergedCartWithExceededProducts },
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Próxima entrega')
    openCart()
    await screen.findByText('Add to current order')
    addCartToOngoingOrder()
    await screen.findByText('The maximum amount is exceeded for some products')
    cancelQuantityProductLimitAlert()

    expect(screen.getByText('Cart')).toBeInTheDocument()
  })

  it('should create a new checkout when clicks on create new order button', async () => {
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithWidget },
      { path: '/customers/1/cart/', responseBody: cartWithOngoingOrder },
      {
        path: '/customers/1/checkouts/',
        method: 'post',
        requestBody: expensiveCartRequest,
        responseBody: CheckoutMother.default(),
      },
      { path: '/customers/1/orders/', responseBody: { results: [] } },
      {
        path: '/customers/1/checkouts/5/',
        responseBody: CheckoutMother.default(),
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Próxima entrega')
    openCart()
    await screen.findByText('Confirm new order')
    createNewOrder()
    await screen.findByText('Checkout')

    expect(screen.getByText('68,25 €')).toBeInTheDocument()
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

  it('should see the water alert', async () => {
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithWidget },
      { path: '/customers/1/cart/', responseBody: cartWithOngoingOrder },
      {
        path: '/customers/1/orders/44051/cart/validate-merge/',
        method: 'post',
        status: 400,
        requestBody: expensiveCartRequest,
        responseBody: {
          errors: [
            {
              detail:
                'El límite máximo de agua por pedido es de 100 litros. Y actualmente llevas 121 litros.',
              code: 'max_water_liters_in_cart_error',
            },
          ],
        },
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Próxima entrega')
    openCart()
    await screen.findByText('Add to current order')
    addCartToOngoingOrder()

    const waterAlert = await screen.findByRole('dialog', {
      name: 'Maximum limit for water. El límite máximo de agua por pedido es de 100 litros. Y actualmente llevas 121 litros.',
    })
    expect(waterAlert).toHaveTextContent('Maximum limit for water')
    expect(waterAlert).toHaveTextContent(
      'El límite máximo de agua por pedido es de 100 litros. Y actualmente llevas 121 litros.',
    )
  })

  it('should see the generic alert', async () => {
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithWidget },
      { path: '/customers/1/cart/', responseBody: cartWithOngoingOrder },
      {
        path: '/customers/1/orders/44051/cart/validate-merge/',
        method: 'post',
        status: 400,
        requestBody: expensiveCartRequest,
        responseBody: {
          errors: [
            {
              detail: 'Ha ocurrido un error procesando su petición.',
              code: 'invalid',
            },
          ],
        },
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Próxima entrega')
    openCart()
    await screen.findByText('Add to current order')
    addCartToOngoingOrder()

    const genericAlert = await screen.findByRole('dialog', {
      name: 'Something happened. Ha ocurrido un error procesando su petición.',
    })
    expect(genericAlert).toHaveTextContent('Something happened')
    expect(genericAlert).toHaveTextContent(
      'Ha ocurrido un error procesando su petición.',
    )
  })

  it('should close the water alert', async () => {
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithWidget },
      { path: '/customers/1/cart/', responseBody: cartWithOngoingOrder },
      {
        path: '/customers/1/orders/44051/cart/validate-merge/',
        method: 'post',
        status: 400,
        requestBody: expensiveCartRequest,
        responseBody: {
          errors: [
            {
              detail:
                'El límite máximo de agua por pedido es de 120 litros. Y actualmente llevas 121 litros.',
              code: 'max_water_liters_in_cart_error',
            },
          ],
        },
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Próxima entrega')
    openCart()
    await screen.findByText('Add to current order')
    addCartToOngoingOrder()
    const waterAlert = await screen.findByRole('dialog', {
      name: 'Maximum limit for water. El límite máximo de agua por pedido es de 120 litros. Y actualmente llevas 121 litros.',
    })
    closeWaterLimitAlert()

    expect(waterAlert).not.toBeInTheDocument()
  })

  it('should close the generic alert', async () => {
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithWidget },
      { path: '/customers/1/cart/', responseBody: cartWithOngoingOrder },
      {
        path: '/customers/1/orders/44051/cart/validate-merge/',
        method: 'post',
        status: 400,
        requestBody: expensiveCartRequest,
        responseBody: {
          errors: [
            {
              detail: 'Ha ocurrido un error procesando su petición.',
              code: 'invalid',
            },
          ],
        },
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Próxima entrega')
    openCart()
    await screen.findByText('Add to current order')
    addCartToOngoingOrder()
    const genericAlert = await screen.findByRole('dialog', {
      name: 'Something happened. Ha ocurrido un error procesando su petición.',
    })
    closeGenericAlert()

    expect(genericAlert).not.toBeInTheDocument()
  })
})
