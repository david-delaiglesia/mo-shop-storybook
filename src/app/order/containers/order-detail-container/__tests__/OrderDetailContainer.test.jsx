import { act, screen, within } from '@testing-library/react'

import userEvent from '@testing-library/user-event'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { cookies } from 'app/cookie/__scenarios__/cookies'
import { orderCart } from 'app/order/__scenarios__/orderCart'
import { preparedLines } from 'app/order/__scenarios__/orderDetail'
import { deliveredOrder, ongoingOrder } from 'app/order/__tests__/order.mock'
import { OrderStatusUI } from 'app/order/interfaces'
import { payments } from 'app/payment/__scenarios__/payments'
import {
  mockedSerializedServiceRatingAnswer,
  mockedServiceRatingStepWithAcknowledgeLayout,
} from 'app/service-rating/__tests__/service-rating.mock'
import { findPaymentMethodSection } from 'pages/__tests__/helpers/payment'
import { shoppingLists } from 'pages/shopping-lists/__tests__/scenarios'
import { Cookie } from 'services/cookie'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')
describe('<OrderDetailContainer />', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  const uuid = '1'
  const orderId = '5'

  const baseResponses = [
    {
      path: `/customers/${uuid}/orders/${orderId}/`,
      responseBody: ongoingOrder,
    },
    {
      path: `/customers/${uuid}/orders/${orderId}/cart`,
      responseBody: orderCart,
    },

    {
      path: `/customers/${uuid}/orders/${orderId}/lines/prepared/`,
      responseBody: preparedLines,
    },
  ]

  beforeEach(() => {
    vi.spyOn(Cookie, 'get').mockImplementation((cookie) => cookies[cookie])
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should be visible', async () => {
    const responses = [
      ...baseResponses,
      {
        path: `/customers/${uuid}/orders/1234/`,
        responseBody: deliveredOrder,
      },
    ]
    wrap(App)
      .atPath(`/user-area/orders/${orderId}`)
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByTestId('order-products')
    expect(Tracker.sendInteraction).toHaveBeenCalledWith('purchase_view', {
      purchase_id: 5,
      status: 'confirmed',
    })
  })

  describe('Products section', () => {
    it.each(Object.values(OrderStatusUI))(
      `can show a list of products`,
      async (status) => {
        const responses = [
          ...baseResponses,
          {
            path: `/customers/${uuid}/orders/1234/`,
            responseBody: { ...deliveredOrder, status, payment_status: 0 },
          },
        ]
        wrap(App)
          .atPath(`/user-area/orders/${orderId}`)
          .withNetwork(responses)
          .withLogin()
          .mount()

        const orderProducts = await screen.findByTestId('order-products')
        await screen.findByTestId('order-cancel__button')
        expect(orderProducts).toBeInTheDocument()
      },
    )
  })

  describe('Info section', () => {
    const responses = [
      ...baseResponses,
      {
        path: `/customers/${uuid}/orders/${orderId}/`,
        responseBody: deliveredOrder,
      },
    ]
    it('can show the delivery info', async () => {
      wrap(App)
        .atPath(`/user-area/orders/${orderId}`)
        .withNetwork(responses)
        .withLogin()
        .mount()

      const deliveryInfoSection = await screen.findByRole('region', {
        name: 'Delivery',
      })

      expect(deliveryInfoSection).toBeInTheDocument()
    })

    it('can show the payment info', async () => {
      wrap(App)
        .atPath(`/user-area/orders/${orderId}`)
        .withNetwork(responses)
        .withLogin()
        .mount()

      const paymentInfo = await findPaymentMethodSection()

      expect(paymentInfo).toBeInTheDocument()
    })

    it('can show the contact info', async () => {
      wrap(App)
        .atPath(`/user-area/orders/${orderId}`)
        .withNetwork(responses)
        .withLogin()
        .mount()

      const contactInfo = await screen.findByRole('region', { name: 'Phone' })

      expect(contactInfo).toBeInTheDocument()
    })
  })

  describe('Service rating section', () => {
    beforeEach(() => vi.useFakeTimers())

    afterEach(async () => {
      await act(async () => {
        vi.runOnlyPendingTimers()
      })
    })

    it.each(Object.values(OrderStatusUI))(
      `can not be rated`,
      async (status) => {
        const responses = [
          {
            path: `/customers/${uuid}/orders/${orderId}/lines/prepared/`,
            responseBody: preparedLines,
          },
          {
            path: `/customers/${uuid}/orders/${orderId}/`,
            responseBody: {
              ...deliveredOrder,
              status,
              serviceRatingToken: null,
            },
          },
          {
            path: '/customers/1/payment-cards/',
            responseBody: payments,
          },
        ]
        wrap(App)
          .atPath(`/user-area/orders/${orderId}`)
          .withNetwork(responses)
          .withLogin()
          .mount()

        const orderProducts = screen.queryByTestId('order-service-rating')
        expect(orderProducts).not.toBeInTheDocument()
      },
    )

    it('can be rated', async () => {
      const responses = [
        {
          path: `/customers/${uuid}/orders/${orderId}/`,
          responseBody: {
            ...deliveredOrder,
            status_ui: 'delivered',
            service_rating_token: 'token',
          },
        },
        {
          path: `/customers/${uuid}/orders/${orderId}/lines/prepared/`,
          responseBody: preparedLines,
        },
        {
          path: '/customers/1/payment-cards/',
          responseBody: payments,
        },
      ]
      wrap(App)
        .atPath(`/user-area/orders/${orderId}`)
        .withNetwork(responses)
        .withLogin()
        .mount()

      const rating = await screen.findByTestId('order-service-rating')

      expect(rating).toBeInTheDocument()
    })

    it('should hide when is rated', async () => {
      const responses = [
        {
          path: `/customers/${uuid}/orders/${orderId}/lines/prepared/`,
          responseBody: preparedLines,
        },
        {
          path: `/customers/${uuid}/orders/${orderId}/`,
          responseBody: {
            ...deliveredOrder,
            status_ui: 'delivered',
            service_rating_token: 'token',
          },
        },
        {
          path: `/customers/${uuid}/orders/${orderId}/lines/prepared/`,
          responseBody: preparedLines,
        },
        {
          path: '/customers/1/payment-cards/',
          responseBody: payments,
        },

        {
          path: `/service-rating/token/`,
          responseBody: {
            answer_id: 46,
            first_step_id: 1,
            text: 'this is a text comming from service rating',
            token: 'token',
          },
        },
        {
          path: '/service-rating/token/?lang=en&wh=vlc',
          method: 'put',
          requestBody: {
            answer_id: 46,
            text: 'this is a text comming from service rating',
          },
          responseBody: mockedSerializedServiceRatingAnswer,
        },
        {
          path: `/service-rating/token/steps/1/`,
          responseBody: mockedServiceRatingStepWithAcknowledgeLayout,
        },
      ]
      wrap(App)
        .atPath(`/user-area/orders/${orderId}`)
        .withNetwork(responses)
        .withLogin()
        .mount()

      await screen.findByTestId('order-service-rating')

      userEvent.click(screen.getByRole('button', { name: 'Rate' }))

      const acknowledgeStep = await screen.findByTestId('acknowledge-step')
      userEvent.click(within(acknowledgeStep).getByRole('button'))

      const serviceRatingRated = screen.queryByTestId('order-service-rating')

      expect(serviceRatingRated).not.toBeInTheDocument()
    })
  })

  describe('edit order button', () => {
    it('should send the event', async () => {
      const responses = [
        ...baseResponses,
        {
          path: `/customers/${uuid}/orders/${orderId}/`,
          responseBody: deliveredOrder,
        },
        {
          path: '/customers/1/payment-cards/',
          responseBody: [],
        },
        { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
      ]
      wrap(App)
        .atPath(`/user-area/orders/${orderId}`)
        .withNetwork(responses)
        .withLogin()
        .mount()

      const editOrderBtn = await screen.findByTestId(
        'order-header-detail__edit',
      )

      await act(async () => userEvent.click(editOrderBtn))

      const eventOptions = {
        purchase_id: '5',
        source: 'purchase',
      }
      expect(Tracker.sendInteraction).toHaveBeenCalledWith(
        'edit_purchase_products_click',
        eventOptions,
      )
    })
  })
})
