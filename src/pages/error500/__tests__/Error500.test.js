import { screen } from '@testing-library/react'

import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
import { goHome } from 'pages/error500/__tests__/helpers'
import { Cookie } from 'services/cookie'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Error500', () => {
  const { VITE_API_HOST: defaultHost } = import.meta.env
  configure({
    changeRoute: (route) => history.push(route),
    defaultHost,
    handleQueryParams: true,
  })

  const mount = ({ responses = [] } = {}) =>
    wrap(App).atPath('/server-error').withNetwork(responses).mount()

  Cookie.get = vi.fn().mockReturnValue({ language: 'en', postalCode: '46010' })

  it('should display the proper information', async () => {
    const {
      getByText,
      getByAltText,
      getByRole,
      queryByText,
      queryByLabelText,
    } = mount()

    await screen.findByText(
      'Sorry, the content of this page cannot be displayed.',
    )

    expect(getByAltText('error 500')).toBeInTheDocument()
    expect(
      getByText('Sorry, the content of this page cannot be displayed.'),
    ).toBeInTheDocument()
    expect(getByText('Go to shop')).toBeInTheDocument()
    expect(getByAltText('characters')).toBeInTheDocument()
    expect(getByRole('contentinfo')).toBeInTheDocument()
    expect(queryByLabelText('Search')).not.toBeInTheDocument()
    expect(queryByLabelText('Show cart')).not.toBeInTheDocument()
    expect(queryByText('Categories')).not.toBeInTheDocument()
    expect(queryByText('My Essentials')).not.toBeInTheDocument()
    expect(queryByText('Sign in')).not.toBeInTheDocument()
  })

  it('should be able to go home', async () => {
    const responses = [{ path: '/home/', responseBody: homeWithGrid }]
    mount({ responses })

    await screen.findByText(
      'Sorry, the content of this page cannot be displayed.',
    )
    goHome()
    const newArrivalsTitle = await screen.findByText('Novedades')

    expect(newArrivalsTitle).toBeInTheDocument()
    expect(
      screen.getByText('Fideos orientales Yakisoba sabor pollo Hacendado'),
    ).toBeInTheDocument()
  })

  it('should display the Error500 page when there is an error in the server', async () => {
    const responses = [{ path: '/home/', status: 500 }]
    wrap(App).atPath('/').withNetwork(responses).mount()

    const errorMessage = await screen.findByText(
      'Sorry, the content of this page cannot be displayed.',
    )

    expect(errorMessage).toBeInTheDocument()
  })
})
