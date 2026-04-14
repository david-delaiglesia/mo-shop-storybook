import { screen, waitFor, within } from '@testing-library/react'

import {
  cartWithMilka,
  cartWithShoppingListDetail,
} from './cart-response-scenario'
import {
  emptyShoppingListDetail,
  shoppingListDetail,
  shoppingListDetailMilkaElement,
} from './scenarios'
import { monitoring } from 'monitoring'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { emptyCart } from 'app/cart/__scenarios__/cart'
import { cookies } from 'app/cookie/__scenarios__/cookies'
import { openCart } from 'pages/helpers'
import {
  acknowledgeDialog,
  addListToCart,
} from 'pages/shopping-lists/__tests__/helpers'
import { Cookie } from 'services/cookie'
import { Tracker } from 'services/tracker'
import { cloneDeep } from 'utils/objects'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

configure({
  changeRoute: (route) => history.push(route),
})

beforeEach(() => {
  vi.spyOn(Cookie, 'get').mockImplementation((cookie) => cookies[cookie])
  vi.restoreAllMocks()
})

afterEach(() => {
  vi.clearAllMocks()
})

it('should NOT display the add list to cart button when list is empty', async () => {
  wrap(App)
    .atPath('/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/')
    .withNetwork([
      {
        path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/',
        responseBody: emptyShoppingListDetail,
      },
    ])
    .withLogin()
    .mount()

  await screen.findByRole('heading', { name: 'my list', level: 1 })

  expect(
    screen.queryByRole('button', { name: 'Add all to cart icon' }),
  ).not.toBeInTheDocument()
})

it('should log the error to the backend if the update remote cart fails', async () => {
  wrap(App)
    .atPath('/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/')
    .withNetwork([
      {
        path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/',
        responseBody: shoppingListDetail,
      },
      {
        path: '/customers/1/cart/',
        requestBody: {
          id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
          lines: [
            { quantity: 0.15, product_id: '24706', sources: ['+SL'] },
            { quantity: 1, product_id: '10672', sources: ['+SL'] },
            { quantity: 1, product_id: '52750', sources: ['+SL'] },
          ],
        },
        responseBody: {},
        method: 'put',
        status: 500,
      },
    ])
    .withLogin()
    .mount()

  await screen.findByRole('heading', { name: 'My second list', level: 1 })
  addListToCart()
  openCart()
  await screen.findByRole('complementary', {
    name: 'Cart',
  })

  expect(monitoring.captureError).toHaveBeenCalledWith(
    new Error('Failed to send the cart to the backend'),
  )
})

