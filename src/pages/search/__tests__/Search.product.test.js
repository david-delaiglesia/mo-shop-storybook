import { screen } from '@testing-library/react'

import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import {
  productBaseDetail,
  productWithoutXSelling,
} from 'app/catalog/__scenarios__/product'
import {
  addProduct,
  addProductFromDetail,
  decreaseProduct,
  getFirstProductCell,
  increaseProduct,
  openProductDetail,
  removeProduct,
} from 'pages/helpers'
import { Storage } from 'services/storage'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Search - Product', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  const today = new Date().toISOString().slice(0, 10)

  afterEach(() => {
    Storage.clear()
    vi.clearAllMocks()
  })

  it('should be able to add a product to the cart', async () => {
    const responses = [
      {
        path: '/customers/1/cart/',
        method: 'put',
        requestBody: {
          id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
          lines: [{ quantity: 1, product_id: '58110', sources: ['+SA'] }],
        },
      },
    ]
    wrap(App)
      .atPath('/search-results?query=jam')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText(/Showing 3 results for 'jam'/)
    const productCell = getFirstProductCell()
    addProduct('Jamón serrano Hacendado')
    await screen.findByLabelText('Show cart')

    expect(productCell).toHaveTextContent('1 unit')
    expect(Tracker.sendInteraction).toHaveBeenCalledWith('add_product_click', {
      cart_id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
      display_name: 'Jamón serrano Hacendado',
      id: '58110',
      merca_code: '58110',
      selling_method: 'units',
      requires_age_check: false,
      price: '39,00',
      source: 'search',
      cart_mode: 'purchase',
      order: 0,
      first_product_added_at: expect.stringContaining(today),
      first_product: true,
      amount: 0,
      layout: 'grid',
      added_amount: 1,
      query: 'jam',
    })
  })

  it('should be able to decrease a product to the cart', async () => {
    const responses = [
      {
        path: '/customers/1/cart/',
        method: 'put',
        requestBody: {
          id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
          lines: [{ quantity: 1, product_id: '58110', sources: ['+SA'] }],
        },
      },
      {
        path: '/customers/1/cart/',
        method: 'put',
        requestBody: {
          id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
          lines: [
            { quantity: 2, product_id: '58110', sources: ['+SA', '+SA'] },
          ],
        },
      },
      {
        path: '/customers/1/cart/',
        method: 'put',
        requestBody: {
          id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
          lines: [
            {
              quantity: 1,
              product_id: '58110',
              sources: ['+SA', '+SA', '-SA'],
            },
          ],
        },
      },
    ]
    wrap(App)
      .atPath('/search-results?query=jam')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText(/Showing 3 results for 'jam'/)
    const productCell = getFirstProductCell()
    addProduct('Jamón serrano Hacendado')
    increaseProduct('Jamón serrano Hacendado')
    decreaseProduct('Jamón serrano Hacendado')
    await screen.findByLabelText('Show cart')

    expect(productCell).toHaveTextContent('1 unit')
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'decrease_product_click',
      {
        amount: 2,
        cart_id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        cart_mode: 'purchase',
        display_name: 'Jamón serrano Hacendado',
        id: '58110',
        merca_code: '58110',
        layout: 'grid',
        price: '39,00',
        requires_age_check: false,
        selling_method: 'units',
        source: 'search',
        decreased_amount: 1,
      },
    )
  })

  it('should be able to remove a product to the cart', async () => {
    const responses = [
      {
        path: '/customers/1/cart/',
        method: 'put',
        requestBody: {
          id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
          lines: [{ quantity: 1, product_id: '58110', sources: ['+SA'] }],
        },
      },
      {
        path: '/customers/1/cart/',
        method: 'put',
        requestBody: { id: '10000000-1000-4000-8000-100000000000', lines: [] },
      },
    ]
    wrap(App)
      .atPath('/search-results?query=jam')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText(/Showing 3 results for 'jam'/)
    const productCell = getFirstProductCell()
    addProduct('Jamón serrano Hacendado')
    removeProduct('Jamón serrano Hacendado')
    await screen.findByLabelText('Show cart')

    expect(productCell).not.toHaveTextContent('1 unit')
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'decrease_product_click',
      {
        amount: 1,
        cart_id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        cart_mode: 'purchase',
        display_name: 'Jamón serrano Hacendado',
        id: '58110',
        merca_code: '58110',
        layout: 'grid',
        price: '39,00',
        requires_age_check: false,
        selling_method: 'units',
        source: 'search',
        decreased_amount: 1,
      },
    )
  })

  it('should be able to add a product from the product detail', async () => {
    const responses = [
      {
        path: '/products/58110/',
        responseBody: productBaseDetail,
      },
      {
        path: '/products/58110/xselling/',
        responseBody: productWithoutXSelling,
      },
      {
        path: '/customers/1/cart/',
        method: 'put',
        requestBody: {
          id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
          lines: [{ quantity: 1, product_id: '58110', sources: ['+SA'] }],
        },
      },
    ]
    wrap(App)
      .atPath('/search-results?query=jam')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText(/Showing 3 results for 'jam'/)
    await openProductDetail('Jamón serrano Hacendado')
    const productDetail = await screen.findByRole('dialog')

    await addProductFromDetail('Jamón serrano Hacendado')
    await screen.findByLabelText('Show cart')

    expect(productDetail).toHaveTextContent('1 unit')
    expect(Tracker.sendInteraction).toHaveBeenCalledWith('add_product_click', {
      cart_id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
      display_name: 'Jamón serrano Hacendado',
      id: '58110',
      merca_code: '58110',
      selling_method: 'units',
      requires_age_check: false,
      price: '39,00',
      source: 'search',
      cart_mode: 'purchase',
      first_product_added_at: expect.stringContaining(today),
      first_product: true,
      amount: 0,
      layout: 'product_detail',
      added_amount: 1,
      query: 'jam',
    })
  })
})
