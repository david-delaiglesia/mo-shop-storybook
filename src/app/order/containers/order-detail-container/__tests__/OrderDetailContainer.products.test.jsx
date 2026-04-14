import { fireEvent, screen, within } from '@testing-library/react'

import { openOrderProducts } from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { cookies } from 'app/cookie/__scenarios__/cookies'
import {
  cancelledByUserOrder,
  deliveredOrder,
  ongoingOrder,
  preparedOrder,
  preparingOrder,
} from 'app/order/__tests__/order.mock'
import { mockedSingleOrderLine } from 'app/order/__tests__/orderLines.mock'
import {
  manyOrderLines,
  mockedCompleteOrderLine,
  mockedIncompleteOrderLine,
  mockedNotAvailableOrderLine,
  mockedPendingOrderLine,
} from 'app/order/__tests__/preparedOrderLines.mock'
import { Cookie } from 'services/cookie'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('<OrderDetailContainer /> order products', () => {
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

  const orderId = 1234
  const uuid = '1'
  const queryParams = '?lang=es&wh=vlc1'
  const allOrders = [
    preparingOrder,
    preparedOrder,
    deliveredOrder,
    cancelledByUserOrder,
  ]

  const baseResponses = [
    {
      path: `/customers/${uuid}/orders/5/lines/ordered/${queryParams}`,
      responseBody: { results: mockedSingleOrderLine },
    },
    {
      path: `/customers/${uuid}/payment-cards/${queryParams}`,
      responseBody: { results: [] },
    },
  ]

  it.each(allOrders)(
    `should render order products detail with all order status`,
    async (order) => {
      wrap(App)
        .atPath(`/user-area/orders/${orderId}`)
        .withNetwork([
          ...baseResponses,
          {
            path: `/customers/${uuid}/orders/${orderId}/${queryParams}`,
            responseBody: order,
          },
          {
            path: `/customers/${uuid}/orders/5/lines/prepared/${queryParams}`,
            responseBody: { results: mockedCompleteOrderLine },
          },
        ])
        .withLogin()
        .mount()

      const orderProducts = await screen.findByTestId('order-products')
      expect(orderProducts).toBeInTheDocument()
    },
  )

  it('should render order lines properly sorted', async () => {
    wrap(App)
      .atPath(`/user-area/orders/${orderId}`)
      .withNetwork([
        ...baseResponses,
        {
          path: `/customers/${uuid}/orders/${orderId}/${queryParams}`,
          responseBody: deliveredOrder,
        },
        {
          path: `/customers/${uuid}/orders/5/lines/prepared/${queryParams}`,
          responseBody: { results: manyOrderLines },
        },
      ])
      .withLogin()
      .mount()

    await openOrderProducts()

    const productLines = await screen.findAllByTestId('order-product-cell')

    const firstProductLine = productLines[0]
    const icon = within(firstProductLine).getAllByRole('img')[1]
    fireEvent.mouseMove(icon)

    const secondProductLine = productLines[1]
    const thirdProductLine = productLines[2]

    expect(
      within(firstProductLine).getByText(
        'Due to lack of stock this product was not delivered with this order.',
      ),
    ).toBeInTheDocument()

    expect(
      within(secondProductLine).getByText(
        "The ordered amount of this product wasn't delivered because of lack of stock.",
      ),
    ).toBeInTheDocument()
    expect(
      within(secondProductLine).getByText(
        "The ordered amount of this product wasn't delivered because of lack of stock.",
      ),
    ).toBeInTheDocument()
    expect(
      within(thirdProductLine).queryByText(
        'Due to lack of stock this product was not delivered with this order.',
      ),
    ).not.toBeInTheDocument()
    expect(
      within(thirdProductLine).queryByText(
        "The ordered amount of this product wasn't delivered because of lack of stock.",
      ),
    ).not.toBeInTheDocument()
  })

  describe('with a delivered order', () => {
    describe('and any of the ordered products was not prepared at all', () => {
      it('should appear the no units cell with the right text', async () => {
        wrap(App)
          .atPath(`/user-area/orders/${orderId}`)
          .withNetwork([
            ...baseResponses,
            {
              path: `/customers/${uuid}/orders/${orderId}/${queryParams}`,
              responseBody: deliveredOrder,
            },
            {
              path: `/customers/${uuid}/orders/5/lines/prepared/${queryParams}`,
              responseBody: { results: mockedNotAvailableOrderLine },
            },
          ])
          .withLogin()
          .mount()

        await openOrderProducts()

        const noUnitsCell = await screen.findByTestId('no-units-cell')
        expect(
          within(noUnitsCell).getByText('Not delivered'),
        ).toBeInTheDocument()
        expect(
          within(noUnitsCell).getByText('Product not delivered'),
        ).toBeInTheDocument()
        expect(
          within(noUnitsCell).getByText(
            'Due to lack of stock this product was not delivered with this order.',
          ),
        ).toBeInTheDocument()
      })
    })

    describe('and any of the ordered products was not fully prepared', () => {
      it('should appear the prepared units cell with the right text', async () => {
        wrap(App)
          .atPath(`/user-area/orders/${orderId}`)
          .withNetwork([
            ...baseResponses,
            {
              path: `/customers/${uuid}/orders/${orderId}/${queryParams}`,
              responseBody: deliveredOrder,
            },
            {
              path: `/customers/${uuid}/orders/5/lines/prepared/${queryParams}`,
              responseBody: { results: mockedIncompleteOrderLine },
            },
          ])
          .withLogin()
          .mount()

        await openOrderProducts()

        const preparedUnitsCell = await screen.findByTestId(
          'prepared-units-cell',
        )

        expect(
          within(preparedUnitsCell).getByText('5 units'),
        ).toBeInTheDocument()
        expect(
          within(preparedUnitsCell).getByText('3 units'),
        ).toBeInTheDocument()
        expect(
          within(preparedUnitsCell).getByText('12,45 €'),
        ).toBeInTheDocument()
        expect(
          within(preparedUnitsCell).getByText('Change in amount'),
        ).toBeInTheDocument()
        expect(
          within(preparedUnitsCell).getByText(
            "The ordered amount of this product wasn't delivered because of lack of stock.",
          ),
        ).toBeInTheDocument()
      })
    })
  })

  describe('with a NOT delivered order', () => {
    describe('and any of the ordered products was not prepared at all', () => {
      it('should appear the no units cell with the right text', async () => {
        wrap(App)
          .atPath(`/user-area/orders/${orderId}`)
          .withNetwork([
            ...baseResponses,
            {
              path: `/customers/${uuid}/orders/${orderId}/${queryParams}`,
              responseBody: ongoingOrder,
            },
            {
              path: `/customers/${uuid}/orders/5/lines/prepared/${queryParams}`,
              responseBody: { results: mockedNotAvailableOrderLine },
            },
          ])
          .withLogin()
          .mount()

        await openOrderProducts()

        const noUnitsCell = await screen.findByTestId('no-units-cell')

        expect(
          within(noUnitsCell).getByText(
            'Unfortunately this product is not currently available.',
          ),
        ).toBeInTheDocument()
        expect(
          within(noUnitsCell).getByText('Product not available'),
        ).toBeInTheDocument()
        expect(
          within(noUnitsCell).getByText('Not available'),
        ).toBeInTheDocument()
      })
    })

    describe('and any of the ordered products was not fully prepared', () => {
      it('should appear the prepared units cell with the right text', async () => {
        wrap(App)
          .atPath(`/user-area/orders/${orderId}`)
          .withNetwork([
            ...baseResponses,
            {
              path: `/customers/${uuid}/orders/${orderId}/${queryParams}`,
              responseBody: ongoingOrder,
            },
            {
              path: `/customers/${uuid}/orders/5/lines/prepared/${queryParams}`,
              responseBody: { results: mockedIncompleteOrderLine },
            },
          ])
          .withLogin()
          .mount()

        await openOrderProducts()

        const preparedUnitsCell = await screen.findByTestId(
          'prepared-units-cell',
        )

        expect(
          within(preparedUnitsCell).getByText('5 units'),
        ).toBeInTheDocument()
        expect(
          within(preparedUnitsCell).getByText('3 units'),
        ).toBeInTheDocument()
        expect(
          within(preparedUnitsCell).getByText('12,45 €'),
        ).toBeInTheDocument()
        expect(
          within(preparedUnitsCell).getByText('Change in amount'),
        ).toBeInTheDocument()
        expect(
          within(preparedUnitsCell).getByText(
            "The ordered amount of this product won't be delivered because of lack of stock.",
          ),
        ).toBeInTheDocument()
      })
    })

    describe('and the orderline has "pending" status', () => {
      it('should appear the prepared units cell with the right text', async () => {
        wrap(App)
          .atPath(`/user-area/orders/${orderId}`)
          .withNetwork([
            ...baseResponses,
            {
              path: `/customers/${uuid}/orders/${orderId}/${queryParams}`,
              responseBody: ongoingOrder,
            },
            {
              path: `/customers/${uuid}/orders/5/lines/prepared/${queryParams}`,
              responseBody: { results: mockedPendingOrderLine },
            },
          ])
          .withLogin()
          .mount()

        await openOrderProducts()

        const preparedUnitsCell = await screen.findByTestId(
          'prepared-units-cell',
        )

        expect(
          within(preparedUnitsCell).getByText('5 units'),
        ).toBeInTheDocument()
        expect(
          within(preparedUnitsCell).getByText('20,75 €'),
        ).toBeInTheDocument()
      })
    })
  })
})
