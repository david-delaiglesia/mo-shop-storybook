import { screen, within } from '@testing-library/react'

import { confirmOrderEdition, openProductDetailFromCart } from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import {
  categories,
  categoryDetail,
} from 'app/catalog/__scenarios__/categories'
import {
  productBaseDetail,
  waterProduct,
} from 'app/catalog/__scenarios__/product'
import {
  orderCart,
  orderCartWithAlcohol,
  orderCartWithValidPrice,
} from 'app/order/__scenarios__/orderCart'
import { preparedLines } from 'app/order/__scenarios__/orderDetail'
import {
  mockedOrder,
  mockedOrderWithSlotBonus,
} from 'app/order/__tests__/order.mock'
import { mockedCompleteOrderLine } from 'app/order/__tests__/preparedOrderLines.mock'
import {
  addProductFromDetail,
  decreaseProductFromCart,
  decreaseProductFromDetail,
  getProductCellFromCart,
  increaseProductFromCart,
  removeProductFromCart,
} from 'pages/helpers'
import { confirmAgeVerificationAlert } from 'pages/home/__tests__/helpers'
import { shoppingLists } from 'pages/shopping-lists/__tests__/scenarios'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Edit order - Cart', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  const defaultResponses = [
    { path: '/customers/1/orders/1235/', responseBody: mockedOrder },
    { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
    { path: '/categories/', responseBody: categories },
    { path: '/categories/112/', responseBody: categoryDetail },
    { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
  ]

  const cartMetrics = {
    amount: 2,
    cart_id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
    display_name: 'Uva blanca con semillas',
    id: '3317',
    merca_code: '3317',
    layout: 'list',
    price: '1,89',
    requires_age_check: false,
    selling_method: 'bunch',
    source: 'cart',
    cart_mode: 'edit',
  }

  it('should display the cart total price', async () => {
    wrap(App)
      .atPath('/orders/1235/edit/products/')
      .withNetwork(defaultResponses)
      .withLogin()
      .mount()
    await screen.findByText('Products in my order')

    expect(screen.getByText('23,65 €')).toBeInTheDocument()
  })

  it('should show crossed slot bonus text', async () => {
    wrap(App)
      .atPath('/orders/1235/edit/products/')
      .withNetwork([
        {
          path: '/customers/1/orders/1235/',
          responseBody: mockedOrderWithSlotBonus,
        },
        { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
        { path: '/categories/', responseBody: categories },
        { path: '/categories/112/', responseBody: categoryDetail },
        { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
      ])
      .withLogin()
      .mount()
    await screen.findByText('Products in my order')
    const deliveryPrice = screen.getByText('7,21 €')

    expect(deliveryPrice).toBeInTheDocument()
    expect(deliveryPrice).toHaveClass(
      'subhead1-b free-delivery__subtotals-bonus',
    )
  })

  it('should show correct total price amount on edit product when bonus is applied', async () => {
    wrap(App)
      .atPath('/orders/1235/edit/products/')
      .withNetwork([
        {
          path: '/customers/1/orders/1235/',
          responseBody: mockedOrderWithSlotBonus,
        },
        { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
        { path: '/categories/', responseBody: categories },
        { path: '/categories/112/', responseBody: categoryDetail },
        { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
      ])
      .withLogin()
      .mount()

    await screen.findByText('Products in my order')
    increaseProductFromCart('Uva blanca con semillas')

    expect(screen.getByLabelText('Amount products 24,71 €')).toBeInTheDocument()
    expect(screen.getByLabelText('Service cost 7,21 €')).toBeInTheDocument()
  })

  it('should show the product in the cart', async () => {
    wrap(App)
      .atPath('/orders/1235/edit/products/')
      .withNetwork(defaultResponses)
      .withLogin()
      .mount()
    await screen.findByText('Products in my order')

    const product = getProductCellFromCart('Uva blanca con semillas')
    expect(product).toHaveTextContent('2,11 €')
  })

  it('should display the product detail information', async () => {
    const responses = [
      ...defaultResponses,
      { path: '/products/3317/', responseBody: productBaseDetail },
      { path: '/products/3317/xselling/', responseBody: { results: [] } },
    ]
    wrap(App)
      .atPath('/orders/1235/edit/products/')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Products in my order')
    openProductDetailFromCart(
      'Uva blanca con semillas, Paquete, 200 Grams, 1,89€ per 200 Grams',
    )
    const productDetailDialog = await screen.findByRole('dialog')

    expect(productDetailDialog).toHaveTextContent('2,11 €')
  })

  it('should be able to increase and decrease product from product detail', async () => {
    const responses = [
      ...defaultResponses,
      { path: '/products/3317/', responseBody: productBaseDetail },
      { path: '/products/3317/xselling/', responseBody: { results: [] } },
    ]
    wrap(App)
      .atPath('/orders/1235/edit/products/')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Products in my order')
    openProductDetailFromCart(
      'Uva blanca con semillas, Paquete, 200 Grams, 1,89€ per 200 Grams',
    )
    await screen.findByRole('dialog')
    await addProductFromDetail()

    expect(Tracker.sendInteraction).toHaveBeenCalledWith('add_product_click', {
      ...cartMetrics,
      layout: 'product_detail',
      first_product: false,
      added_amount: 1,
    })

    decreaseProductFromDetail(
      'Uva blanca con semillas, Paquete, 200 Grams, 1,89€ per 200 Grams',
    )

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'decrease_product_click',
      {
        ...cartMetrics,
        layout: 'product_detail',
        amount: 2.1,
        decreased_amount: 1,
      },
    )
  })

  it('should be able to increase product from the cart', async () => {
    wrap(App)
      .atPath('/orders/1235/edit/products/')
      .withNetwork(defaultResponses)
      .withLogin()
      .mount()

    await screen.findByText('Products in my order')
    increaseProductFromCart('Uva blanca con semillas')

    const product = getProductCellFromCart('Uva blanca con semillas')
    expect(product).toHaveTextContent('2,1 kg')
    expect(Tracker.sendInteraction).toHaveBeenCalledWith('add_product_click', {
      ...cartMetrics,
      order: 0,
      first_product: false,
      added_amount: 1,
    })
  })

  it('should be able to decrease product from the cart', async () => {
    wrap(App)
      .atPath('/orders/1235/edit/products/')
      .withNetwork(defaultResponses)
      .withLogin()
      .mount()

    await screen.findByText('Products in my order')
    decreaseProductFromCart('Uva blanca con semillas')

    const product = getProductCellFromCart('Uva blanca con semillas')
    expect(product).toHaveTextContent('1,9 kg')
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'decrease_product_click',
      {
        ...cartMetrics,
        decreased_amount: 1,
      },
    )
  })

  it('should be able to remove product from the cart', async () => {
    const cartMetrics = {
      amount: 1,
      cart_id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
      display_name: 'Plataforma mopa grande abrillantadora Bosque Verde',
      id: '71502',
      merca_code: '71502',
      layout: 'list',
      price: '0,85',
      requires_age_check: false,
      selling_method: 'units',
      source: 'cart',
      cart_mode: 'edit',
    }
    wrap(App)
      .atPath('/orders/1235/edit/products/')
      .withNetwork(defaultResponses)
      .withLogin()
      .mount()

    await screen.findByText('Products in my order')
    const product = getProductCellFromCart(
      'Plataforma mopa grande abrillantadora Bosque Verde',
    )
    decreaseProductFromCart(
      'Plataforma mopa grande abrillantadora Bosque Verde',
    )
    decreaseProductFromCart(
      'Plataforma mopa grande abrillantadora Bosque Verde',
    )
    removeProductFromCart('Plataforma mopa grande abrillantadora Bosque Verde')

    expect(product).not.toBeInTheDocument()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'decrease_product_click',
      {
        ...cartMetrics,
        decreased_amount: 1,
      },
    )
  })

  it('should display the save changes button disabled when loads without any product', async () => {
    wrap(App)
      .atPath('/orders/5/edit/products/?category=112')
      .withNetwork([
        { path: '/customers/1/orders/5/', responseBody: mockedOrder },
        {
          path: `/customers/1/orders/5/lines/prepared/`,
          responseBody: preparedLines,
        },
        { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
      ])
      .withLogin()
      .mount()

    await screen.findByText('Products in my order')

    expect(screen.getByRole('button', { name: 'Save changes' })).toBeDisabled()
  })

  it('should display the water limit alert when the order is more than the limit on order limitation', async () => {
    const responses = [
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetail },
      { path: '/customers/1/orders/5/', responseBody: mockedOrder },
      {
        path: '/customers/1/orders/5/cart/',
        responseBody: {
          ...orderCartWithValidPrice,
          lines: [
            ...orderCartWithValidPrice.lines,
            {
              id: 3,
              product: waterProduct,
              quantity: 12,
              original_price_instructions: {
                ...waterProduct.price_instructions,
              },
              sources: [],
            },
          ],
        },
      },
      {
        path: '/customers/1/orders/5/cart/',
        method: 'put',
        status: 400,
        requestBody: {
          cart: {
            id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
            lines: [
              { id: 1, product_id: '3317', quantity: 20.1, sources: ['+CA'] },
              { id: 2, product_id: '71502', quantity: 3, sources: [] },
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
              detail: '',
              code: 'max_water_liters_in_cart_error',
            },
          ],
        },
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

    increaseProductFromCart('Agua mineral Bronchales')

    confirmOrderEdition()
    await screen.findByRole('dialog')

    expect(screen.getByText('Maximum limit for water'))
  })

  it('should display the alcohol +18 alert when the cart has this kind of product', async () => {
    const responses = [
      { path: '/customers/1/orders/1235/', responseBody: mockedOrder },
      {
        path: '/customers/1/orders/1235/cart/',
        responseBody: orderCartWithAlcohol,
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
    increaseProductFromCart('Ginebra London dry gin Tanqueray')
    confirmOrderEdition()

    const ageVerificationAlert = screen.getByRole('dialog')
    expect(ageVerificationAlert).toHaveTextContent('Are you over 18?')
    expect(ageVerificationAlert).toHaveTextContent(
      'Your order contains a product that requires being over 18 years of age',
    )
    expect(
      within(ageVerificationAlert).getByRole('button', {
        name: 'Yes, I am over 18 years of age',
      }),
    )
    expect(
      within(ageVerificationAlert).getByRole('button', {
        name: 'No, check cart',
      }),
    )
  })

  it('confirms order when the age verification alert is confirmed', async () => {
    const responses = [
      { path: '/customers/1/orders/1235/', responseBody: mockedOrder },
      {
        path: '/customers/1/orders/1235/cart/',
        responseBody: orderCartWithAlcohol,
      },
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetail },
      {
        path: '/customers/1/orders/1235/cart/',
        method: 'put',
        requestBody: {
          cart: {
            id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
            lines: [
              { id: 1, quantity: 31, product_id: '28775', sources: ['+CA'] },
            ],
          },
        },
      },
      {
        path: `/customers/1/orders/5/lines/prepared/?lang=en&wh=vlc1`,
        responseBody: { results: mockedCompleteOrderLine },
      },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ]
    wrap(App)
      .atPath('/orders/1235/edit/products/')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Products in my order')
    increaseProductFromCart('Ginebra London dry gin Tanqueray')
    confirmOrderEdition()

    const ageVerificationAlert = screen.getByRole('dialog')
    confirmAgeVerificationAlert()
    expect(ageVerificationAlert).not.toBeInTheDocument()
    await screen.findByText('My orders')

    const confirmOrderUpdatedAlert = screen.getByRole('dialog')

    expect(confirmOrderUpdatedAlert).toHaveTextContent('Order updated')
    expect(confirmOrderUpdatedAlert).toHaveTextContent(
      'You can check the changes made on your order.',
    )
  })

  it('calls first save purchase products click event when user clicks the button', async () => {
    wrap(App)
      .atPath('/orders/1235/edit/products/')
      .withNetwork(defaultResponses)
      .withLogin()
      .mount()

    await screen.findByText('Products in my order')

    decreaseProductFromCart(
      'Plataforma mopa grande abrillantadora Bosque Verde',
    )
    confirmOrderEdition()

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'save_purchase_products_click',
      {
        cart_id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        price: 22.8,
        purchase_id: 5,
      },
    )
  })
})
