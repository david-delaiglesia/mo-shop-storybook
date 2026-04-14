import { screen } from '@testing-library/react'

import { seeNextProductImage, setHightResolution } from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import {
  productBaseDetail,
  productWithoutXSelling,
  productXSelling,
  xSellingWithTooManyProducts,
} from 'app/catalog/__scenarios__/product'
import { Storage } from 'services/storage'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Product - Private - Cross Selling', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    vi.clearAllMocks()
    Storage.clear()
    localStorage.clear()
  })

  it('should not show the xSelling', async () => {
    const responses = [
      { path: '/products/8731/', responseBody: { ...productBaseDetail } },
      {
        path: '/products/8731/xselling/',
        responseBody: productWithoutXSelling,
      },
    ]
    wrap(App).atPath('/product/8731').withNetwork(responses).mount()

    await screen.findByAltText(
      'Main product image Fideos orientales Yakisoba sabor pollo Hacendado',
    )

    expect(screen.queryByText('Related products')).not.toBeInTheDocument()
  })

  it('should show the xSelling', async () => {
    const responses = [
      { path: '/products/8731/', responseBody: { ...productBaseDetail } },
      {
        path: '/products/8731/xselling/',
        responseBody: productXSelling,
      },
    ]
    wrap(App).atPath('/product/8731').withNetwork(responses).mount()

    await screen.findByAltText(
      'Main product image Fideos orientales Yakisoba sabor pollo Hacendado',
    )

    expect(screen.getByText('Related products')).toBeInTheDocument()
    expect(screen.getByText('Pera conferencia')).toBeInTheDocument()
  })

  it('should show the next arrow', async () => {
    const responses = [
      { path: '/products/8731/', responseBody: { ...productBaseDetail } },
      {
        path: '/products/8731/xselling/',
        responseBody: xSellingWithTooManyProducts,
      },
    ]
    wrap(App).atPath('/product/8731').withNetwork(responses).mount()

    await screen.findByAltText(
      'Main product image Fideos orientales Yakisoba sabor pollo Hacendado',
    )

    expect(
      screen.queryByLabelText('previous-related-products-page'),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByLabelText('next-related-products-page'),
    ).toBeInTheDocument()
  })

  it('should show the previous arrow', async () => {
    setHightResolution()
    const responses = [
      { path: '/products/8731/', responseBody: { ...productBaseDetail } },
      {
        path: '/products/8731/xselling/',
        responseBody: xSellingWithTooManyProducts,
      },
    ]
    wrap(App).atPath('/product/8731').withNetwork(responses).mount()

    await screen.findByAltText(
      'Main product image Fideos orientales Yakisoba sabor pollo Hacendado',
    )
    seeNextProductImage()

    expect(
      screen.queryByLabelText('previous-related-products-page'),
    ).toBeInTheDocument()
    expect(
      screen.queryByLabelText('next-related-products-page'),
    ).not.toBeInTheDocument()
  })
})
