import { screen, waitFor } from '@testing-library/react'

import { vi } from 'vitest'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app.jsx'
import { emptyCart } from 'app/cart/__scenarios__/cart'
import { recommendationsWithUnpublished } from 'app/catalog/__scenarios__/recommendations'
import {
  similarProduct,
  similars,
  similarsWithLimitedProduct,
} from 'app/catalog/__scenarios__/similars'
import {
  addProduct,
  decreaseProduct,
  getProductCell,
  increaseProduct,
  removeProduct,
  viewSimilarProducts,
} from 'pages/helpers'
import { Storage } from 'services/storage'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')
vi.unmock('libs/debounce')

describe('My Regulars - Unpublished - Cart', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    vi.clearAllMocks()
    Storage.clear()
    localStorage.clear()
  })

  it('should add an alternative product to the cart', async () => {
    const responses = [
      {
        path: '/customers/1/recommendations/myregulars/',
        responseBody: recommendationsWithUnpublished,
      },
      { path: '/products/3317/similars/', responseBody: similars },
      {
        path: '/customers/1/cart/',
        method: 'put',
        requestBody: {
          id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
          lines: [{ quantity: 1, product_id: '26107', sources: ['+SR'] }],
        },
        responseBody: {
          id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
          lines: [
            {
              product: similarProduct,
              quantity: 1,
              sources: ['+SR'],
            },
          ],
        },
      },
    ]
    wrap(App).atPath('/my-products').withNetwork(responses).withLogin().mount()

    await screen.findByRole('heading', { name: 'My Essentials' })
    viewSimilarProducts('Uva blanca con semillas')
    await screen.findByRole('dialog')
    addProduct('Fabada Hacendado')
    await waitFor(() => screen.getAllByText('1 unit'))

    await waitFor(() =>
      expect('/customers/1/cart/').toHaveBeenFetchedWith({
        method: 'PUT',
        body: {
          id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
          lines: [{ quantity: 1, product_id: '26107', sources: ['+SR'] }],
        },
      }),
    )
    expect(getProductCell('Fabada Hacendado')).toHaveTextContent('1 unit')
    expect(Tracker.sendInteraction).toHaveBeenCalledWith('add_product_click', {
      amount: 0,
      cart_id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
      display_name: 'Fabada Hacendado',
      id: '26107',
      merca_code: '26107',
      layout: 'grid',
      price: '0,95',
      requires_age_check: false,
      selling_method: 'units',
      source: 'similar_my_products',
      cart_mode: 'purchase',
      order: 0,
      first_product_added_at: expect.stringContaining(
        new Date().toISOString().split('T')[0],
      ),
      first_product: true,
      added_amount: 1,
    })
  })

  it('should increase an alternative product to the cart', async () => {
    const responses = [
      {
        path: '/customers/1/recommendations/myregulars/',
        responseBody: recommendationsWithUnpublished,
      },
      { path: '/products/3317/similars/', responseBody: similars },
      {
        path: '/customers/1/cart/',
        method: 'put',
        requestBody: {
          id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
          lines: [
            { quantity: 2, product_id: '26107', sources: ['+SR', '+SR'] },
          ],
        },
        responseBody: {
          id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
          lines: [
            {
              product: similarProduct,
              quantity: 2,
              sources: ['+SR', '+SR'],
            },
          ],
        },
      },
    ]
    wrap(App).atPath('/my-products').withNetwork(responses).withLogin().mount()

    await screen.findByRole('heading', { name: 'My Essentials' })
    viewSimilarProducts('Uva blanca con semillas')
    await screen.findByRole('dialog')
    addProduct('Fabada Hacendado')
    increaseProduct('Fabada Hacendado')
    await waitFor(() => screen.getAllByText('2 units'))

    await waitFor(() =>
      expect('/customers/1/cart/').toHaveBeenFetchedWith({
        method: 'PUT',
        body: {
          id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
          lines: [
            { quantity: 2, product_id: '26107', sources: ['+SR', '+SR'] },
          ],
        },
      }),
    )
    expect(getProductCell('Fabada Hacendado')).toHaveTextContent('2 units')
    expect(Tracker.sendInteraction).toHaveBeenCalledWith('add_product_click', {
      amount: 1,
      cart_id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
      display_name: 'Fabada Hacendado',
      id: '26107',
      merca_code: '26107',
      layout: 'grid',
      price: '0,95',
      requires_age_check: false,
      selling_method: 'units',
      source: 'similar_my_products',
      cart_mode: 'purchase',
      order: 0,
      first_product: false,
      added_amount: 1,
    })
  })

  it('should decrease an alternative product to the cart', async () => {
    const responses = [
      {
        path: '/customers/1/recommendations/myregulars/',
        responseBody: recommendationsWithUnpublished,
      },
      { path: '/products/3317/similars/', responseBody: similars },
      {
        path: '/customers/1/cart/',
        method: 'put',
        requestBody: {
          id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
          lines: [
            {
              quantity: 1,
              product_id: '26107',
              sources: ['+SR', '+SR', '-SR'],
            },
          ],
        },
        responseBody: {
          id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
          lines: [
            {
              product: similarProduct,
              quantity: 1,
              sources: ['+SR', '+SR', '-SR'],
            },
          ],
        },
      },
    ]
    wrap(App).atPath('/my-products').withNetwork(responses).withLogin().mount()

    await screen.findByRole('heading', { name: 'My Essentials' })
    viewSimilarProducts('Uva blanca con semillas')
    await screen.findByRole('dialog')
    addProduct('Fabada Hacendado')
    increaseProduct('Fabada Hacendado')
    decreaseProduct('Fabada Hacendado')
    await waitFor(() => screen.getAllByText('1 unit'))

    await waitFor(() =>
      expect('/customers/1/cart/').toHaveBeenFetchedWith({
        method: 'PUT',
        body: {
          id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
          lines: [
            {
              quantity: 1,
              product_id: '26107',
              sources: ['+SR', '+SR', '-SR'],
            },
          ],
        },
      }),
    )
    expect(getProductCell('Fabada Hacendado')).toHaveTextContent('1 unit')
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'decrease_product_click',
      {
        amount: 2,
        cart_id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        display_name: 'Fabada Hacendado',
        id: '26107',
        merca_code: '26107',
        layout: 'grid',
        price: '0,95',
        requires_age_check: false,
        selling_method: 'units',
        source: 'similar_my_products',
        cart_mode: 'purchase',
        decreased_amount: 1,
      },
    )
  })

  it('should remove an alternative product from the cart', async () => {
    const responses = [
      {
        path: '/customers/1/recommendations/myregulars/',
        responseBody: recommendationsWithUnpublished,
      },
      { path: '/products/3317/similars/', responseBody: similars },
      {
        path: '/customers/1/cart/',
        method: 'put',
        requestBody: {
          id: '10000000-1000-4000-8000-100000000000',
          lines: [],
        },
        responseBody: emptyCart,
      },
    ]
    wrap(App).atPath('/my-products').withNetwork(responses).withLogin().mount()

    await screen.findByRole('heading', { name: 'My Essentials' })
    viewSimilarProducts('Uva blanca con semillas')
    await screen.findByRole('dialog')
    addProduct('Fabada Hacendado')
    removeProduct('Fabada Hacendado')
    await waitFor(() => screen.getAllByText('Add to cart'))

    await waitFor(() =>
      expect('/customers/1/cart/').toHaveBeenFetchedWith({
        method: 'PUT',
        body: {
          id: '10000000-1000-4000-8000-100000000000',
          lines: [],
        },
      }),
    )
    expect(getProductCell('Fabada Hacendado')).toHaveTextContent('Add to cart')
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'decrease_product_click',
      {
        amount: 1,
        cart_id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        display_name: 'Fabada Hacendado',
        id: '26107',
        merca_code: '26107',
        layout: 'grid',
        price: '0,95',
        requires_age_check: false,
        selling_method: 'units',
        source: 'similar_my_products',
        cart_mode: 'purchase',
        decreased_amount: 1,
      },
    )
  })

  it('should show the product limit alert adding an alternative product to the cart', async () => {
    const responses = [
      {
        path: '/customers/1/recommendations/myregulars/',
        responseBody: recommendationsWithUnpublished,
      },
      {
        path: '/products/3317/similars/',
        responseBody: similarsWithLimitedProduct,
      },
      {
        path: '/customers/1/cart/',
        method: 'put',
        requestBody: {
          id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
          lines: [
            {
              quantity: 1,
              product_id: '26107',
              sources: ['+SR'],
            },
          ],
        },
        responseBody: {
          id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
          lines: [
            {
              product: similarProduct,
              quantity: 1,
              sources: ['+SR'],
            },
          ],
        },
      },
    ]
    wrap(App).atPath('/my-products').withNetwork(responses).withLogin().mount()

    await screen.findByRole('heading', { name: 'My Essentials' })
    viewSimilarProducts('Uva blanca con semillas')
    await screen.findByRole('dialog')
    addProduct('Fabada Hacendado')
    increaseProduct('Fabada Hacendado')
    const [alert] = await screen.findAllByRole('dialog')

    expect(alert).toHaveTextContent('Maximum quantity')
    expect(alert).toHaveTextContent(
      'You have reached the maximum number of units that we can serve you of this product',
    )
    expect(alert).toHaveTextContent('OK')
    expect(Tracker.sendViewChange).toHaveBeenCalledWith(
      'product_quantity_limit_alert',
      {
        product_id: '26107',
      },
    )
  })
})
