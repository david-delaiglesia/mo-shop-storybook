import { screen, within } from '@testing-library/react'

import userEvent from '@testing-library/user-event'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { OrderPaymentStatus } from 'app/order'
import { OrderMother } from 'app/order/__scenarios__/OrderMother'
import { preparedLines } from 'app/order/__scenarios__/orderDetail'
import { PaymentMethodMother } from 'app/payment/__scenarios__/PaymentMethodMother'
import {
  clickToModifyPaymentMethod,
  clickToSavePaymentMethod,
} from 'pages/__tests__/helper'
import {
  findPaymentMethodSection,
  selectExistentPaymentMethod,
} from 'pages/__tests__/helpers/payment'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('<OrderPaymentInfoContainer />', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  beforeEach(vi.restoreAllMocks)

  it('should show payment resume', async () => {
    wrap(App)
      .atPath('/user-area/orders/44051/')
      .withNetwork([
        {
          path: '/customers/1/orders/44051/',
          responseBody: OrderMother.confirmed(),
        },
        {
          path: `/customers/1/orders/44051/lines/prepared/`,
          responseBody: preparedLines,
        },
      ])
      .withLogin()
      .mount()

    const paymentMethodSection = await findPaymentMethodSection()
    const orderPaymentResume = within(paymentMethodSection).queryByTestId(
      'order-payment-resume',
    )

    expect(orderPaymentResume).toBeInTheDocument()
  })

  describe('when order is confirmed', () => {
    it('should allow order editing', async () => {
      wrap(App)
        .atPath('/user-area/orders/44051/')
        .withNetwork([
          {
            path: '/customers/1/orders/44051/',
            responseBody: OrderMother.confirmed(),
          },
          {
            path: `/customers/1/orders/44051/lines/prepared/`,
            responseBody: preparedLines,
          },
        ])
        .withLogin()
        .mount()

      const paymentMethodSection = await findPaymentMethodSection()
      const editButton = within(paymentMethodSection).queryByRole('button', {
        name: 'Modify',
      })

      expect(editButton).toBeInTheDocument()
    })
  })

  describe('when order is being prepared', () => {
    it('should not allow editing', async () => {
      wrap(App)
        .atPath('/user-area/orders/44051/')
        .withNetwork([
          {
            path: '/customers/1/orders/44051/',
            responseBody: OrderMother.preparedPaid(),
          },
          {
            path: `/customers/1/orders/44051/lines/prepared/`,
            responseBody: preparedLines,
          },
        ])
        .withLogin()
        .mount()

      await screen.findByText(/1 products/i)

      const editButton = screen.queryByRole('button', {
        name: 'Modify',
      })

      expect(editButton).not.toBeInTheDocument()
    })
  })

  describe('when editing', () => {
    it('should be able to cancel', async () => {
      wrap(App)
        .atPath('/user-area/orders/44051/')
        .withNetwork([
          {
            path: '/customers/1/orders/44051/',
            responseBody: OrderMother.confirmed(),
          },
          {
            path: `/customers/1/orders/44051/lines/prepared/`,
            responseBody: preparedLines,
          },
          {
            path: '/customers/1/payment-cards/',
            responseBody: {
              results: [
                PaymentMethodMother.creditCardVisaValid(),
                PaymentMethodMother.creditCardMastercardValid(false),
              ],
            },
          },
        ])
        .withLogin()
        .mount()

      const paymentMethodSection = await findPaymentMethodSection()
      const editButton = within(paymentMethodSection).getByRole('button', {
        name: 'Modify',
      })

      userEvent.click(editButton)
      const cancelButton = within(paymentMethodSection).getByRole('button', {
        name: 'Cancel',
      })
      expect(cancelButton).toBeInTheDocument()

      userEvent.click(cancelButton)

      const editButton2 = await within(paymentMethodSection).findByRole(
        'button',
        {
          name: 'Modify',
        },
      )

      expect(editButton2).toBeInTheDocument()
    })

    it('should save changes', async () => {
      wrap(App)
        .atPath('/user-area/orders/44051/')
        .withNetwork([
          {
            path: '/customers/1/orders/44051/',
            responseBody: OrderMother.confirmed(),
          },
          {
            path: `/customers/1/orders/44051/lines/prepared/`,
            responseBody: preparedLines,
          },
          {
            path: '/customers/1/payment-cards/',
            responseBody: {
              results: [
                PaymentMethodMother.creditCardVisaValid(),
                PaymentMethodMother.creditCardMastercardValid(false),
                PaymentMethodMother.bizum(false),
              ],
            },
          },
          {
            path: '/customers/1/orders/44051/payment-method/',
            method: 'put',
          },
        ])
        .withLogin()
        .mount()

      const paymentMethodSection = await findPaymentMethodSection()
      await clickToModifyPaymentMethod()
      await selectExistentPaymentMethod('Mastercard, **** 6023, Expires 01/23')

      await clickToSavePaymentMethod()

      const editButton2 = await within(paymentMethodSection).findByRole(
        'button',
        {
          name: 'Modify',
        },
      )

      expect(editButton2).toBeInTheDocument()

      expect('/customers/1/orders/44051/payment-method/').toHaveBeenFetchedWith(
        {
          method: 'PUT',
          body: {
            payment_method: {
              id: 4720,
            },
          },
        },
      )
    })

    it('should display list of payment methods open', async () => {
      wrap(App)
        .atPath('/user-area/orders/44051/')
        .withNetwork([
          {
            path: '/customers/1/orders/44051/',
            responseBody: OrderMother.confirmed(),
          },
          {
            path: `/customers/1/orders/44051/lines/prepared/`,
            responseBody: preparedLines,
          },
          {
            path: '/customers/1/payment-cards/',
            responseBody: {
              results: [
                PaymentMethodMother.creditCardVisaValid(),
                PaymentMethodMother.creditCardMastercardValid(false),
                PaymentMethodMother.bizum(false),
              ],
            },
          },
          {
            path: '/customers/1/orders/44051/payment-method/',
            method: 'put',
          },
        ])
        .withLogin()
        .mount()

      const paymentMethodSection = await findPaymentMethodSection()
      await clickToModifyPaymentMethod()

      await screen.findByText('**** 6017')

      expect(paymentMethodSection).toHaveTextContent('**** 6017')
    })

    it('should retry payment if order payment failed', async () => {
      wrap(App)
        .atPath('/user-area/orders/44051/')
        .withNetwork([
          {
            path: '/customers/1/orders/44051/',
            responseBody: OrderMother.paymentFailed(),
          },
          {
            path: `/customers/1/orders/44051/lines/prepared/`,
            responseBody: preparedLines,
          },
          {
            path: '/customers/1/payment-cards/',
            responseBody: {
              results: [
                PaymentMethodMother.creditCardVisaValid(),
                PaymentMethodMother.creditCardMastercardValid(false),
                PaymentMethodMother.bizum(false),
              ],
            },
          },
        ])
        .withLogin()
        .mount()

      const paymentMethod = await findPaymentMethodSection()
      const disclaimer = within(paymentMethod).getByRole('mark')

      const modifyButton = within(paymentMethod).getByRole('button', {
        name: 'Modify',
      })

      expect(modifyButton).toBeInTheDocument()
      expect(disclaimer).toHaveTextContent(
        'Edit the payment method to solve the payment issue',
      )
    })
  })

  describe('when order is cancelled', () => {
    it('should not be able to edit', async () => {
      wrap(App)
        .atPath('/user-area/orders/44051/')
        .withNetwork([
          {
            path: '/customers/1/orders/44051/',
            responseBody: OrderMother.cancelledBySystem(),
          },
          {
            path: `/customers/1/orders/44051/lines/prepared/`,
            responseBody: preparedLines,
          },
          {
            path: '/customers/1/payment-cards/',
            responseBody: {
              results: [
                PaymentMethodMother.creditCardVisaValid(),
                PaymentMethodMother.creditCardMastercardValid(false),
              ],
            },
          },
        ])
        .withLogin()
        .mount()

      const paymentMethodSection = await findPaymentMethodSection()
      const editButton = within(paymentMethodSection).queryByRole('button', {
        name: 'Modify',
      })

      expect(editButton).not.toBeInTheDocument()
    })

    it('should not be able to edit if payment failed', async () => {
      wrap(App)
        .atPath('/user-area/orders/44051/')
        .withNetwork([
          {
            path: '/customers/1/orders/44051/',
            responseBody: {
              ...OrderMother.cancelledBySystem(),
              payment_status: OrderPaymentStatus.FAILED,
            },
          },
          {
            path: `/customers/1/orders/44051/lines/prepared/`,
            responseBody: preparedLines,
          },
          {
            path: '/customers/1/payment-cards/',
            responseBody: {
              results: [
                PaymentMethodMother.creditCardVisaValid(),
                PaymentMethodMother.creditCardMastercardValid(false),
              ],
            },
          },
        ])
        .withLogin()
        .mount()

      const paymentMethodSection = await findPaymentMethodSection()
      const editButton = within(paymentMethodSection).queryByRole('button', {
        name: 'Modify',
      })

      expect(editButton).not.toBeInTheDocument()
    })
  })
})
