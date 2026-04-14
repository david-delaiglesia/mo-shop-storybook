import { screen } from '@testing-library/react'

import {
  downloadTicket,
  openOrderLines,
  repeatOrder,
  repeatOrderFromProductList,
} from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import {
  deliveredOrder,
  order,
  preparedLines,
} from 'app/order/__scenarios__/orderDetail'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('User Area - Order Detail', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  const defaultResponses = [
    {
      path: '/customers/1/orders/26523/',
      responseBody: deliveredOrder,
    },
    {
      path: '/customers/1/orders/26523/lines/prepared/',
      responseBody: preparedLines,
    },
    { path: '/customers/1/orders/26523/receipt/' },
    { path: '/customers/1/payment-cards/' },
  ]

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should allow to download the ticket from the header', async () => {
    wrap(App)
      .atPath('/user-area/orders/26523')
      .withNetwork(defaultResponses)
      .withLogin()
      .mount()

    await screen.findByText('ORDER STATUS')
    downloadTicket()

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'ticket_download_click',
      { source: 'purchase_view' },
    )
  })

  it('should allow to repeat the order from the header', async () => {
    wrap(App)
      .atPath('/user-area/orders/26523')
      .withNetwork(defaultResponses)
      .withLogin()
      .mount()

    await screen.findByText('ORDER STATUS')
    repeatOrder()
    const repeatOrderModal = await screen.findByRole('dialog')

    expect(repeatOrderModal).toHaveTextContent('Repeat order')
    expect(repeatOrderModal).toHaveTextContent(
      'By continuing, the products and quantities of this order will be added to your cart. Do not forget to check the cart to make sure you have everything you need.',
    )
    expect(repeatOrderModal).toHaveTextContent('Continue')
    expect(repeatOrderModal).toHaveTextContent('Cancel')
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'repeat_purchase_click',
      {
        is_cart_empty: true,
        purchase_id: 26523,
        source: 'purchase_view',
      },
    )
  })

  it('should display the repeat the order info from the order line list', async () => {
    wrap(App)
      .atPath('/user-area/orders/26523')
      .withNetwork([
        {
          path: '/customers/1/orders/26523/',
          responseBody: deliveredOrder,
        },
        {
          path: '/customers/1/orders/26523/lines/prepared/',
          responseBody: preparedLines,
        },
      ])
      .withLogin()
      .mount()

    await screen.findByText('ORDER STATUS')

    const productsSection = screen.getByText('1 product').closest('article')
    expect(productsSection).not.toHaveTextContent('Repeat order')

    openOrderLines()

    expect(productsSection).toHaveTextContent('Repeat order')
    expect(productsSection).toHaveTextContent(
      'When you repeat the order, the products will be added to the cart',
    )
  })

  it('should not display the repeat the order info from the order line list if the order is not repeatable', async () => {
    wrap(App)
      .atPath('/user-area/orders/44051')
      .withNetwork([
        {
          path: '/customers/1/orders/44051/',
          responseBody: order,
        },
        {
          path: '/customers/1/orders/44051/lines/prepared/',
          responseBody: preparedLines,
        },
      ])
      .withLogin()
      .mount()

    await screen.findByText('ORDER STATUS')
    openOrderLines()

    const productsSection = screen.getByText('1 product').closest('article')
    expect(productsSection).not.toHaveTextContent('Repeat order')
    expect(productsSection).not.toHaveTextContent(
      'When you repeat the order, the products will be added to the cart',
    )
  })

  it('should allow to repeat the order from the order line list', async () => {
    wrap(App)
      .atPath('/user-area/orders/26523')
      .withNetwork(defaultResponses)
      .withLogin()
      .mount()

    await screen.findByText('ORDER STATUS')
    repeatOrderFromProductList()
    const repeatOrderModal = await screen.findByRole('dialog')

    expect(repeatOrderModal).toHaveTextContent('Repeat order')
    expect(repeatOrderModal).toHaveTextContent(
      'By continuing, the products and quantities of this order will be added to your cart. Do not forget to check the cart to make sure you have everything you need.',
    )
    expect(repeatOrderModal).toHaveTextContent('Continue')
    expect(repeatOrderModal).toHaveTextContent('Cancel')
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'repeat_purchase_click',
      {
        is_cart_empty: true,
        purchase_id: 26523,
        source: 'product_list_view',
      },
    )
  })
})
