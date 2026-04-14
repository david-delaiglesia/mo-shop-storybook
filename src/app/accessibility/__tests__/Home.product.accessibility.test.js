import { screen } from '@testing-library/react'

import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
import {
  productBaseDetail,
  productWithoutXSelling,
} from 'app/catalog/__scenarios__/product'
import { cookies } from 'app/cookie/__scenarios__/cookies'
import { closeProductDetail, openProductDetail } from 'pages/helpers'
import { Cookie } from 'services/cookie'
import { Storage } from 'services/storage'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Home - Product', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  beforeEach(() => {
    vi.spyOn(Cookie, 'get').mockImplementation((cookie) => cookies[cookie])
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.clearAllMocks()
    Storage.clear()
    localStorage.clear()
  })

  it('should restore the focus to the open product detail group', async () => {
    const responses = [
      { path: '/home/', responseBody: homeWithGrid },
      {
        path: '/products/8731/?lang=es&wh=vlc1',
        responseBody: productBaseDetail,
      },
      {
        path: '/products/8731/xselling/',
        responseBody: productWithoutXSelling,
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).mount()

    await screen.findByText('Mercadona online shopping')
    await openProductDetail('Fideos orientales Yakisoba sabor pollo Hacendado')
    await screen.findByRole('dialog')
    closeProductDetail()

    const productButton = screen.getByRole('button', {
      name: 'Fideos orientales Yakisoba sabor pollo Hacendado, Paquete, 90 Grams, 0,85€ per Unit',
    })
    expect(productButton).toHaveFocus()
  })
})