describe('Confirmation dialog', () => {
  it('should display a dialog with the added products information', async () => {
    wrap(App)
      .atPath('/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/')
      .withNetwork([
        {
          path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/',
          responseBody: shoppingListDetail,
        },
        {
          path: '/customers/1/cart/',
          method: 'put',
          requestBody: {
            id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
            lines: [
              { quantity: 1, product_id: '52750', sources: ['+SL'] },
              { quantity: 1, product_id: '10672', sources: ['+SL'] },
              { quantity: 0.15, product_id: '24706', sources: ['+SL'] },
            ],
          },
          responseBody: emptyCart,
        },
      ])
      .withLogin()
      .mount()

    await screen.findByRole('heading', { name: 'My second list', level: 1 })
    addListToCart()

    const confirmationDialog = await screen.findByRole('dialog', {
      name: '3 units added to cart',
    })
    acknowledgeDialog(confirmationDialog)

    await waitFor(() => {
      expect(
        screen.queryByRole('dialog', {
          name: '3 units added to cart',
        }),
      ).not.toBeInTheDocument()
    })
  })

  it('should count bulk products that exceeds the upper limit', async () => {
    const cartWithShoppingListDetailCopy = cloneDeep(cartWithShoppingListDetail)
    cartWithShoppingListDetailCopy.lines[0].quantity = 0.2
    const shoppingListDetailCopy = cloneDeep(emptyShoppingListDetail)
    const prawnProductCopy = cloneDeep(shoppingListDetail.items[2])
    prawnProductCopy.product.limit = 0.3

    shoppingListDetailCopy.items.push(prawnProductCopy)
    shoppingListDetailCopy.products_quantity = 1

    wrap(App)
      .atPath('/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/')
      .withNetwork([
        {
          path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/',
          responseBody: shoppingListDetailCopy,
        },
        {
          path: '/customers/1/cart/',
          responseBody: cartWithShoppingListDetailCopy,
        },
        {
          path: '/customers/1/cart/',
          method: 'put',
          requestBody: {
            id: '321f46f4-7240-4bbe-a67d-fba10521ab46',
            version: 5,
            lines: [
              { quantity: 0.3, product_id: '24706', sources: ['+PL', '+SL'] },
              {
                quantity: 1,
                version: 4,
                product_id: '10672',
                sources: ['+PL'],
              },
              {
                quantity: 1,
                version: 2,
                product_id: '52750',
                sources: ['+PL'],
              },
            ],
          },
          responseBody: emptyCart,
        },
      ])
      .withLogin()
      .mount()

    await screen.findByRole('heading', { name: 'my list', level: 1 })
    addListToCart()

    expect(
      await screen.findByRole('dialog', {
        name: '1 unit added to cart',
      }),
    ).toBeInTheDocument()
  })

  it('should not count bulk products that totally exceeds the upper limit', async () => {
    const cartWithShoppingListDetailCopy = cloneDeep(cartWithShoppingListDetail)
    cartWithShoppingListDetailCopy.lines[0].quantity = 0.3
    const shoppingListDetailCopy = cloneDeep(emptyShoppingListDetail)
    const prawnProductCopy = cloneDeep(shoppingListDetail.items[2])
    prawnProductCopy.product.limit = 0.3

    shoppingListDetailCopy.items.push(prawnProductCopy)
    shoppingListDetailCopy.products_quantity = 1

    wrap(App)
      .atPath('/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/')
      .withNetwork([
        {
          path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/',
          responseBody: shoppingListDetailCopy,
        },
        {
          path: '/customers/1/cart/',
          responseBody: cartWithShoppingListDetailCopy,
        },
        {
          path: '/customers/1/cart/',
          method: 'put',
          requestBody: {
            id: '321f46f4-7240-4bbe-a67d-fba10521ab46',
            version: 5,
            lines: [
              { quantity: 0.3, product_id: '24706', sources: ['+PL'] },
              {
                quantity: 1,
                version: 4,
                product_id: '10672',
                sources: ['+PL'],
              },
              {
                quantity: 1,
                version: 2,
                product_id: '52750',
                sources: ['+PL'],
              },
            ],
          },
          responseBody: emptyCart,
        },
      ])
      .withLogin()
      .mount()

    await screen.findByRole('heading', { name: 'my list', level: 1 })
    addListToCart()

    expect(
      await screen.findByRole('dialog', {
        name: '0 units added to cart',
      }),
    ).toBeInTheDocument()
  })

  it('should not count unitary products that exceeds the upper limit', async () => {
    const cartWithShoppingListDetailCopy = cloneDeep(cartWithShoppingListDetail)
    cartWithShoppingListDetailCopy.lines[2].quantity = 9
    const shoppingListDetailCopy = cloneDeep(shoppingListDetail)
    shoppingListDetailCopy.items.pop()
    shoppingListDetailCopy.items.pop()
    shoppingListDetailCopy.items[0].recommended_quantity = 5
    shoppingListDetailCopy.items[0].product.limit = 10

    const updatedCartWithVersion = cloneDeep(cartWithShoppingListDetailCopy)
    updatedCartWithVersion.version = 6

    wrap(App)
      .atPath('/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/')
      .withNetwork([
        {
          path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/',
          responseBody: shoppingListDetailCopy,
        },
        {
          path: '/customers/1/cart/',
          responseBody: cartWithShoppingListDetailCopy,
        },
        {
          path: '/customers/1/cart/',
          method: 'put',
          requestBody: {
            id: '321f46f4-7240-4bbe-a67d-fba10521ab46',
            version: 5,
            lines: [
              {
                quantity: 10,
                product_id: '52750',
                sources: ['+PL', '+SL'],
              },
              {
                quantity: 0.15,
                version: 5,
                product_id: '24706',
                sources: ['+PL'],
              },
              {
                quantity: 1,
                version: 4,
                product_id: '10672',
                sources: ['+PL'],
              },
            ],
          },
          responseBody: updatedCartWithVersion,
        },
      ])
      .withLogin()
      .mount()

    await screen.findByRole('heading', { name: 'My second list', level: 1 })
    addListToCart()

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'shopping_list_add_all_to_cart_click',
      {
        list_id: '0191fa22-176e-7c35-811c-4eed128a7679',
        list_name: 'My second list',
        cart_id: '321f46f4-7240-4bbe-a67d-fba10521ab46',
        cart_version: 5,
        current_cart_lines: 3,
        current_cart_units: 11,
        list_lines: 1,
        list_units: 5,
        list_unpublished_products: 0,
      },
    )

    expect(
      await screen.findByRole('dialog', {
        name: '1 unit added to cart',
      }),
    ).toBeInTheDocument()

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'shopping_list_add_all_to_cart_completed',
      {
        list_id: '0191fa22-176e-7c35-811c-4eed128a7679',
        list_name: 'My second list',
        original_cart_lines: 3,
        original_cart_units: 11,
        new_cart_lines: 3,
        new_cart_units: 12,
        new_cart_unpublished_lines: 0,
        cart_id: '321f46f4-7240-4bbe-a67d-fba10521ab46',
        new_cart_version: 6,
      },
    )
  })

  it('should send the unavailable products in cart', async () => {
    const cartWithShoppingListDetailCopy = cloneDeep(cartWithShoppingListDetail)
    cartWithShoppingListDetailCopy.version = 5
    cartWithShoppingListDetailCopy.lines[2].product.published = false

    const shoppingListDetailCopy = cloneDeep(emptyShoppingListDetail)
    const prawnProductCopy = cloneDeep(shoppingListDetail.items[2])
    prawnProductCopy.product.published = false

    shoppingListDetailCopy.items.push(prawnProductCopy)
    shoppingListDetailCopy.products_quantity = 1

    const updatedCartWithVersion = cloneDeep(cartWithShoppingListDetailCopy)
    updatedCartWithVersion.version = 6

    wrap(App)
      .atPath('/shopping-lists/92fec5ce-9571-4fce-b3ef-67f387e8f642/')
      .withNetwork([
        {
          path: '/customers/1/shopping-lists/92fec5ce-9571-4fce-b3ef-67f387e8f642/',
          responseBody: shoppingListDetailCopy,
        },
        {
          path: '/customers/1/cart/',
          responseBody: cartWithShoppingListDetailCopy,
        },
        {
          path: '/customers/1/cart/',
          method: 'put',
          requestBody: {
            id: '321f46f4-7240-4bbe-a67d-fba10521ab46',
            version: 5,
            lines: [
              { quantity: 0.3, product_id: '24706', sources: ['+PL', '+SL'] },
              {
                quantity: 1,
                version: 4,
                product_id: '10672',
                sources: ['+PL'],
              },
              {
                quantity: 1,
                version: 2,
                product_id: '52750',
                sources: ['+PL'],
              },
            ],
          },
          responseBody: updatedCartWithVersion,
        },
      ])
      .withLogin()
      .mount()

    await screen.findByRole('heading', { name: 'my list', level: 1 })
    addListToCart()

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'shopping_list_add_all_to_cart_click',
      {
        list_id: '92fec5ce-9571-4fce-b3ef-67f387e8f642',
        list_name: 'my list',
        cart_id: '321f46f4-7240-4bbe-a67d-fba10521ab46',
        cart_version: 5,
        current_cart_lines: 3,
        current_cart_units: 3,
        list_lines: 1,
        list_units: 1,
        list_unpublished_products: 1,
      },
    )

    expect(
      await screen.findByRole('dialog', {
        name: '1 unit added to cart',
      }),
    ).toBeInTheDocument()

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'shopping_list_add_all_to_cart_completed',
      {
        list_id: '92fec5ce-9571-4fce-b3ef-67f387e8f642',
        list_name: 'my list',
        original_cart_lines: 3,
        original_cart_units: 3,
        new_cart_lines: 3,
        new_cart_units: 3,
        new_cart_unpublished_lines: 2,
        cart_id: '321f46f4-7240-4bbe-a67d-fba10521ab46',
        new_cart_version: 6,
      },
    )
  })
})

