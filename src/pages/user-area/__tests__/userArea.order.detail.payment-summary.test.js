import { screen, within } from '@testing-library/react'

import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { OrderMother } from 'app/order/__scenarios__/OrderMother'
import { preparedLines } from 'app/order/__scenarios__/orderDetail'
import { findPaymentMethodSection } from 'pages/__tests__/helpers/payment'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('User Area - Order Detail - Payment summary', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  it('should show the payment method summary section', async () => {
    const responses = [
      {
        path: `/customers/1/orders/44051/`,
        responseBody: OrderMother.delivered(),
      },
      {
        path: `/customers/1/orders/44051/lines/prepared/`,
        responseBody: preparedLines,
      },
    ]
    wrap(App)
      .atPath('/user-area/orders/44051')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Order 44051')

    const paymentSection = await findPaymentMethodSection()
    const paymentMethodSummary = within(paymentSection).getByLabelText(
      'Payment method for this order: Visa, **** 6017, Expires 01/23',
    )

    const paymentMethodIcon = within(paymentMethodSummary).getByRole('img')

    expect(paymentMethodIcon).toHaveAttribute('src', 'visa-icon.png')
    expect(paymentMethodSummary).toHaveTextContent('**** 6017')
    expect(paymentMethodSummary).toHaveTextContent('Expires 01/23')
  })
})
