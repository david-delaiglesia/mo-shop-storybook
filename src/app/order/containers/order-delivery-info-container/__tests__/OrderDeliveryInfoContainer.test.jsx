import { screen, within } from '@testing-library/react'

import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { CheckoutMother } from 'app/checkout/__scenarios__/CheckoutMother'
import { OrderMother } from 'app/order/__scenarios__/OrderMother'
import { preparedLines } from 'app/order/__scenarios__/orderDetail'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('<OrderDeliveryInfoContainer />', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should show the delivery resume', async () => {
    wrap(App)
      .atPath('/user-area/orders/44051')
      .withNetwork([
        {
          path: `/customers/1/orders/44051/`,
          responseBody: OrderMother.delivered(),
        },
        {
          path: `/customers/1/orders/44051/lines/prepared/`,
          responseBody: preparedLines,
        },
      ])
      .withLogin()
      .mount()

    const deliverySection = await screen.findByRole('region', {
      name: 'Delivery',
    })

    expect(
      within(deliverySection).getByRole('heading', {
        name: 'Delivery',
      }),
    ).toBeInTheDocument()
    expect(
      within(deliverySection).getByText('Wednesday 26 of February'),
    ).toBeInTheDocument()
    expect(
      within(deliverySection).getByText('from 18:00 to 19:00'),
    ).toBeInTheDocument()
    expect(
      within(deliverySection).getByText(
        'Calle Arquitecto Mora, 10, Piso 8 Puerta 14',
      ),
    ).toBeInTheDocument()
    expect(
      within(deliverySection).getByText('46010, València'),
    ).toBeInTheDocument()
  })

  it('should show the delivery resume on the checkout with the edit button', async () => {
    wrap(App)
      .atPath('/checkout/5')
      .withNetwork([
        {
          path: '/customers/1/checkouts/5/',
          responseBody: CheckoutMother.filled(),
        },
      ])
      .withLogin()
      .mount()

    const deliveryInfoCard = await screen.findByRole('region', {
      name: 'Delivery',
    })

    expect(
      within(deliveryInfoCard).getByRole('button', {
        name: 'Modify',
      }),
    ).toBeInTheDocument()
  })
})
