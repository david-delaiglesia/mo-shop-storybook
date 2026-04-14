import { screen } from '@testing-library/react'

import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
import { goHome } from 'pages/error404/__tests__/helpers'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Error404', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  it('should display the proper information', async () => {
    wrap(App).atPath('/not-found').mount()

    await screen.findByText(
      'Sorry, it is not possible to find the page you are looking for.',
    )

    expect(screen.getByAltText('error 404')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Sorry, it is not possible to find the page you are looking for.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByText('Go to shop')).toBeInTheDocument()
    expect(screen.getByAltText('characters')).toBeInTheDocument()
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    expect(screen.queryByLabelText('Search')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Show cart')).not.toBeInTheDocument()
    expect(screen.queryByText('Categories')).not.toBeInTheDocument()
    expect(screen.queryByText('My Essentials')).not.toBeInTheDocument()
    expect(screen.queryByText('Sign in')).not.toBeInTheDocument()
    expect(Tracker.sendViewChange).toHaveBeenCalledWith('not_found')
  })

  it('should be able to go home', async () => {
    const responses = [{ path: '/home/', responseBody: homeWithGrid }]
    wrap(App).atPath('/not-found').withNetwork(responses).mount()

    await screen.findByText(
      'Sorry, it is not possible to find the page you are looking for.',
    )
    goHome()
    const newArrivalsTitle = await screen.findByText('Novedades')

    expect(newArrivalsTitle).toBeInTheDocument()
    expect(
      screen.getByText('Fideos orientales Yakisoba sabor pollo Hacendado'),
    ).toBeInTheDocument()
  })

  it('should display the Error400 page when there is a not found resource', async () => {
    const responses = [
      { path: '/home/', status: 404, responseBody: { errors: [] } },
    ]
    wrap(App).atPath('/').withNetwork(responses).mount()

    await screen.findByText(
      'Sorry, it is not possible to find the page you are looking for.',
    )

    expect(
      screen.getByText(
        'Sorry, it is not possible to find the page you are looking for.',
      ),
    ).toBeInTheDocument()
  })
})
