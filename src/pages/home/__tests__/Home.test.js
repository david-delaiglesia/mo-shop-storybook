import { screen } from '@testing-library/react'

import { goToCategories } from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import {
  categories,
  categoryDetail,
} from 'app/catalog/__scenarios__/categories'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
import { getProductCell } from 'pages/helpers'
import { Storage } from 'services/storage'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Home', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    vi.clearAllMocks()
    Storage.clear()
    localStorage.clear()
  })

  it('should have the proper title header', async () => {
    const responses = [{ path: '/home/', responseBody: homeWithGrid }]
    wrap(App).atPath('/').withNetwork(responses).mount()

    const title = await screen.findByRole('heading', { level: 1 })
    const sectionTitle = screen.getByRole('heading', { level: 2 })

    expect(title).toHaveTextContent('Mercadona online shopping')
    expect(sectionTitle).toHaveTextContent('Novedades')
  })

  it('should show season products', async () => {
    const responses = [{ path: '/home/', responseBody: homeWithGrid }]
    wrap(App).atPath('/').withNetwork(responses).mount()

    const title = await screen.findByText('Novedades')

    const subtitle = screen.getByText('Productos recién añadidos o mejorados')
    expect(title).toBeInTheDocument()
    expect(subtitle).toBeInTheDocument()
    const firstProduct = getProductCell(
      'Fideos orientales Yakisoba sabor pollo Hacendado',
    )
    expect(firstProduct).toHaveTextContent('0,85 €')
  })

  it('should navigate to categories page', async () => {
    const responses = [
      { path: '/home/', responseBody: homeWithGrid },
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetail },
    ]
    wrap(App).atPath('/').withNetwork(responses).mount()

    await screen.findByText('Categories')
    goToCategories()
    const categoryTitle = await screen.findByText('Aceite, vinagre y sal')

    expect(categoryTitle).toBeInTheDocument()
  })

  it('should show a footer with links', async () => {
    const responses = [{ path: '/home/', responseBody: homeWithGrid }]
    wrap(App).atPath('/').withNetwork(responses).mount()

    await screen.findByText('Novedades')

    const footer = screen.getByRole('contentinfo')
    expect(footer).toContainElement(screen.getByText('© Mercadona S.A.'))
    expect(footer).toContainElement(screen.getByText('Cookies policy'))
    expect(footer).toContainElement(screen.getByText('Privacy policy'))
    expect(footer).toContainElement(screen.getByText('Terms and conditions'))
    expect(footer).toContainElement(
      screen.getByRole('button', { name: 'Language selector' }),
    )
  })

  describe('when the browser has not storage', () => {
    const storage = window.sessionStorage

    beforeEach(() => {
      const message =
        'Failed to read the "sessionStorage" property from "Window": Access is denied for this document.'
      Object.defineProperty(window, 'sessionStorage', {
        get: () => {
          throw Error(message)
        },
        configurable: true,
      })
    })

    it('should show products', async () => {
      const responses = [{ path: '/home/', responseBody: homeWithGrid }]
      wrap(App).atPath('/').withNetwork(responses).mount()

      await screen.findByText('Novedades')

      const product = getProductCell(
        'Fideos orientales Yakisoba sabor pollo Hacendado',
      )
      expect(product).toBeInTheDocument()
    })

    afterEach(() => {
      Object.defineProperty(window, 'sessionStorage', {
        get: () => {
          return storage
        },
        configurable: true,
      })
    })
  })
})
