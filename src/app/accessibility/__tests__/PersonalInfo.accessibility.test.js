import { screen } from '@testing-library/react'

import { configure, wrap } from 'wrapito'

import { App, history } from 'app'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('User Area - Profile', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  it('should focus on Header when opening Personal info', async () => {
    wrap(App).atPath('/user-area/personal-info').withLogin().mount()

    await screen.findByText('Personal data', { selector: 'h1' })
    expect(
      screen.getByRole('heading', { level: 1, name: 'Personal data' }),
    ).toHaveFocus()
  })
})
