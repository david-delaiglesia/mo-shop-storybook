import { screen } from '@testing-library/react'

import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('User Area - Invoices', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    Tracker.sendInteraction.mockClear()
    localStorage.clear()
  })

  it('should not show the invoices menu entry', async () => {
    wrap(App).atPath('/user-area/personal-info').withLogin().mount()

    const [userAreaMenu] = await screen.findAllByRole('complementary')

    expect(userAreaMenu).not.toHaveTextContent('Invoices')
  })

  it('should show the invoices menu entry when invoice flow was active', async () => {
    wrap(App)
      .atPath('/user-area/personal-info')
      .withLogin({ user: { has_active_billing: true } })
      .mount()

    const [userAreaMenu] = await screen.findAllByRole('complementary')

    expect(userAreaMenu).toHaveTextContent('Invoices')
  })
})
