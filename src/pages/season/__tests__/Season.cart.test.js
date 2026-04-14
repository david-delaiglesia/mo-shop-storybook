import { screen } from '@testing-library/react'

import {
  addProductToCart,
  decreaseProductInCart,
  getFirstProduct,
  increaseProductInCart,
  removeProduct,
} from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { dynamicSeason, season } from 'app/catalog/__scenarios__/seasons'
import { Cookie } from 'services/cookie'
import { Storage } from 'services/storage'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Season', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  const cartId = '5529dc8b-0a94-4ae0-8145-de5186b542c6'
  const today = new Date().toISOString().split('T')[0]
  const metrics = {
    amount: 0,
    cart_id: cartId,
    display_name: 'Fideos orientales Yakisoba sabor pollo Hacendado',
    id: '8731',
    merca_code: '8731',
    layout: 'grid',
    price: '0,85',
    requires_age_check: false,
    selling_method: 'units',
    source: 'season',
    cart_mode: 'purchase',
  }

  beforeEach(() => {
    Cookie.get = vi.fn(() => ({ language: 'en', postalCode: '46010' }))
  })

  afterEach(() => {
    Storage.clear()
    Tracker.sendViewChange.mockClear()
    Tracker.sendInteraction.mockClear()
  })

  it('should be able to add a product to the cart', async () => {
    const responses = [
      { path: '/customers/1/home/seasons/31/', responseBody: season },
    ]
    wrap(App)
      .atPath('/home/seasons/31')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Para tu San Valentín')
    const product = getFirstProduct()
    addProductToCart(product)
    await screen.findByLabelText('Show cart')

    expect(product).toHaveTextContent('1 unit')
    expect(Tracker.sendInteraction).toHaveBeenCalledWith('add_product_click', {
      ...metrics,
      order: 0,
      amount: 0,
      first_product_added_at: expect.stringContaining(today),
      first_product: true,
      added_amount: 1,
    })
    expect('/customers/1/cart/').toHaveBeenFetchedWith({
      method: 'PUT',
      body: {
        id: cartId,
        lines: [{ quantity: 1, product_id: '8731', sources: ['+SN'] }],
      },
    })
  })

  it('should be able to add a product to the cart with the source and source_code received', async () => {
    const responses = [
      { path: '/customers/1/home/seasons/31/', responseBody: dynamicSeason },
    ]
    wrap(App)
      .atPath('/home/seasons/31')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Perfecto para tu fryerdora')
    const product = getFirstProduct()
    addProductToCart(product)
    await screen.findByLabelText('Show cart')

    expect(product).toHaveTextContent('1 unit')

    const metrics_with_dynamic_source = {
      ...metrics,
      source: 'perfecto-para-tu-fryerdora',
    }

    expect(Tracker.sendInteraction).toHaveBeenCalledWith('add_product_click', {
      ...metrics_with_dynamic_source,
      order: 0,
      amount: 0,
      first_product_added_at: expect.stringContaining(today),
      first_product: true,
      added_amount: 1,
    })
    expect('/customers/1/cart/').toHaveBeenFetchedWith({
      method: 'PUT',
      body: {
        id: cartId,
        lines: [{ quantity: 1, product_id: '8731', sources: ['+PS'] }],
      },
    })
  })

  it('should be able to increase a product to the cart', async () => {
    const responses = [
      { path: '/customers/1/home/seasons/31/', responseBody: season },
    ]
    wrap(App)
      .atPath('/home/seasons/31')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Para tu San Valentín')
    const product = getFirstProduct()
    addProductToCart(product)
    increaseProductInCart(product)
    await screen.findByLabelText('Show cart')

    expect(product).toHaveTextContent('2 units')
    expect(Tracker.sendInteraction).toHaveBeenCalledWith('add_product_click', {
      ...metrics,
      order: 0,
      amount: 1,
      first_product: false,
      added_amount: 1,
    })
    expect('/customers/1/cart/').toHaveBeenFetchedWith({
      method: 'PUT',
      body: {
        id: cartId,
        lines: [{ quantity: 1, product_id: '8731', sources: ['+SN'] }],
      },
    })
    expect('/customers/1/cart/').toHaveBeenFetchedWith({
      method: 'PUT',
      body: {
        id: cartId,
        lines: [{ quantity: 2, product_id: '8731', sources: ['+SN', '+SN'] }],
      },
    })
  })

  it('should be able to decrease a product from the cart', async () => {
    const responses = [
      { path: '/customers/1/home/seasons/31/', responseBody: season },
    ]
    wrap(App)
      .atPath('/home/seasons/31')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Para tu San Valentín')
    const product = getFirstProduct()
    addProductToCart(product)
    increaseProductInCart(product)
    decreaseProductInCart(product)
    await screen.findByLabelText('Show cart')

    expect(product).toHaveTextContent('1 unit')
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'decrease_product_click',
      {
        ...metrics,
        amount: 2,
        decreased_amount: 1,
      },
    )
    expect('/customers/1/cart/').toHaveBeenFetchedWith({
      method: 'PUT',
      body: {
        id: cartId,
        lines: [{ quantity: 1, product_id: '8731', sources: ['+SN'] }],
      },
    })
    expect('/customers/1/cart/').toHaveBeenFetchedWith({
      method: 'PUT',
      body: {
        id: cartId,
        lines: [{ quantity: 2, product_id: '8731', sources: ['+SN', '+SN'] }],
      },
    })
    expect('/customers/1/cart/').toHaveBeenFetchedWith({
      method: 'PUT',
      body: {
        id: cartId,
        lines: [
          { quantity: 1, product_id: '8731', sources: ['+SN', '+SN', '-SN'] },
        ],
      },
    })
  })

  it('should be able to remove a product from the cart', async () => {
    const responses = [
      { path: '/customers/1/home/seasons/31/', responseBody: season },
    ]
    wrap(App)
      .atPath('/home/seasons/31')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Para tu San Valentín')
    const product = getFirstProduct()

    addProductToCart(product)
    removeProduct(product)

    await screen.findByLabelText('Show cart')

    expect(product).toHaveTextContent('0 unit')
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'decrease_product_click',
      {
        ...metrics,
        amount: 1,
        decreased_amount: 1,
      },
    )
    expect('/customers/1/cart/').toHaveBeenFetchedWith({
      method: 'PUT',
      body: {
        id: '10000000-1000-4000-8000-100000000000',
        lines: [],
      },
    })
    expect('/customers/1/cart/').toHaveBeenFetchedWith({
      method: 'PUT',
      body: {
        id: cartId,
        lines: [{ quantity: 1, product_id: '8731', sources: ['+SN'] }],
      },
    })
  })
})
