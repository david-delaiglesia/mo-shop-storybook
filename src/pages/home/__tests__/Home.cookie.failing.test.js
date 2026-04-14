import { screen } from '@testing-library/react'

import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
import { cookies } from 'app/cookie/__scenarios__/cookies'
import { Cookie } from 'services/cookie'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

configure({
  changeRoute: (route) => history.push(route),
})

const mount = ({ responses = [] } = {}) =>
  wrap(App).atPath('/').withNetwork(responses).mount()

beforeEach(() => {
  Cookie.get = vi.fn()
  Cookie.areThirdPartyAccepted = vi.fn()
  sessionStorage.clear()
})

afterEach(() => {
  vi.clearAllMocks()
})

it('should remove the cookies when the third-party are rejected', async () => {
  import.meta.env.VITE_COOKIES_VERSION = 0
  Cookie.get = vi.fn(() => cookies)
  Cookie.getAll = vi.fn(() => {
    return {
      __mo_dev_ca: '{"thirdParty":true,"necessary":true}',
      __mo_dev_da: '{"warehouse":"vlc1","postalCode":"46017"}',
      'third-party': '{data:"data"}',
    }
  })
  const responses = { path: '/home/', responseBody: homeWithGrid }
  mount({ responses })

  await screen.findByText('Novedades')

  expect(Cookie.remove).toHaveBeenCalledWith('third-party', 'mercadona.es')
  expect(
    screen.queryByText(/We use first-party and third-party cookies/),
  ).not.toBeInTheDocument()
})

it('should not remove the necessary cookies when the third-party are rejected', async () => {
  import.meta.env.VITE_COOKIES_VERSION = 0
  Cookie.get = vi.fn(() => cookies)
  Cookie.getAll = vi.fn(() => {
    return {
      __mo_dev_ca: '{"thirdParty":true,"necessary":true}',
      __mo_dev_da: '{"warehouse":"vlc1","postalCode":"46017"}',
      'amplitude_id_d9733c7439c851037c5cf544e9ed4c8fmercadona.es': 'token',
    }
  })

  const responses = { path: '/home/', responseBody: homeWithGrid }
  mount({ responses })

  await screen.findByText('Novedades')

  expect(Cookie.remove).not.toHaveBeenCalledWith(
    'amplitude_id_d9733c7439c851037c5cf544e9ed4c8fmercadona.es',
    'mercadona.es',
  )
  expect(
    screen.queryByText(/We use first-party and third-party cookies/),
  ).not.toBeInTheDocument()
})
