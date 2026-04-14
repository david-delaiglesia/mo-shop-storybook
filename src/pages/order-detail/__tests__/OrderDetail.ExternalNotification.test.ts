import { screen } from '@testing-library/react'

import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { cookies } from 'app/cookie/__scenarios__/cookies'
import { OrderMother } from 'app/order/__scenarios__/OrderMother'
import { preparedLines } from 'app/order/__scenarios__/orderDetail'
import { Cookie } from 'services/cookie'
import { Storage } from 'services/storage'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Order Detail - External Notification', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  beforeEach(() => {
    vi.spyOn(Cookie, 'get').mockImplementation((cookie) => cookies[cookie])
    vi.spyOn(Tracker, 'sendInteraction')
  })

  afterEach(() => {
    vi.clearAllMocks()
    Storage.clear()
    localStorage.clear()
  })

  it('should track the external notification event', async () => {
    wrap(App)
      .atPath(
        `/user-area/orders/44051?${new URLSearchParams({
          external_notification_source: 'email',
          external_notification_type: 'order_unpaid',
        }).toString()}`,
      )
      .withNetwork([
        {
          path: `/customers/1/orders/44051/`,
          responseBody: OrderMother.confirmed(),
        },
        {
          path: `/customers/1/orders/44051/lines/prepared/`,
          responseBody: preparedLines,
        },
      ])
      .withLogin()
      .mount()

    await screen.findByText('Order 44051')

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'external_notification_click',
      {
        order_id: '44051',
        source: 'email',
        type: 'order_unpaid',
      },
    )
  })
})
