import { screen, within } from '@testing-library/react'

import MockDate from 'mockdate'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { OrderMother } from 'app/order/__scenarios__/OrderMother'
import { preparedLines } from 'app/order/__scenarios__/orderDetail'
import { payments } from 'app/payment/__scenarios__/payments'
import { clickToResolveOrderPaymentPendingIssue } from 'pages/__tests__/helpers/payment'
import { Storage } from 'services/storage'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('User Area - Order Detail Status', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    vi.clearAllMocks()
    Storage.clear()
    localStorage.clear()
    MockDate.reset()
  })

  describe('When status is "confirmed"', () => {
    it('should see the status order', async () => {
      wrap(App)
        .atPath('/user-area/orders/44051')
        .withNetwork([
          {
            path: '/customers/1/orders/44051/',
            responseBody: OrderMother.confirmed(),
          },
          {
            path: '/customers/1/orders/44051/lines/prepared/',
            responseBody: preparedLines,
          },
        ])
        .withLogin()
        .mount()

      await screen.findByText('Order 44051')

      const statusSection = screen.getByRole('status', { name: 'Confirmed' })

      const statusProgressBar = within(statusSection).getByRole('progressbar', {
        hidden: true,
      })
      const statusTitle = within(statusSection).getByRole('heading', {
        name: 'Confirmed',
      })

      expect(statusProgressBar).toBeInTheDocument()
      expect(statusTitle).toBeInTheDocument()

      expect(statusSection).toHaveAttribute('tabindex', '0')
      expect(statusSection).toHaveAccessibleDescription(
        'Have you forgotten something? You can still modify your order until 23:00 h on 25 of February.',
      )
      expect(statusSection).toHaveTextContent(
        'Have you forgotten something? You can still modify your order until 23:00 h on 25 of February.',
      )
    })

    describe('When is morning cutoff', () => {
      it('should see morning cutoff text message', async () => {
        wrap(App)
          .atPath('/user-area/orders/44051')
          .withNetwork([
            {
              path: '/customers/1/orders/44051/',
              responseBody: OrderMother.confirmedWithCutoffMorning(),
            },
            {
              path: '/customers/1/orders/44051/lines/prepared/',
              responseBody: preparedLines,
            },
          ])
          .withLogin()
          .mount()

        await screen.findByText('Order 44051')

        const statusSection = screen.getByRole('status', {
          name: 'Confirmed',
        })

        expect(statusSection).toHaveAttribute('tabindex', '0')
        expect(statusSection).toHaveAccessibleDescription(
          'Have you forgotten something? You can still modify your order until 02:00 h on the morning of the 25 of February.',
        )
        expect(statusSection).toHaveTextContent(
          'Have you forgotten something? You can still modify your order until 02:00 h on the morning of the 25 of February.',
        )
      })
    })

    describe('When cutoff is less than 24 hours away', () => {
      it('should see the countdown', async () => {
        MockDate.set(new Date('2020-02-25T20:01:59Z'))

        wrap(App)
          .atPath('/user-area/orders/44051')
          .withNetwork([
            {
              path: '/customers/1/orders/44051/',
              responseBody: OrderMother.confirmed(),
            },
            {
              path: '/customers/1/orders/44051/lines/prepared/',
              responseBody: preparedLines,
            },
          ])
          .withLogin()
          .mount()

        await screen.findByText('Order 44051')

        const statusSection = screen.getByRole('status', {
          name: 'Confirmed',
        })

        const statusProgressBar = within(statusSection).getByRole(
          'progressbar',
          {
            hidden: true,
          },
        )
        const statusTitle = within(statusSection).getByRole('heading', {
          name: 'Confirmed',
        })
        const statusCounter = within(statusSection).getByRole('timer')

        expect(statusProgressBar).toBeInTheDocument()
        expect(statusTitle).toBeInTheDocument()
        expect(statusSection).toHaveAttribute('tabindex', '0')
        expect(statusSection).toHaveAccessibleDescription(
          'Time left to modify your order: 01 hours 58 min 00 sec until 23:00 h on the 25 of February',
        )
        expect(statusSection).toHaveTextContent(
          'Time left to modify your order:',
        )
        expect(statusCounter).toHaveTextContent('01hours58min00sec')
        expect(statusCounter).not.toHaveClass('countdown__counter--last-hour')
        expect(statusSection).toHaveTextContent(
          'until 23:00 h on the 25 of February',
        )
      })
    })

    describe('When cutoff is less than 1 hour away', () => {
      it('should see the countdown in orange', async () => {
        MockDate.set(new Date('2020-02-25T21:01:59Z'))

        wrap(App)
          .atPath('/user-area/orders/44051')
          .withNetwork([
            {
              path: '/customers/1/orders/44051/',
              responseBody: OrderMother.confirmed(),
            },
            {
              path: '/customers/1/orders/44051/lines/prepared/',
              responseBody: preparedLines,
            },
          ])
          .withLogin()
          .mount()

        await screen.findByText('Order 44051')

        const statusSection = screen.getByRole('status', {
          name: 'Confirmed',
        })

        const statusProgressBar = within(statusSection).getByRole(
          'progressbar',
          {
            hidden: true,
          },
        )
        const statusTitle = within(statusSection).getByRole('heading', {
          name: 'Confirmed',
        })
        const statusCounter = within(statusSection).getByRole('timer')

        expect(statusProgressBar).toBeInTheDocument()
        expect(statusTitle).toBeInTheDocument()
        expect(statusSection).toHaveAttribute('tabindex', '0')
        expect(statusSection).toHaveAccessibleDescription(
          'Time left to modify your order: 00 hours 58 min 00 sec until 23:00 h on the 25 of February',
        )
        expect(statusSection).toHaveTextContent(
          'Time left to modify your order:',
        )
        expect(statusCounter).toHaveTextContent('00hours58min00sec')
        expect(statusCounter).toHaveClass('countdown__counter--last-hour')
        expect(statusSection).toHaveTextContent(
          'until 23:00 h on the 25 of February',
        )
      })
    })
  })

  describe('When status is "cancelled"', () => {
    it('should see the status order cancelled by user', async () => {
      wrap(App)
        .atPath('/user-area/orders/44051')
        .withNetwork([
          {
            path: '/customers/1/orders/44051/',
            responseBody: OrderMother.cancelledByUser(),
          },
          {
            path: '/customers/1/orders/44051/lines/prepared/',
            responseBody: preparedLines,
          },
        ])
        .withLogin()
        .mount()

      await screen.findByText('Order 44051')

      const statusSection = screen.getByRole('status', { name: 'Cancelled' })

      const statusProgressBar = within(statusSection).queryByRole(
        'progressbar',
        {
          hidden: true,
        },
      )
      const statusTitle = within(statusSection).getByRole('heading', {
        name: 'Cancelled',
      })
      const statusTime = within(statusSection).getByRole('time')

      expect(statusProgressBar).not.toBeInTheDocument()
      expect(statusTitle).toBeInTheDocument()
      expect(statusSection).toHaveAttribute('tabindex', '0')
      expect(statusSection).toHaveAccessibleDescription(
        '26 Feb 2020 You have cancelled this order. Remember that you can "repeat order" and buy the same products again.',
      )
      expect(statusTime).toHaveTextContent('26 Feb 2020')
      expect(statusSection).toHaveTextContent(
        'You have cancelled this order. Remember that you can "repeat order" and buy the same products again.',
      )
    })

    it('should see the status order cancelled by system', async () => {
      wrap(App)
        .atPath('/user-area/orders/44051')
        .withNetwork([
          {
            path: '/customers/1/orders/44051/',
            responseBody: OrderMother.cancelledBySystem(),
          },
          {
            path: '/customers/1/orders/44051/lines/prepared/',
            responseBody: preparedLines,
          },
        ])
        .withLogin()
        .mount()

      await screen.findByText('Order 44051')

      const statusSection = screen.getByRole('status', { name: 'Cancelled' })

      const statusProgressBar = within(statusSection).queryByRole(
        'progressbar',
        {
          hidden: true,
        },
      )
      const statusTitle = within(statusSection).getByRole('heading', {
        name: 'Cancelled',
      })
      const statusTime = within(statusSection).getByRole('time')

      expect(statusProgressBar).not.toBeInTheDocument()
      expect(statusTitle).toBeInTheDocument()
      expect(statusSection).toHaveAttribute('tabindex', '0')
      expect(statusSection).toHaveAccessibleDescription(
        '26 Feb 2020 You have cancelled this order. Remember that you can "repeat order" and buy the same products again.',
      )
      expect(statusTime).toHaveTextContent('26 Feb 2020')
      expect(statusSection).toHaveTextContent(
        'You have cancelled this order. Remember that you can "repeat order" and buy the same products again.',
      )
    })
  })

  describe('When status is "preparing"', () => {
    it('should see the status order', async () => {
      wrap(App)
        .atPath('/user-area/orders/44051')
        .withNetwork([
          {
            path: '/customers/1/orders/44051/',
            responseBody: OrderMother.preparing(),
          },
          {
            path: '/customers/1/orders/44051/lines/prepared/',
            responseBody: preparedLines,
          },
        ])
        .withLogin()
        .mount()

      await screen.findByText('Order 44051')

      const statusSection = screen.getByRole('status', { name: 'Preparing' })

      const statusProgressBar = within(statusSection).getByRole('progressbar', {
        hidden: true,
      })
      const statusTitle = within(statusSection).getByRole('heading', {
        name: 'Preparing',
      })

      expect(statusProgressBar).toBeInTheDocument()
      expect(statusTitle).toBeInTheDocument()
      expect(statusSection).toHaveAttribute('tabindex', '0')
      expect(statusSection).toHaveAccessibleDescription(
        'We are preparing your order.',
      )
      expect(statusSection).toHaveTextContent('We are preparing your order.')
    })
  })

  describe('When status is "prepared"', () => {
    it('should see the status order not paid yet', async () => {
      wrap(App)
        .atPath('/user-area/orders/44051')
        .withNetwork([
          {
            path: '/customers/1/orders/44051/',
            responseBody: OrderMother.preparedPendingPayment(),
          },
          {
            path: '/customers/1/orders/44051/lines/prepared/',
            responseBody: preparedLines,
          },
        ])
        .withLogin()
        .mount()

      await screen.findByText('Order 44051')

      const statusSection = screen.getByRole('status', { name: 'Prepared' })

      const statusProgressBar = within(statusSection).getByRole('progressbar', {
        hidden: true,
      })
      const statusTitle = within(statusSection).getByRole('heading', {
        name: 'Prepared',
      })

      expect(statusProgressBar).toBeInTheDocument()
      expect(statusTitle).toBeInTheDocument()
      expect(statusSection).toHaveAttribute('tabindex', '0')
      expect(statusSection).toHaveAccessibleDescription(
        'Your order is now prepared.',
      )
      expect(statusSection).toHaveTextContent('Your order is now prepared.')
    })

    it('should see the status order paid', async () => {
      wrap(App)
        .atPath('/user-area/orders/44051')
        .withNetwork([
          {
            path: '/customers/1/orders/44051/',
            responseBody: OrderMother.preparedPaid(),
          },
          {
            path: '/customers/1/orders/44051/lines/prepared/',
            responseBody: preparedLines,
          },
        ])
        .withLogin()
        .mount()

      await screen.findByText('Order 44051')

      const statusSection = screen.getByRole('status', { name: 'Prepared' })

      const statusProgressBar = within(statusSection).getByRole('progressbar', {
        hidden: true,
      })
      const statusTitle = within(statusSection).getByRole('heading', {
        name: 'Prepared',
      })

      expect(statusProgressBar).toBeInTheDocument()
      expect(statusTitle).toBeInTheDocument()
      expect(statusSection).toHaveAttribute('tabindex', '0')
      expect(statusSection).toHaveAccessibleDescription(
        'Your order is now prepared and charged.',
      )
      expect(statusSection).toHaveTextContent(
        'Your order is now prepared and charged.',
      )
    })
  })

  describe('When status is "delivering"', () => {
    it('should see the status order', async () => {
      wrap(App)
        .atPath('/user-area/orders/44051')
        .withNetwork([
          {
            path: '/customers/1/orders/44051/',
            responseBody: OrderMother.delivering(),
          },
          {
            path: '/customers/1/orders/44051/lines/prepared/',
            responseBody: preparedLines,
          },
        ])
        .withLogin()
        .mount()

      await screen.findByText('Order 44051')

      const statusSection = screen.getByRole('status', {
        name: 'Out for delivery',
      })

      const statusProgressBar = within(statusSection).getByRole('progressbar', {
        hidden: true,
      })
      const statusTitle = within(statusSection).getByRole('heading', {
        name: 'Out for delivery',
      })

      expect(statusProgressBar).toBeInTheDocument()
      expect(statusTitle).toBeInTheDocument()
      expect(statusSection).toHaveAttribute('tabindex', '0')
      expect(statusSection).toHaveAccessibleDescription(
        'Your order has been dispatched at the scheduled time. We will deliver it between 18:00 and 19:00',
      )
      expect(statusSection).toHaveTextContent(
        'Your order has been dispatched at the scheduled time. We will deliver it between 18:00 and 19:00',
      )
    })
  })

  describe('When status is "next-to-delivery"', () => {
    it('should see the status order', async () => {
      wrap(App)
        .atPath('/user-area/orders/44051')
        .withNetwork([
          {
            path: '/customers/1/orders/44051/',
            responseBody: OrderMother.nextToDelivery(),
          },
          {
            path: '/customers/1/orders/44051/lines/prepared/',
            responseBody: preparedLines,
          },
        ])
        .withLogin()
        .mount()

      await screen.findByText('Order 44051')

      const statusSection = screen.getByRole('status', { name: 'On the way' })

      const statusProgressBar = within(statusSection).getByRole('progressbar', {
        hidden: true,
      })
      const statusTitle = within(statusSection).getByRole('heading', {
        name: 'On the way',
      })

      expect(statusProgressBar).toBeInTheDocument()
      expect(statusTitle).toBeInTheDocument()
      expect(statusSection).toHaveAttribute('tabindex', '0')
      expect(statusSection).toHaveAccessibleDescription(
        'Your order is next in line for delivery. We’re on our way to your address.',
      )
      expect(statusSection).toHaveTextContent(
        'Your order is next in line for delivery. We’re on our way to your address.',
      )
    })
  })

  describe('When status is "delivered"', () => {
    it('should see the status order', async () => {
      wrap(App)
        .atPath('/user-area/orders/44051')
        .withNetwork([
          {
            path: '/customers/1/orders/44051/',
            responseBody: OrderMother.delivered(),
          },
          {
            path: '/customers/1/orders/44051/lines/prepared/',
            responseBody: preparedLines,
          },
        ])
        .withLogin()
        .mount()

      await screen.findByText('Order 44051')

      const statusSection = screen.getByRole('status', { name: 'Delivered' })

      const statusProgressBar = within(statusSection).queryByRole(
        'progressbar',
        {
          hidden: true,
        },
      )
      const statusTitle = within(statusSection).getByRole('heading', {
        name: 'Delivered',
      })
      const statusTime = within(statusSection).getByRole('time')

      expect(statusProgressBar).not.toBeInTheDocument()
      expect(statusTitle).toBeInTheDocument()
      expect(statusSection).toHaveAttribute('tabindex', '0')
      expect(statusSection).toHaveAccessibleDescription(
        '26 Feb 2020 We have delivered your order to the address indicated.',
      )
      expect(statusTime).toHaveTextContent('26 Feb 2020')
      expect(statusSection).toHaveTextContent(
        'We have delivered your order to the address indicated.',
      )
    })
  })

  describe('When payment failed', () => {
    it('should see the status order', async () => {
      wrap(App)
        .atPath('/user-area/orders/44051')
        .withNetwork([
          {
            path: '/customers/1/orders/44051/',
            responseBody: OrderMother.paymentFailed(),
          },
          {
            path: '/customers/1/orders/44051/lines/prepared/',
            responseBody: preparedLines,
          },
          {
            path: '/customers/1/payment-cards/',
            responseBody: payments,
          },
        ])
        .withLogin()
        .mount()

      await screen.findByText('Order 44051')

      const statusSection = screen.getByRole('status', {
        name: 'Payment has failed',
      })

      const statusProgressBar = within(statusSection).getByRole('progressbar', {
        hidden: true,
      })
      const statusTitle = within(statusSection).getByRole('heading', {
        name: 'Payment has failed',
      })
      const statusAction = within(statusSection).getByRole('button', {
        name: 'Solve incident',
      })

      expect(statusProgressBar).toBeInTheDocument()
      expect(statusTitle).toBeInTheDocument()
      expect(statusSection).toHaveAttribute('tabindex', '0')
      expect(statusSection).toHaveAccessibleDescription(
        'Unable to make the payment. Choose or add a new payment method to solve the issue',
      )
      expect(statusSection).toHaveTextContent(
        'Unable to make the payment. Choose or add a new payment method to solve the issue',
      )
      expect(statusAction).toBeInTheDocument()
    })
  })

  describe('When reprepared payment pending', () => {
    it('should see the status order', async () => {
      wrap(App)
        .atPath('/user-area/orders/44051')
        .withNetwork([
          {
            path: '/customers/1/orders/44051/',
            responseBody: OrderMother.repreparedPaymentPending(),
          },
          {
            path: '/customers/1/orders/44051/lines/prepared/',
            responseBody: preparedLines,
          },
        ])
        .withLogin()
        .mount()

      await screen.findByText('Order 44051')

      const statusSection = screen.getByRole('status', {
        name: 'Pending payment of €5.25',
      })

      const statusProgressBar = within(statusSection).getByRole('progressbar', {
        hidden: true,
      })
      const statusTitle = within(statusSection).getByRole('heading', {
        name: 'Pending payment of €5.25',
      })
      const statusAction = within(statusSection).getByRole('button', {
        name: 'Solve incident',
      })

      expect(statusProgressBar).toBeInTheDocument()
      expect(statusTitle).toBeInTheDocument()
      expect(statusSection).toHaveAttribute('tabindex', '0')
      expect(statusSection).toHaveAccessibleDescription(
        'As we have changed the weight or number of units of some products, which we have prepared again to preserve freshness.',
      )
      expect(statusSection).toHaveTextContent(
        'As we have changed the weight or number of units of some products, which we have prepared again to preserve freshness.',
      )
      expect(statusAction).toBeInTheDocument()
    })

    it('should not allow to edit the order', async () => {
      wrap(App)
        .atPath('/user-area/orders/44051')
        .withNetwork([
          {
            path: '/customers/1/orders/44051/',
            responseBody: OrderMother.repreparedPaymentPending(),
          },
          {
            path: '/customers/1/orders/44051/lines/prepared/',
            responseBody: preparedLines,
          },
        ])
        .withLogin()
        .mount()

      await screen.findByText('Order 44051')

      const modifyOrderButton = screen.queryByRole('button', {
        name: 'Modify',
      })
      expect(modifyOrderButton).not.toBeInTheDocument()
    })

    it('should track on click to resolve', async () => {
      wrap(App)
        .atPath('/user-area/orders/44051')
        .withNetwork([
          {
            path: '/customers/1/orders/44051/',
            responseBody: OrderMother.repreparedPaymentPending(),
          },
          {
            path: '/customers/1/orders/44051/lines/prepared/',
            responseBody: preparedLines,
          },
        ])
        .withLogin()
        .mount()

      await screen.findByText('Order 44051')

      clickToResolveOrderPaymentPendingIssue()

      expect(Tracker.sendInteraction).toHaveBeenCalledWith(
        'solve_payment_issue_click',
        {
          order_id: 44051,
          status: 'reprepared-payment-issue',
        },
      )
    })
  })

  describe('When status is "user-unreachable', () => {
    it('should see the status order', async () => {
      wrap(App)
        .atPath('/user-area/orders/44051')
        .withNetwork([
          {
            path: '/customers/1/orders/44051/',
            responseBody: OrderMother.userUnreachable(),
          },
          {
            path: '/customers/1/orders/44051/lines/prepared/',
            responseBody: preparedLines,
          },
        ])
        .withLogin()
        .mount()

      await screen.findByText('Order 44051')

      const statusSection = screen.getByRole('status', {
        name: 'Incident with the delivery',
      })

      const statusProgressBar = within(statusSection).getByRole('progressbar', {
        hidden: true,
      })
      const statusTitle = within(statusSection).getByRole('heading', {
        name: 'Incident with the delivery',
      })

      expect(statusProgressBar).toBeInTheDocument()
      expect(statusTitle).toBeInTheDocument()
      expect(statusSection).toHaveAttribute('tabindex', '0')
      expect(statusSection).toHaveAccessibleDescription(
        'We have tried to deliver your order without success. Please contact us.',
      )
      expect(statusSection).toHaveTextContent(
        'We have tried to deliver your order without success. Please contact us.',
      )
    })
  })

  describe('When status is "delayed', () => {
    it('should see the status order', async () => {
      wrap(App)
        .atPath('/user-area/orders/44051')
        .withNetwork([
          {
            path: '/customers/1/orders/44051/',
            responseBody: OrderMother.delayed(),
          },
          {
            path: '/customers/1/orders/44051/lines/prepared/',
            responseBody: preparedLines,
          },
        ])
        .withLogin()
        .mount()

      await screen.findByText('Order 44051')

      const statusSection = screen.getByRole('status', {
        name: 'Incident with the delivery',
      })

      const statusProgressBar = within(statusSection).getByRole('progressbar', {
        hidden: true,
      })
      const statusTitle = within(statusSection).getByRole('heading', {
        name: 'Incident with the delivery',
      })

      expect(statusProgressBar).toBeInTheDocument()
      expect(statusTitle).toBeInTheDocument()
      expect(statusSection).toHaveAttribute('tabindex', '0')
      expect(statusSection).toHaveAccessibleDescription(
        "We're sorry, the delivery of your order has been delayed due to an incident. Please contact us if you are unable to be at the delivery address.",
      )
      expect(statusSection).toHaveTextContent(
        "We're sorry, the delivery of your order has been delayed due to an incident. Please contact us if you are unable to be at the delivery address",
      )
    })
  })
})
