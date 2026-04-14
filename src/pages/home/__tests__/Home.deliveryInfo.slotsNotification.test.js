import { screen } from '@testing-library/react'

import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import {
  homeEmpty,
  homeWithInfo,
  homeWithWarning,
} from 'app/catalog/__scenarios__/home'
import { Storage } from 'services/storage'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Slots notification', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    vi.clearAllMocks()
    sessionStorage.clear()
    Storage.clear()
    localStorage.clear()
  })

  it('should show the not available slots message', async () => {
    const responses = [
      {
        path: '/home/',
        responseBody: homeWithWarning,
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).mount()

    await screen.findByText('Categories')

    expect(
      screen.getByText(
        'Sentimos las molestias, actualmente no hay tramos de reparto disponibles.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByAltText('Warning triangle')).toBeInTheDocument()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'no_availability_alert',
      {
        message:
          'Sentimos las molestias, actualmente no hay tramos de reparto disponibles.',
      },
    )
  })

  it('should show the limit available slots message', async () => {
    const responses = [
      {
        path: '/home/',
        responseBody: homeWithInfo,
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).mount()

    await screen.findByText('Categories')

    expect(
      screen.getByText('Siguiente fecha de entrega en 5 días naturales.'),
    ).toBeInTheDocument()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'low_availability_alert',
      {
        message: 'Siguiente fecha de entrega en 5 días naturales.',
      },
    )
  })

  it('should not show the delivery day message', async () => {
    const responses = [
      {
        path: '/home/',
        responseBody: homeEmpty,
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).mount()
    await screen.findByText('Categories')

    const noAvailabilityAlert = screen.queryByText(
      'Sentimos las molestias, actualmente no hay tramos de reparto disponibles.',
    )
    const limitAvailabilityAlert = screen.queryByText(
      'Siguiente fecha de entrega en 5 días naturales.',
    )

    expect(noAvailabilityAlert).not.toBeInTheDocument()
    expect(limitAvailabilityAlert).not.toBeInTheDocument()
  })

  it('should show the availability slots message for an authenticated user', async () => {
    const uuid = '1'
    const responses = [
      {
        path: `/customers/${uuid}/home/`,
        responseBody: homeWithWarning,
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Categories')

    expect(
      screen.getByText(
        'Sentimos las molestias, actualmente no hay tramos de reparto disponibles.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByAltText('Warning triangle')).toBeInTheDocument()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'no_availability_alert',
      {
        message:
          'Sentimos las molestias, actualmente no hay tramos de reparto disponibles.',
      },
    )
  })

  it('should send event when clicking warning notification section', async () => {
    const uuid = '1'
    const responses = [
      {
        path: `/customers/${uuid}/home/`,
        responseBody: homeWithWarning,
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Categories')
    const noAvailabilityAlert = screen.queryByText(
      'Sentimos las molestias, actualmente no hay tramos de reparto disponibles.',
    )
    noAvailabilityAlert.click()

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'no_availability_alert_click',
      {
        message:
          'Sentimos las molestias, actualmente no hay tramos de reparto disponibles.',
      },
    )
  })

  it('should send event when clicking info notification section', async () => {
    const uuid = '1'
    const responses = [
      {
        path: `/customers/${uuid}/home/`,
        responseBody: homeWithInfo,
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Categories')
    const limitAvailabilityAlert = screen.queryByText(
      'Siguiente fecha de entrega en 5 días naturales.',
    )
    limitAvailabilityAlert.click()

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'low_availability_alert_click',
      {
        message: 'Siguiente fecha de entrega en 5 días naturales.',
      },
    )
  })
})
