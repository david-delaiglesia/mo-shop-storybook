import { fireEvent, screen } from '@testing-library/react'

import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import {
  categories,
  categoryDetail,
} from 'app/catalog/__scenarios__/categories'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
import { checkout } from 'app/checkout/__scenarios__/checkout'
import { orderCart } from 'app/order/__scenarios__/orderCart'
import { order } from 'app/order/__scenarios__/orderDetail'
import { shoppingLists } from 'pages/shopping-lists/__tests__/scenarios'
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

  it('should display the header for unlogged users', async () => {
    const responses = [{ path: '/home/', responseBody: homeWithGrid }]
    wrap(App).atPath('/').withNetwork(responses).mount()

    await screen.findByText('Novedades')

    expect(screen.getByLabelText('Home')).toBeInTheDocument()
    expect(
      screen.getByRole('searchbox', { name: 'Search products' }),
    ).toBeInTheDocument()
    const navigation = screen.getByRole('navigation')
    expect(navigation).toHaveTextContent('Categories')
    expect(navigation).toHaveTextContent('Lists')
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Show cart' }),
    ).toBeInTheDocument()
  })

  it('should display the header for logged users', async () => {
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithGrid },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Novedades')

    expect(screen.getByLabelText('Home')).toBeInTheDocument()
    expect(
      screen.getByRole('searchbox', { name: 'Search products' }),
    ).toBeInTheDocument()
    const navigation = screen.getByRole('navigation')
    expect(navigation).toHaveTextContent('Categories')
    expect(navigation).toHaveTextContent('Lists')
    expect(
      screen.getByRole('button', { name: 'Hello John' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Show cart' }),
    ).toBeInTheDocument()
  })

  it('should display the simplified header for not found page', async () => {
    wrap(App).atPath('/not-found').mount()

    await screen.findByText(
      'Sorry, it is not possible to find the page you are looking for.',
    )

    expect(screen.getByLabelText('Home')).toBeInTheDocument()
    expect(
      screen.queryByRole('search', { name: 'Search products' }),
    ).not.toBeInTheDocument()
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Hello John' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Show cart' }),
    ).not.toBeInTheDocument()
  })

  it('should display the simplified header for not found page', async () => {
    wrap(App).atPath('/server-error').mount()

    await screen.findByText(
      'Sorry, the content of this page cannot be displayed.',
    )

    expect(screen.getByLabelText('Home')).toBeInTheDocument()
    expect(
      screen.queryByRole('searchbox', { name: 'Search products' }),
    ).not.toBeInTheDocument()
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Hello John' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Show cart' }),
    ).not.toBeInTheDocument()
  })

  it('should go to home after clicking the Mercadona logo', async () => {
    const responses = [
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetail },
      { path: '/customers/1/home/', responseBody: homeWithGrid },
    ]
    wrap(App)
      .atPath('/categories/112')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findAllByText('Aceite, vinagre y sal')
    fireEvent.click(screen.getByLabelText('Home'))
    const homeSection = await screen.findByText('Novedades')

    expect(homeSection).toBeInTheDocument()
  })

  it('should display the proper header for the checkout page', async () => {
    const responses = [
      {
        path: '/customers/1/checkouts/5/',
        responseBody: checkout,
      },
      { path: '/customers/1/orders/', responseBody: { results: [] } },
    ]
    wrap(App).atPath('/checkout/5').withNetwork(responses).withLogin().mount()

    await screen.findByText('Delivery')

    expect(screen.getByLabelText('Back')).toBeInTheDocument()
    expect(
      screen.queryByRole('searchbox', { name: 'Search products' }),
    ).not.toBeInTheDocument()
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Hello John' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Show cart' }),
    ).not.toBeInTheDocument()
  })

  it('should display the proper header for the edit order page', async () => {
    const responses = [
      { path: '/customers/1/orders/44051/', responseBody: order },
      { path: '/customers/1/orders/44051/cart/', responseBody: orderCart },
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetail },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ]
    wrap(App)
      .atPath('/orders/44051/edit/products/')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Products in my order')

    const header = screen.getByRole('banner')
    expect(
      screen.getByRole('button', { name: 'Cancel and go back' }),
    ).toBeInTheDocument()
    expect(header).not.toContainElement(
      screen.getByRole('searchbox', { name: 'Search products' }),
    )
    expect(header).not.toContainElement(screen.queryByRole('navigation'))
    expect(
      screen.queryByRole('button', { name: 'Hello John' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Show cart' }),
    ).not.toBeInTheDocument()
  })
})