describe('when the cart is empty', () => {
  it('should add a single product with the recommended quantity to the cart', async () => {
    const shoppingListCopy = cloneDeep(emptyShoppingListDetail)
    const shoppingListDetailMilkaElementCopy = cloneDeep(
      shoppingListDetailMilkaElement,
    )

    shoppingListDetailMilkaElementCopy.recommended_quantity = 2
    shoppingListCopy.items.push(shoppingListDetailMilkaElementCopy)
    shoppingListCopy.products_quantity = 1

    wrap(App)
      .atPath('/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/')
      .withNetwork([
        {
          path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/',
          responseBody: shoppingListCopy,
        },
        {
          path: '/customers/1/cart/',
          method: 'put',
          requestBody: {
            id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
            lines: [
              { quantity: 2, product_id: '12151', sources: ['+SL', '+SL'] },
            ],
          },
          responseBody: emptyCart,
        },
      ])
      .withLogin()
      .mount()

    await screen.findByRole('heading', { name: 'my list', level: 1 })
    addListToCart()
    openCart()
    await screen.findByRole('complementary', {
      name: 'Cart',
    })

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'shopping_list_add_all_to_cart_click',
      {
        list_id: '92fec5ce-9571-4fce-b3ef-67f387e8f642',
        list_name: 'my list',
        cart_id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        cart_version: 0,
        current_cart_lines: 0,
        current_cart_units: 0,
        list_lines: 1,
        list_units: 2,
        list_unpublished_products: 0,
      },
    )

    expect('/customers/1/cart/').toHaveBeenFetchedWith({
      method: 'PUT',
      body: {
        id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        lines: [
          {
            quantity: 2,
            product_id: '12151',
            sources: ['+SL', '+SL'],
          },
        ],
      },
    })

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'shopping_list_add_all_to_cart_completed',
      {
        list_id: '92fec5ce-9571-4fce-b3ef-67f387e8f642',
        list_name: 'my list',
        original_cart_lines: 0,
        original_cart_units: 0,
        new_cart_lines: 1,
        new_cart_units: 2,
        new_cart_unpublished_lines: 0,
        cart_id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        new_cart_version: 0,
      },
    )
  })

  it('should add several products with the recommended quantity to the cart', async () => {
    wrap(App)
      .atPath('/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/')
      .withNetwork([
        {
          path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/',
          responseBody: shoppingListDetail,
        },
        {
          path: '/customers/1/cart/',
          method: 'put',
          requestBody: {
            id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
            lines: [
              { quantity: 1, product_id: '52750', sources: ['+SL'] },
              { quantity: 1, product_id: '10672', sources: ['+SL'] },
              { quantity: 0.15, product_id: '24706', sources: ['+SL'] },
            ],
          },
          responseBody: emptyCart,
        },
      ])
      .withLogin()
      .mount()

    await screen.findByRole('heading', { name: 'My second list', level: 1 })
    addListToCart()
    openCart()
    await screen.findByRole('complementary', {
      name: 'Cart',
    })

    expect('/customers/1/cart/').toHaveBeenFetchedWith({
      method: 'PUT',
      body: {
        id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        lines: [
          {
            quantity: 1,
            product_id: '52750',
            sources: ['+SL'],
          },
          {
            quantity: 1,
            product_id: '10672',
            sources: ['+SL'],
          },
          {
            quantity: 0.15,
            product_id: '24706',
            sources: ['+SL'],
          },
        ],
      },
    })
  })

  it('should add only up to the product limit to cart', async () => {
    const shoppingListCopy = cloneDeep(emptyShoppingListDetail)
    const shoppingListMilkaElementCopy = cloneDeep(
      shoppingListDetailMilkaElement,
    )

    shoppingListMilkaElementCopy.recommended_quantity = 5
    shoppingListMilkaElementCopy.product.limit = 9

    shoppingListCopy.items.push(shoppingListMilkaElementCopy)
    shoppingListCopy.products_quantity = 1

    const firstCartUpdate = cloneDeep(cartWithMilka)
    firstCartUpdate.lines[0].quantity = 5
    firstCartUpdate.lines[0].sources = ['+SL', '+SL', '+SL', '+SL', '+SL']

    const secondCartUpdate = cloneDeep(cartWithMilka)
    secondCartUpdate.lines[0].quantity = 9
    secondCartUpdate.lines[0].sources = [
      '+SL',
      '+SL',
      '+SL',
      '+SL',
      '+SL',
      '+SL',
      '+SL',
      '+SL',
      '+SL',
    ]

    wrap(App)
      .atPath('/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/')
      .withNetwork([
        {
          path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/',
          responseBody: shoppingListCopy,
        },
        {
          path: '/customers/1/cart/',
          method: 'put',
          requestBody: {
            id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
            lines: [
              {
                quantity: 5,
                product_id: '12151',
                sources: ['+SL', '+SL', '+SL', '+SL', '+SL'],
              },
            ],
          },
          responseBody: firstCartUpdate,
        },
        {
          path: '/customers/1/cart/',
          method: 'put',
          requestBody: {
            id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
            lines: [
              {
                quantity: 9,
                product_id: '12151',
                sources: [
                  '+SL',
                  '+SL',
                  '+SL',
                  '+SL',
                  '+SL',
                  '+SL',
                  '+SL',
                  '+SL',
                  '+SL',
                ],
              },
            ],
          },
          responseBody: secondCartUpdate,
        },
      ])
      .withLogin()
      .mount()

    await screen.findByRole('heading', { name: 'my list', level: 1 })
    addListToCart()
    addListToCart()

    const cartButton = await screen.findByRole('button', {
      name: 'Show cart',
    })

    expect(within(cartButton).getByText('9')).toBeInTheDocument()
    expect(within(cartButton).getByText('15,30 €')).toBeInTheDocument()

    expect('/customers/1/cart/').toHaveBeenFetchedWith({
      method: 'PUT',
      body: {
        id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        lines: [
          {
            quantity: 9,
            product_id: '12151',
            sources: [
              '+SL',
              '+SL',
              '+SL',
              '+SL',
              '+SL',
              '+SL',
              '+SL',
              '+SL',
              '+SL',
            ],
          },
        ],
      },
    })
  })
})

