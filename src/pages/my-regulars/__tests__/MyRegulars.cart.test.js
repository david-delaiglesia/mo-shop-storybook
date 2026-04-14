import { screen } from '@testing-library/react'

import { addProductRecommendation } from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import {
  recommendations,
  recommendationsWithRecommendedQuantity,
} from 'app/catalog/__scenarios__/recommendations'
import { decreaseProduct, increaseProduct, removeProduct } from 'pages/helpers'
import { Storage } from 'services/storage'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('My Regulars - Cart', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    vi.clearAllMocks()
    Storage.clear()
    localStorage.clear()
  })

  it('should be able to add a product to the cart', async () => {
    const responses = [
      {
        path: '/customers/1/recommendations/myregulars/',
        responseBody: recommendations,
      },
    ]
    wrap(App).atPath('/my-products').withNetwork(responses).withLogin().mount()

    await screen.findByText('Fideos orientales Yakisoba sabor pollo Hacendado')
    addProductRecommendation('Fideos orientales Yakisoba sabor pollo Hacendado')
    await screen.getAllByText('2 units')

    expect('/customers/1/cart/').toHaveBeenFetchedWith({
      method: 'PUT',
      body: {
        id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        lines: [{ quantity: 2, product_id: '8731', sources: ['+MR', '+MR'] }],
      },
    })
    expect(Tracker.sendInteraction).toHaveBeenCalledWith('add_product_click', {
      cart_id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
      source: 'my_regulars',
      id: '8731',
      merca_code: '8731',
      display_name: 'Fideos orientales Yakisoba sabor pollo Hacendado',
      layout: 'grid',
      price: '0,85',
      requires_age_check: false,
      selling_method: 'units',
      order: 0,
      cart_mode: 'purchase',
      amount: 0,
      added_amount: 2,
      added_quantity: 2,
      first_product: true,
      first_product_added_at: expect.stringContaining(
        new Date().toISOString().split('T')[0],
      ),
    })
  })

  it('should be able to add a bulk product to the cart', async () => {
    const responses = {
      path: '/customers/1/recommendations/myregulars/',
      responseBody: recommendations,
    }

    wrap(App).atPath('/my-products').withNetwork(responses).withLogin().mount()

    await screen.findByText('Uva blanca con semillas')
    addProductRecommendation('Uva blanca con semillas')
    await screen.getAllByText('300 g')

    expect('/customers/1/cart/').toHaveBeenFetchedWith({
      method: 'PUT',
      body: {
        id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        lines: [
          { quantity: 0.3, product_id: '3317', sources: ['+MR', '+MR', '+MR'] },
        ],
      },
    })
    expect(Tracker.sendInteraction).toHaveBeenCalledWith('add_product_click', {
      cart_id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
      source: 'my_regulars',
      id: '3317',
      merca_code: '3317',
      display_name: 'Uva blanca con semillas',
      layout: 'grid',
      price: '1,89',
      requires_age_check: false,
      selling_method: 'bunch',
      order: 2,
      cart_mode: 'purchase',
      amount: 0,
      added_amount: 3,
      added_quantity: 0.3,
      first_product: true,
      first_product_added_at: expect.stringContaining(
        new Date().toISOString().split('T')[0],
      ),
    })
  })

  it('should be able to increase a product to the cart', async () => {
    const responses = {
      path: '/customers/1/recommendations/myregulars/',
      responseBody: recommendations,
    }

    wrap(App).atPath('/my-products').withNetwork(responses).withLogin().mount()

    await screen.findByText('Fideos orientales Yakisoba sabor pollo Hacendado')
    addProductRecommendation('Fideos orientales Yakisoba sabor pollo Hacendado')
    await screen.getAllByText('2 units')
    increaseProduct('Fideos orientales Yakisoba sabor pollo Hacendado')
    await screen.getAllByText('3 units')

    expect('/customers/1/cart/').toHaveBeenFetchedWith({
      method: 'PUT',
      body: {
        id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        lines: [
          { quantity: 3, product_id: '8731', sources: ['+MR', '+MR', '+MR'] },
        ],
      },
    })
    expect(Tracker.sendInteraction).toHaveBeenCalledWith('add_product_click', {
      cart_id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
      source: 'my_regulars',
      id: '8731',
      merca_code: '8731',
      display_name: 'Fideos orientales Yakisoba sabor pollo Hacendado',
      layout: 'grid',
      price: '0,85',
      requires_age_check: false,
      selling_method: 'units',
      order: 0,
      cart_mode: 'purchase',
      amount: 2,
      added_quantity: 2,
      added_amount: 1,
      first_product: false,
    })
  })

  it('should be able to remove a product to the cart', async () => {
    const responses = {
      path: '/customers/1/recommendations/myregulars/',
      responseBody: recommendations,
    }

    wrap(App).atPath('/my-products').withNetwork(responses).withLogin().mount()

    await screen.findByText('Fideos orientales Yakisoba sabor pollo Hacendado')

    addProductRecommendation('Fideos orientales Yakisoba sabor pollo Hacendado')
    decreaseProduct('Fideos orientales Yakisoba sabor pollo Hacendado')
    removeProduct('Fideos orientales Yakisoba sabor pollo Hacendado')

    expect('/customers/1/cart/').toHaveBeenFetchedWith({
      method: 'PUT',
      body: {
        id: '10000000-1000-4000-8000-100000000000',
        lines: [],
      },
    })
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'decrease_product_click',
      {
        cart_id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        source: 'my_regulars',
        id: '8731',
        merca_code: '8731',
        display_name: 'Fideos orientales Yakisoba sabor pollo Hacendado',
        layout: 'grid',
        price: '0,85',
        requires_age_check: false,
        selling_method: 'units',
        cart_mode: 'purchase',
        amount: 2,
        decreased_amount: 1,
      },
    )
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'decrease_product_click',
      {
        cart_id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        source: 'my_regulars',
        id: '8731',
        merca_code: '8731',
        display_name: 'Fideos orientales Yakisoba sabor pollo Hacendado',
        layout: 'grid',
        price: '0,85',
        requires_age_check: false,
        selling_method: 'units',
        cart_mode: 'purchase',
        amount: 1,
        decreased_amount: 1,
      },
    )
  })

  it('should be able to send added amount for bunch products', async () => {
    const responses = [
      {
        path: '/customers/1/recommendations/myregulars/',
        responseBody: recommendationsWithRecommendedQuantity,
      },
    ]
    wrap(App).atPath('/my-products').withNetwork(responses).withLogin().mount()

    await screen.findByText('Uva blanca con semillas')
    addProductRecommendation('Uva blanca con semillas')
    await screen.getAllByText('400 g')

    expect(Tracker.sendInteraction).toHaveBeenCalledWith('add_product_click', {
      cart_id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
      source: 'my_regulars',
      id: '3317',
      merca_code: '3317',
      display_name: 'Uva blanca con semillas',
      layout: 'grid',
      price: '1,89',
      requires_age_check: false,
      selling_method: 'bunch',
      order: 0,
      cart_mode: 'purchase',
      amount: 0,
      added_amount: 4,
      added_quantity: 0.4,
      first_product: true,
      first_product_added_at: expect.stringContaining(
        new Date().toISOString().split('T')[0],
      ),
    })
  })
})
