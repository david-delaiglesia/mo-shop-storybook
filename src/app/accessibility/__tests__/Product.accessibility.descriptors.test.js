import { screen, within } from '@testing-library/react'

import { configure, wrap } from 'wrapito'

import { activeFeatureFlags } from '__tests__/helpers'
import { App, history } from 'app'
import 'app/cart/__tests__/cart.mock'
import { unPublishedProduct } from 'app/cart/__tests__/cart.mock'
import {
  homeWithGrid,
  homeWithPackProduct,
  homeWithProductFormats,
} from 'app/catalog/__scenarios__/home'
import { outOfStockProduct } from 'app/catalog/__scenarios__/product'
import { recommendationsWithUnpublished } from 'app/catalog/__scenarios__/recommendations'
import { orderCart } from 'app/order/__scenarios__/orderCart'
import { mockedOrder } from 'app/order/__tests__/order.mock'
import { getProductCellFromCart } from 'pages/helpers'
import { addProductToCart } from 'pages/home/__tests__/helpers'
import { cloneDeep } from 'utils/objects'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Product - Accessibility - Descriptors', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  it('should show the right label for an unit product', async () => {
    const responses = [
      {
        path: '/customers/1/home/',
        responseBody: { ...homeWithGrid },
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Novedades')

    expect(
      screen.getByRole('button', {
        name: 'Fideos orientales Yakisoba sabor pollo Hacendado, Paquete, 90 Grams, 0,85€ per Unit',
      }),
    ).toBeInTheDocument()
  })

  it('should show the right label for a pack product', async () => {
    const responses = [
      {
        path: '/customers/1/home/',
        responseBody: { ...homeWithPackProduct },
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Novedades')

    expect(
      screen.getByRole('button', {
        name: 'Plataforma mopa grande abrillantadora Bosque Verde, 90 Grams, 0,85€ per Pack',
      }),
    ).toBeInTheDocument()
  })

  it('should show the right label for a product with a price drop', async () => {
    const homeWithGridClone = cloneDeep(homeWithGrid)
    homeWithGridClone.sections[1].content.items[0].price_instructions.previous_unit_price = 0.75
    const responses = [
      {
        path: '/customers/1/home/',
        responseBody: { ...homeWithGridClone },
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Novedades')

    expect(
      screen.getByRole('button', {
        name: 'Fideos orientales Yakisoba sabor pollo Hacendado, Paquete, 90 Grams, Previous price: 0,75€ per Unit, Current price: 0,85€ per Unit',
      }),
    ).toBeInTheDocument()
  })

  it('should read "Litre" for a product with 1 L', async () => {
    const homeWithGridClone = cloneDeep(homeWithGrid)
    homeWithGridClone.sections[1].content.items[1].price_instructions.size_format =
      'l'
    homeWithGridClone.sections[1].content.items[1].price_instructions.min_bunch_amount = 1
    homeWithGridClone.sections[1].content.items[1].price_instructions.is_pack = false
    const responses = [
      {
        path: '/customers/1/home/',
        responseBody: { ...homeWithGridClone },
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Novedades')

    expect(
      screen.getByRole('button', {
        name: 'Uva blanca con semillas, Paquete, 1 Litre, 9,44€ per 1 Litre',
      }),
    ).toBeInTheDocument()
  })

  it('should read "Litres" for a product with 2 L', async () => {
    const homeWithGridClone = cloneDeep(homeWithGrid)
    homeWithGridClone.sections[1].content.items[1].price_instructions.size_format =
      'l'
    homeWithGridClone.sections[1].content.items[1].price_instructions.min_bunch_amount = 2
    const responses = [
      {
        path: '/customers/1/home/',
        responseBody: { ...homeWithGridClone },
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Novedades')

    expect(
      screen.getByRole('button', {
        name: 'Uva blanca con semillas, Paquete, 2 Litres, 18,88€ per 2 Litres',
      }),
    ).toBeInTheDocument()
  })

  it('should replace the formats with their accessible values and keep the whole descriptor', async () => {
    const responses = [
      {
        path: '/customers/1/home/',
        responseBody: { ...homeWithProductFormats },
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Novedades')

    expect(
      screen.getByRole('button', {
        name: 'Atún en aceite de girasol Hacendado, Lata, 900 Grams (650 Grams drained), 0,85€ per Unit',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: 'Pan estrellado, 1 Unit (90 g), 0,85€ per Unit',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: 'Leche semidesnatada, 6 bricks x 1 Litre, 0,85€ per Pack',
      }),
    ).toBeInTheDocument()
  })

  it('should show the right label for a product quantity in Cart', async () => {
    wrap(App)
      .atPath('/orders/1235/edit/products/')
      .withNetwork([
        { path: '/customers/1/orders/1235/', responseBody: mockedOrder },
        { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
      ])
      .withLogin()
      .mount()
    await screen.findByText('Products in my order')

    const productToAdd = getProductCellFromCart('Uva blanca con semillas')
    addProductToCart(productToAdd)

    expect(screen.getByLabelText('3 packs in cart')).toBeInTheDocument()
    expect(screen.getByLabelText('2,1 Kilos in cart')).toBeInTheDocument()
  })

  it('should show the right label for unpublished product in cart', async () => {
    activeFeatureFlags(['web-accessibility-cart'])

    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithGrid },
      {
        path: '/customers/1/cart/',
        responseBody: {
          id: '5529dc8b-0a94-4ae0-8145-de5197b542c6',
          lines: [
            {
              product: unPublishedProduct,
              quantity: 1,
              sources: [],
            },
          ],
          summary: {
            total: '64.9',
          },
          products_count: 5,
        },
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Cart')

    const unpublishedProductsTitle = screen.getByText(
      'You have unavailable products in your cart',
    )

    expect(unpublishedProductsTitle).toHaveAttribute('tabindex', '0')
    expect(
      screen.getByLabelText(
        'Ron dominicano añejo Ron Barceló, Paquete, 1 Kilo, Product not available',
      ),
    ).toBeInTheDocument()
  })

  it('should show the right label for out of stock product in cart', async () => {
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithGrid },
      {
        path: '/customers/1/cart/',
        responseBody: {
          id: '5529dc8b-0a94-4ae0-8145-de5197b542c6',
          lines: [
            {
              product: outOfStockProduct,
              quantity: 1,
              sources: [],
            },
          ],
          summary: {
            total: '64.9',
          },
          products_count: 5,
        },
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Cart')

    expect(
      screen.getByLabelText(
        'Laca de uñas 1 capa y listo Deliplus 891 mostaza, Paquete, 90 Grams, Temporarily out of stock',
      ),
    ).toBeInTheDocument()
  })

  it('should show the right label for unpublished product in my regulars', async () => {
    const responses = [
      {
        path: '/customers/1/recommendations/myregulars/',
        responseBody: recommendationsWithUnpublished,
      },
    ]
    wrap(App).atPath('/my-products').withNetwork(responses).withLogin().mount()

    await screen.findByRole('heading', { name: 'My Essentials' })

    expect(
      screen.getByLabelText(
        'Uva blanca con semillas, Paquete, 200 Grams, Product not available',
      ),
    ).toBeInTheDocument()
  })

  it('should hide from screen readers the individual labels of product quantity in Cart', async () => {
    wrap(App)
      .atPath('/orders/1235/edit/products/')
      .withNetwork([
        { path: '/customers/1/orders/1235/', responseBody: mockedOrder },
        { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
      ])
      .withLogin()
      .mount()
    await screen.findByText('Products in my order')

    const productToAdd = getProductCellFromCart('Uva blanca con semillas')
    addProductToCart(productToAdd)

    const inCartElement = screen.getByLabelText('2,1 Kilos in cart')
    expect(within(inCartElement).getByText('In cart')).toHaveAttribute(
      'aria-hidden',
      'true',
    )
    expect(within(inCartElement).getByText('2,1 kg')).toHaveAttribute(
      'aria-hidden',
      'true',
    )
  })
})