describe('When the cart has products', () => {
  it('should add multiple products with the recommended quantity to the cart', async () => {
    wrap(App)
      .atPath('/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/')
      .withNetwork([
        {
          path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/',
          responseBody: shoppingListDetail,
        },
        {
          path: '/customers/1/cart/',
          responseBody: cartWithShoppingListDetail,
        },
        {
          path: '/customers/1/cart/',
          method: 'put',
          requestBody: {
            id: '321f46f4-7240-4bbe-a67d-fba10521ab46',
            version: 5,
            lines: [
              { quantity: 2, product_id: '52750', sources: ['+PL', '+SL'] },
              { quantity: 2, product_id: '10672', sources: ['+PL', '+SL'] },
              { quantity: 0.3, product_id: '24706', sources: ['+PL', '+SL'] },
            ],
          },
          responseBody: cartWithShoppingListDetail,
        },
      ])
      .withLogin()
      .mount()

    await screen.findByRole('heading', { name: 'My second list', level: 1 })
    addListToCart()
    openCart()
    const cart = await screen.findByRole('complementary', {
      name: 'Cart',
    })

    expect(
      within(cart).getByText('Strawberry and banana Kefir drink Hacendado'),
    ).toBeInTheDocument()
    expect(
      within(cart).getByText('Decaf caffe latte Hacendado'),
    ).toBeInTheDocument()
    expect(
      within(cart).getByText('Frozen medium striped red shrimp'),
    ).toBeInTheDocument()

    expect('/customers/1/cart/').toHaveBeenFetchedWith({
      method: 'PUT',
      body: {
        id: '321f46f4-7240-4bbe-a67d-fba10521ab46',
        lines: [
          {
            quantity: 2,
            product_id: '52750',
            sources: ['+PL', '+SL'],
          },
          {
            quantity: 2,
            product_id: '10672',
            sources: ['+PL', '+SL'],
          },
          {
            quantity: 0.3,
            product_id: '24706',
            sources: ['+PL', '+SL'],
          },
        ],
        version: 5,
      },
    })
  })

  it('should round up sources for bulk products', async () => {
    const cloneCart = cloneDeep(cartWithShoppingListDetail)
    cloneCart.lines[0].quantity = 0.2

    const cloneShoppingList = cloneDeep(shoppingListDetail)
    cloneShoppingList.items[2].recommended_quantity = 0.4

    wrap(App)
      .atPath('/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/')
      .withNetwork([
        {
          path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/',
          responseBody: cloneShoppingList,
        },
        {
          path: '/customers/1/cart/',
          responseBody: cloneCart,
        },
        {
          path: '/customers/1/cart/',
          method: 'put',
          requestBody: {
            id: '321f46f4-7240-4bbe-a67d-fba10521ab46',
            version: 5,
            lines: [
              { quantity: 2, product_id: '52750', sources: ['+PL', '+SL'] },
              { quantity: 2, product_id: '10672', sources: ['+PL', '+SL'] },
              {
                quantity: 0.6,
                product_id: '24706',
                sources: ['+PL', '+SL', '+SL', '+SL'],
              },
            ],
          },
          responseBody: emptyCart,
        },
      ])
      .withLogin()
      .mount()

    await screen.findByRole('heading', { name: 'My second list', level: 1 })
    addListToCart()

    await screen.findByRole('dialog', {
      name: '3 units added to cart',
    })

    expect('/customers/1/cart/').toHaveBeenFetchedWith({
      method: 'PUT',
      body: {
        id: '321f46f4-7240-4bbe-a67d-fba10521ab46',
        lines: [
          {
            quantity: 2,
            product_id: '52750',
            sources: ['+PL', '+SL'],
          },

          {
            quantity: 2,
            product_id: '10672',
            sources: ['+PL', '+SL'],
          },
          {
            quantity: 0.6,
            product_id: '24706',
            sources: ['+PL', '+SL', '+SL', '+SL'],
          },
        ],
        version: 5,
      },
    })
  })

  it('should add recommended quantity of product to the cart', async () => {
    const shoppingListCopy = cloneDeep(emptyShoppingListDetail)
    const shoppingListDetailMilkaElementCopy = cloneDeep(
      shoppingListDetailMilkaElement,
    )

    shoppingListDetailMilkaElementCopy.recommended_quantity = 2
    shoppingListCopy.items.push(shoppingListDetailMilkaElementCopy)
    shoppingListCopy.products_quantity = 1

    wrap(App)
      .atPath('/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/')
      .withNetwork([
        {
          path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/',
          responseBody: shoppingListCopy,
        },
        { path: '/customers/1/cart/', responseBody: cartWithMilka },
        {
          path: '/customers/1/cart/',
          method: 'put',
          requestBody: {
            id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
            version: 6,
            lines: [
              {
                quantity: 3,
                product_id: '12151',
                sources: ['+SL', '+SL', '+SL'],
              },
            ],
          },
          responseBody: cartWithMilka,
        },
      ])
      .withLogin()
      .mount()

    await screen.findByRole('heading', { name: 'my list', level: 1 })
    addListToCart()
    openCart()
    await screen.findByRole('complementary', {
      name: 'Cart',
    })

    expect('/customers/1/cart/').toHaveBeenFetchedWith({
      method: 'PUT',
      body: {
        id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        lines: [
          {
            quantity: 3,
            product_id: '12151',
            sources: ['+SL', '+SL', '+SL'],
          },
        ],
        version: 6,
      },
    })
  })
})
