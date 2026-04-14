import { screen } from '@testing-library/react'

import { setOffline, setOnline } from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
import { cookies } from 'app/cookie/__scenarios__/cookies'
import { Cookie } from 'services/cookie'
import { Storage } from 'services/storage'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Home - Network', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  const uuid = '0324234asf'
  const dateInTimeStamp = 1672563600000

  afterEach(() => {
    vi.clearAllMocks()
    Storage.clear()
    localStorage.clear()
  })

  beforeEach(() => {
    vi.spyOn(Cookie, 'get').mockImplementation((cookie) => cookies[cookie])
    Date.now = vi.fn()
  })

  it('should send a metric when the network is recovered', async () => {
    const responses = [
      { path: `/customers/${uuid}/home/`, responseBody: homeWithGrid },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByLabelText('Show cart')
    Date.now.mockReturnValue(dateInTimeStamp)
    setOffline()
    Date.now.mockReturnValue(dateInTimeStamp + 1000)
    setOnline()

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'log_network_recovered',
      {
        disconnection_time: 1000,
      },
    )
  })

  it('should send a metric resetting the time when the network is recovered', async () => {
    const responses = [
      { path: `/customers/${uuid}/home/`, responseBody: homeWithGrid },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByLabelText('Show cart')
    Date.now.mockReturnValue(dateInTimeStamp)
    setOffline()
    Date.now.mockReturnValue(dateInTimeStamp + 1000)
    setOnline()
    Date.now.mockReturnValue(dateInTimeStamp + 2000)
    setOffline()
    Date.now.mockReturnValue(dateInTimeStamp + 4000)
    setOnline()

    expect(Tracker.sendInteraction).toHaveBeenLastCalledWith(
      'log_network_recovered',
      {
        disconnection_time: 2000,
      },
    )
  })
})
