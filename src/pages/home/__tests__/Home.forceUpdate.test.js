import { screen } from '@testing-library/react'

import { confirmForceUpdate } from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { Cache } from 'services/cache'
import { Cookie } from 'services/cookie'
import { Session } from 'services/session'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Home - Force Update', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  it('should update the version after receiving a force update status', async () => {
    Cookie.get = vi.fn().mockReturnValue({ postalCode: '46010' })
    Cache.clearAndReload = vi.fn()
    Session.remove = vi.fn()
    const responses = [{ path: '/customers/1/home/', status: 452 }]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Update needed')

    const forceUpdateDialog = screen.getByRole('dialog')
    expect(forceUpdateDialog).toHaveTextContent('Update needed')
    expect(forceUpdateDialog).toHaveTextContent(
      "You're using an old version of the web. Please update it.",
    )

    confirmForceUpdate()

    expect(Cache.clearAndReload).toHaveBeenCalledTimes(1)
    expect(Session.remove).not.toHaveBeenCalled()
    expect(Tracker.sendViewChange).toHaveBeenCalledWith('force_update_alert')
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'force_update_alert_confirm_click',
    )
  })
})
