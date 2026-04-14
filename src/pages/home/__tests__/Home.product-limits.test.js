import { screen, within } from '@testing-library/react'

import { cloneDeep } from '../../../utils/objects'
import {
  addProductToCart,
  closeModalByText,
  closeWaterLimitAlert,
  getProductCellByDisplayName,
  increaseProductInCart,
  startCheckout,
} from './helpers'
import { configure, wrap } from 'wrapito'

import { activeVariant } from '__tests__/helpers'
import { App, history } from 'app'
import {
  emptyCart,
  localCart,
  repeatOrderLinesWith12Water,
  validatedLocalCart,
} from 'app/cart/__scenarios__/cart'
import { cartWithWaterUnpublished } from 'app/cart/__tests__/cart.mock'
import {
  homeWithDeliveredWidget,
  homeWithLimitedProducts,
} from 'app/catalog/__scenarios__/home'
import {
  unpublishedWaterProductWith100Liters,
  waterProduct,
  waterProductWith100Liters,
} from 'app/catalog/__scenarios__/product'
import {
  confirmRepeatOrder,
  repeatOrder,
} from 'pages/user-area/__tests__/helpers'
import { variants } from 'services/feature-flags/constants'
import { Storage } from 'services/storage'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Home - product limits', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    vi.clearAllMocks()
    Storage.clear()
    localStorage.clear()
  })

  it('should show limit product modal', async () => {
    Storage.setItem('cart', localCart)
    const responses = [
      {
        path: '/home/',
        responseBody: homeWithLimitedProducts,
      },
      {
        path: '/carts/',
        method: 'post',
        requestBody: localCart,
        responseBody: validatedLocalCart,
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).mount()

    await screen.findAllByText(
      'Fideos orientales Yakisoba sabor pollo Hacendado',
    )
    const productLimitedCell = getProductCellByDisplayName(
      'Fideos orientales Yakisoba sabor pollo Hacendado',
    )
    addProductToCart(productLimitedCell)
    increaseProductInCart(productLimitedCell)

    expect(productLimitedCell).toHaveTextContent('In cart1')
    const alertLimitModal = screen.queryByRole('dialog')
    expect(alertLimitModal).toHaveTextContent('Maximum quantity')
    expect(alertLimitModal).toHaveTextContent(
      'You have reached the maximum number of units that we can serve you of this product',
    )
    expect(alertLimitModal).toHaveTextContent('OK')
    expect(Tracker.sendViewChange).toHaveBeenCalledWith(
      'product_quantity_limit_alert',
      {
        product_id: '8731',
      },
    )
  })

  it('should close the limit product modal', async () => {
    Storage.setItem('cart', localCart)
    const responses = [
      {
        path: '/home/',
        responseBody: homeWithLimitedProducts,
      },
      {
        path: '/carts/',
        method: 'post',
        requestBody: localCart,
        responseBody: validatedLocalCart,
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).mount()

    await screen.findAllByText(
      'Fideos orientales Yakisoba sabor pollo Hacendado',
    )
    const productLimitedCell = getProductCellByDisplayName(
      'Fideos orientales Yakisoba sabor pollo Hacendado',
    )
    addProductToCart(productLimitedCell)
    increaseProductInCart(productLimitedCell)
    const alertLimitModal = screen.queryByRole('dialog')
    closeModalByText(alertLimitModal, 'OK')

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('should increase water if it does not exceed the limit', async () => {
    const responses = [
      {
        path: '/home/',
        responseBody: homeWithLimitedProducts,
      },
      {
        path: '/carts/',
        method: 'post',
        requestBody: {
          id: '10000000-1000-4000-8000-100000000000',
          lines: [{ product_id: '8731', quantity: 1, sources: ['+NA'] }],
        },
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).mount()

    await screen.findByText('Agua mineral Bronchales 100 litros')
    const waterProductCell = getProductCellByDisplayName(
      'Agua mineral Bronchales',
    )

    increaseProductInCart(waterProductCell)
    increaseProductInCart(waterProductCell)

    expect(waterProductCell).toHaveTextContent('In cart2')
  })

  it('should show water limit modal and accept it', async () => {
    Storage.setItem('cart', localCart)
    const responses = [
      {
        path: '/home/',
        responseBody: homeWithLimitedProducts,
      },
      {
        path: '/carts/',
        method: 'post',
        requestBody: localCart,
        responseBody: validatedLocalCart,
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).mount()

    await screen.findByText('Agua mineral Bronchales 100 litros')
    const waterProductWith100Liters = getProductCellByDisplayName(
      'Agua mineral Bronchales 100 litros',
    )
    addProductToCart(waterProductWith100Liters)
    increaseProductInCart(waterProductWith100Liters)

    expect(screen.getByRole('dialog')).toHaveTextContent(
      'Maximum limit for water',
    )
    expect(Tracker.sendViewChange).toHaveBeenCalledWith(
      'water_quantity_limit_alert',
    )
  })

  it('should close the water limit modal', async () => {
    Storage.setItem('cart', localCart)
    const responses = [
      {
        path: '/home/',
        responseBody: homeWithLimitedProducts,
      },
      {
        path: '/carts/',
        method: 'post',
        requestBody: localCart,
        responseBody: validatedLocalCart,
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).mount()

    await screen.findByText('Agua mineral Bronchales 100 litros')
    const waterProductWith100Liters = getProductCellByDisplayName(
      'Agua mineral Bronchales 100 litros',
    )
    addProductToCart(waterProductWith100Liters)
    increaseProductInCart(waterProductWith100Liters)
    closeModalByText(screen.getByRole('dialog'), 'OK')

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('should show water limit quantity properly with unpublished products', async () => {
    const responses = [
      {
        path: '/customers/1/home/',
        responseBody: homeWithLimitedProducts,
      },
      {
        path: '/customers/1/cart/',
        method: 'put',
        requestBody: {
          id: cartWithWaterUnpublished.id,
          lines: [
            {
              product_id: waterProductWith100Liters.id,
              quantity: 1,
              sources: ['+NA'],
            },
            {
              product_id: unpublishedWaterProductWith100Liters.id,
              quantity: 1,
              sources: [],
            },
          ],
        },
      },
      {
        path: '/customers/1/cart/',
        method: 'put',
        requestBody: {
          id: cartWithWaterUnpublished.id,
          lines: [
            {
              product_id: waterProduct.id,
              quantity: 1,
              sources: ['+NA'],
            },
            {
              product_id: waterProductWith100Liters.id,
              quantity: 1,
              sources: ['+NA'],
            },
            {
              product_id: unpublishedWaterProductWith100Liters.id,
              quantity: 1,
              sources: [],
            },
          ],
        },
      },
    ]
    wrap(App)
      .atPath('/')
      .withNetwork(responses)
      .withLogin({ cart: cartWithWaterUnpublished })
      .mount()

    await screen.findByText('Agua mineral Bronchales 100 litros')
    const waterProductWith100LitersCell = getProductCellByDisplayName(
      'Agua mineral Bronchales 100 litros',
    )
    const waterProductCell = getProductCellByDisplayName(
      'Agua mineral Bronchales',
    )
    addProductToCart(waterProductWith100LitersCell)
    addProductToCart(waterProductCell)
    const limitProductAlert = await screen.findByRole('dialog')

    expect(waterProductWith100LitersCell).toHaveTextContent('In cart1')
    expect(limitProductAlert).toHaveTextContent(100)
    expect(limitProductAlert).toHaveTextContent(100)
  })

  it('should show water limit quantity properly even with a disabled variant with unpublished products', async () => {
    const responses = [
      {
        path: '/customers/1/home/',
        responseBody: homeWithLimitedProducts,
      },
      {
        path: '/customers/1/cart/',
        method: 'put',
        requestBody: {
          id: cartWithWaterUnpublished.id,
          lines: [
            {
              product_id: waterProductWith100Liters.id,
              quantity: 1,
              sources: ['+NA'],
            },
            {
              product_id: unpublishedWaterProductWith100Liters.id,
              quantity: 1,
              sources: [],
            },
          ],
        },
      },
      {
        path: '/customers/1/cart/',
        method: 'put',
        requestBody: {
          id: cartWithWaterUnpublished.id,
          lines: [
            {
              product_id: waterProduct.id,
              quantity: 1,
              sources: ['+NA'],
            },
            {
              product_id: waterProductWith100Liters.id,
              quantity: 1,
              sources: ['+NA'],
            },
            {
              product_id: unpublishedWaterProductWith100Liters.id,
              quantity: 1,
              sources: [],
            },
          ],
        },
      },
    ]

    wrap(App)
      .atPath('/')
      .withNetwork(responses)
      .withLogin({ cart: cartWithWaterUnpublished })
      .mount()

    await screen.findByText('Agua mineral Bronchales 100 litros')
    const waterProductWith100LitersCell = getProductCellByDisplayName(
      'Agua mineral Bronchales 100 litros',
    )
    const waterProductCell = getProductCellByDisplayName(
      'Agua mineral Bronchales',
    )
    addProductToCart(waterProductWith100LitersCell)
    addProductToCart(waterProductCell)
    const limitProductAlert = await screen.findByRole('dialog')

    expect(limitProductAlert).toHaveTextContent(
      'The maximum limit of water per order is 100 and you currently have 100 litres.',
    )
  })

  it('should show water limit quantity properly even with enabled variant with unpublished products', async () => {
    activeVariant(variants.MAXIMUM_WATER_LITERS, 101)

    const responses = [
      {
        path: '/customers/1/home/',
        responseBody: homeWithLimitedProducts,
      },
      {
        path: '/customers/1/cart/',
        method: 'put',
        requestBody: {
          id: cartWithWaterUnpublished.id,
          lines: [
            {
              product_id: waterProductWith100Liters.id,
              quantity: 1,
              sources: ['+NA'],
            },
            {
              product_id: unpublishedWaterProductWith100Liters.id,
              quantity: 1,
              sources: [],
            },
          ],
        },
      },
      {
        path: '/customers/1/cart/',
        method: 'put',
        requestBody: {
          id: cartWithWaterUnpublished.id,
          lines: [
            {
              product_id: waterProduct.id,
              quantity: 1,
              sources: ['+NA'],
            },
            {
              product_id: waterProductWith100Liters.id,
              quantity: 1,
              sources: ['+NA'],
            },
            {
              product_id: unpublishedWaterProductWith100Liters.id,
              quantity: 1,
              sources: [],
            },
          ],
        },
      },
    ]

    wrap(App)
      .atPath('/')
      .withNetwork(responses)
      .withLogin({ cart: cartWithWaterUnpublished })
      .mount()

    await screen.findByText('Agua mineral Bronchales 100 litros')
    const waterProductWith100LitersCell = getProductCellByDisplayName(
      'Agua mineral Bronchales 100 litros',
    )
    const waterProductCell = getProductCellByDisplayName(
      'Agua mineral Bronchales',
    )
    addProductToCart(waterProductWith100LitersCell)
    addProductToCart(waterProductCell)
    const limitProductAlert = await screen.findByRole('dialog')

    expect(limitProductAlert).toHaveTextContent(
      'The maximum limit of water per order is 101 and you currently have 100 litres.',
    )
  })

  it('should allow to repeat the order and show the water limit image modal', async () => {
    const responses = [
      {
        path: '/customers/1/home/',
        responseBody: homeWithDeliveredWidget,
      },
      {
        path: '/customers/1/orders/1005/repeat/',
        responseBody: { results: repeatOrderLinesWith12Water },
      },
      {
        path: '/customers/1/cart/?lang=en&wh=vlc1',
        method: 'put',
        requestBody: {
          id: '10000000-1000-4000-8000-100000000000',
          lines: [
            { quantity: 50, product_id: '8731', sources: ['+RO', '+RO'] },
            {
              quantity: 12,
              product_id: '28491',
              sources: ['+RO', '+RO', '+RO'],
            },
          ],
        },
        responseBody: { results: repeatOrderLinesWith12Water },
      },
      {
        path: '/customers/1/checkouts/?lang=en&wh=vlc1',
        method: 'post',
        status: 400,
        requestBody: {
          cart: {
            id: '10000000-1000-4000-8000-100000000000',
            lines: [
              { quantity: 50, product_id: '8731', sources: ['+RO', '+RO'] },
              {
                quantity: 12,
                product_id: '28491',
                sources: ['+RO', '+RO', '+RO'],
              },
            ],
          },
        },
        responseBody: {
          errors: [
            {
              detail:
                'The water limit per order is 100 litres. You have to remove 17 litres.',
              code: 'max_water_liters_in_cart_error',
            },
          ],
        },
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Próxima entrega')

    repeatOrder()
    const repeatOrderModal = screen.getByRole('dialog', {
      name: 'Repeat order. By continuing, the products and quantities of this order will be added to your cart. Do not forget to check the cart to make sure you have everything you need.',
    })
    confirmRepeatOrder()
    await screen.findByText('Cart updated')

    screen.getByLabelText('Show cart')
    expect(repeatOrderModal).not.toBeInTheDocument()

    startCheckout()
    const alert = await screen.findByRole('dialog')
    const waterImage = screen.getAllByRole('img')[0]

    expect(waterImage).toHaveAttribute(
      'src',
      '/src/app/catalog/containers/product-extra-water-handler/assets/extra@2x.png',
    )
    expect(
      within(alert).getByText(
        'The water limit per order is 100 litres. You have to remove 17 litres.',
      ),
    )
    closeWaterLimitAlert()
    expect(
      await screen.findByRole('heading', {
        name: 'Mercadona online shopping',
      }),
    ).toBeInTheDocument()
  })

  it('should allow to repeat the order and show the error from backend', async () => {
    const cartWith12Water = cloneDeep(emptyCart)
    cartWith12Water.lines = repeatOrderLinesWith12Water

    const responses = [
      {
        path: '/customers/1/home/',
        responseBody: homeWithDeliveredWidget,
      },
      {
        path: '/customers/1/orders/1005/repeat/',
        responseBody: { results: repeatOrderLinesWith12Water },
      },
      {
        path: '/customers/1/cart/?lang=en&wh=vlc1',
        method: 'put',
        requestBody: {
          id: '10000000-1000-4000-8000-100000000000',
          lines: [
            { quantity: 50, product_id: '8731', sources: ['+RO', '+RO'] },
            {
              quantity: 12,
              product_id: '28491',
              sources: ['+RO', '+RO', '+RO'],
            },
          ],
        },
        responseBody: { results: repeatOrderLinesWith12Water },
      },
      {
        path: '/customers/1/checkouts/?lang=en&wh=vlc1',
        method: 'post',
        status: 400,
        requestBody: {
          cart: {
            id: '10000000-1000-4000-8000-100000000000',
            lines: [
              { quantity: 50, product_id: '8731', sources: ['+RO', '+RO'] },
              {
                quantity: 12,
                product_id: '28491',
                sources: ['+RO', '+RO', '+RO'],
              },
            ],
          },
        },
        responseBody: {
          errors: [
            {
              detail:
                'The water limit per order is 100 litres. You have to remove 17 litres.',
              code: 'max_water_liters_in_cart_error',
            },
          ],
        },
      },
      {
        path: `/customers/1/cart/?lang=en&wh=vlc1`,
        multipleResponses: [
          { responseBody: emptyCart },
          { responseBody: cartWith12Water },
        ],
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Próxima entrega')

    repeatOrder()
    const repeatOrderModal = screen.getByRole('dialog', {
      name: 'Repeat order. By continuing, the products and quantities of this order will be added to your cart. Do not forget to check the cart to make sure you have everything you need.',
    })
    confirmRepeatOrder()
    await screen.findByText('Cart updated')

    screen.getByLabelText('Show cart')
    expect(repeatOrderModal).not.toBeInTheDocument()

    startCheckout()

    const alert = await screen.findByRole('dialog')

    expect(
      within(alert).getByText(
        'The water limit per order is 100 litres. You have to remove 17 litres.',
      ),
    )
    closeWaterLimitAlert()
    expect(
      screen.getByRole('button', {
        name: 'Checkout',
      }),
    ).toBeInTheDocument()
  })

  it("should don't go to the checkout page and show the water limit modal", async () => {
    const pushSpy = vi.spyOn(history, 'push')

    const responses = [
      {
        path: '/customers/1/home/',
        responseBody: homeWithDeliveredWidget,
      },
      {
        path: '/customers/1/orders/1005/repeat/',
        responseBody: { results: repeatOrderLinesWith12Water },
      },
      {
        path: '/customers/1/cart/?lang=en&wh=vlc1',
        method: 'put',
        requestBody: {
          id: '10000000-1000-4000-8000-100000000000',
          lines: [
            { quantity: 50, product_id: '8731', sources: ['+RO', '+RO'] },
            {
              quantity: 12,
              product_id: '28491',
              sources: ['+RO', '+RO', '+RO'],
            },
          ],
        },
        responseBody: { results: repeatOrderLinesWith12Water },
      },
      {
        path: '/customers/1/checkouts/?lang=en&wh=vlc1',
        method: 'post',
        status: 400,
        requestBody: {
          cart: {
            id: '10000000-1000-4000-8000-100000000000',
            lines: [
              { quantity: 50, product_id: '8731', sources: ['+RO', '+RO'] },
              {
                quantity: 12,
                product_id: '28491',
                sources: ['+RO', '+RO', '+RO'],
              },
            ],
          },
        },
        responseBody: {
          errors: [
            {
              detail:
                'The water limit per order is 100 litres. You have to remove 17 litres.',
              code: 'max_water_liters_in_cart_error',
            },
          ],
        },
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Próxima entrega')

    repeatOrder()
    confirmRepeatOrder()
    await screen.findByText('Cart updated')
    startCheckout()

    expect('/customers/1/checkouts/?lang=en&wh=vlc1').toHaveBeenFetchedWith({
      method: 'POST',
      body: {
        cart: {
          id: '10000000-1000-4000-8000-100000000000',
          lines: [
            { quantity: 50, product_id: '8731', sources: ['+RO', '+RO'] },
            {
              quantity: 12,
              product_id: '28491',
              sources: ['+RO', '+RO', '+RO'],
            },
          ],
        },
      },
    })

    const alert = await screen.findByRole('dialog')

    within(alert).getByText(
      'The water limit per order is 100 litres. You have to remove 17 litres.',
    )

    closeWaterLimitAlert()

    expect(
      screen.queryByText('Delivery address for this order'),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('searchbox', {
        name: 'Search products',
      }),
    ).toBeInTheDocument()
    expect(pushSpy).toHaveBeenCalledTimes(1)
  })
})
