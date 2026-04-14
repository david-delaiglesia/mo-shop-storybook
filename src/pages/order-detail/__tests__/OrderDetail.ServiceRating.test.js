import { screen } from '@testing-library/react'

import { closeServiceRating, openServiceRating } from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import {
  deliveredOrder,
  preparedLines,
} from 'app/order/__scenarios__/orderDetail'
import {
  moodStep,
  serviceRating,
} from 'app/service-rating/__scenarios__/serviceRating'
import { Storage } from 'services/storage'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Order Detail - Service Rating', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    vi.clearAllMocks()
    Storage.clear()
    localStorage.clear()
  })

  it('should display the service rating section', async () => {
    const responses = [
      {
        path: `/customers/1/orders/26523/`,
        responseBody: deliveredOrder,
      },
      {
        path: `/customers/1/orders/26523/lines/prepared/`,
        responseBody: preparedLines,
      },
    ]
    wrap(App)
      .atPath('/user-area/orders/26523')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Order 26523')

    expect(screen.getByText('Rate this order')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Rate' })).toBeInTheDocument()
  })

  it('should open the service rating modal', async () => {
    const responses = [
      {
        path: `/customers/1/orders/26523/`,
        responseBody: deliveredOrder,
      },
      {
        path: `/customers/1/orders/26523/lines/prepared/`,
        responseBody: preparedLines,
      },
      {
        path: `/service-rating/12345/`,
        responseBody: serviceRating,
      },
      {
        path: `/service-rating/12345/steps/1/`,
        responseBody: moodStep,
      },
    ]
    wrap(App)
      .atPath('/user-area/orders/26523')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Order 26523')
    openServiceRating()
    const serviceRatingDialog = await screen.findByRole('dialog')

    expect(serviceRatingDialog).toHaveTextContent('How was your order?')
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'order_detail_service_rating_button_click',
    )
  })

  it('should close the service rating modal', async () => {
    const responses = [
      {
        path: `/customers/1/orders/26523/`,
        responseBody: deliveredOrder,
      },
      {
        path: `/customers/1/orders/26523/lines/prepared/`,
        responseBody: preparedLines,
      },
      { path: `/service-rating/12345/`, responseBody: serviceRating },
      { path: `/service-rating/12345/steps/1/`, responseBody: moodStep },
    ]
    wrap(App)
      .atPath('/user-area/orders/26523')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Order 26523')
    openServiceRating()
    const serviceRatingDialog = await screen.findByRole('dialog')
    closeServiceRating()

    expect(serviceRatingDialog).not.toBeInTheDocument()
  })
})
