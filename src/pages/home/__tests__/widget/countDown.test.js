import { screen } from '@testing-library/react'

import MockDate from 'mockdate'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { homeWithConfirmedWidget } from 'app/catalog/__scenarios__/home'
import { cloneDeep } from 'utils/objects'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

configure({
  changeRoute: (route) => history.push(route),
})

describe('when order is less than 24 hours away from cut off', () => {
  afterEach(() => {
    MockDate.reset()
  })

  it('should display the count down component on the confirmed widget', async () => {
    MockDate.set(new Date('2020-02-25T21:00:00Z'))
    const homeWithConfirmedWidgetCopy = cloneDeep(homeWithConfirmedWidget)
    homeWithConfirmedWidgetCopy.sections[0].content.items[0].changes_until =
      '2020-02-25T22:00:00Z'
    wrap(App)
      .atPath('/')
      .withNetwork([
        {
          path: '/customers/1/home/',
          responseBody: homeWithConfirmedWidgetCopy,
        },
      ])
      .withLogin()
      .mount()

    await screen.findByText('Próxima entrega')

    expect(screen.getByText('Time left to modify:')).toBeInTheDocument()
    expect(screen.getByText('hours')).toBeInTheDocument()
    expect(screen.getByText('min')).toBeInTheDocument()
    expect(screen.getByText('sec')).toBeInTheDocument()
    expect(screen.queryByText('Saturday 20 june')).not.toBeInTheDocument()
    expect(
      screen.queryByText('Delivery from 7:00 to 8:00'),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText('until 21:01 h on the 25 of February'),
    ).not.toBeInTheDocument()
  })
})
