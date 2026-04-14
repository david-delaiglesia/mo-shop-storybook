import { screen, within } from '@testing-library/react'

import {
  closeNoSimilarProductsAlert,
  closeSimilarProductsDialog,
  goBackToAlternatives,
} from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { productWithoutXSelling } from 'app/catalog/__scenarios__/product'
import { recommendationsWithUnpublished } from 'app/catalog/__scenarios__/recommendations'
import {
  noSimilars,
  similarProductDetail,
  similars,
} from 'app/catalog/__scenarios__/similars'
import {
  getProductCell,
  openProductDetail,
  viewSimilarProducts,
} from 'pages/helpers'
import { Storage } from 'services/storage'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('My Regulars', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    vi.clearAllMocks()
    Storage.clear()
    localStorage.clear()
  })

  it('should show the unpublished product cell', async () => {
    const responses = [
      {
        path: '/customers/1/recommendations/myregulars/',
        responseBody: recommendationsWithUnpublished,
      },
    ]
    wrap(App).atPath('/my-products').withNetwork(responses).withLogin().mount()

    await screen.findByRole('heading', { name: 'My Essentials' })

    const unpublishedProduct = getProductCell('Uva blanca con semillas')
    expect(unpublishedProduct).toHaveTextContent('Product not available')
    expect(unpublishedProduct).toHaveTextContent('Product not available')
  })

  it('should display the similar products dialog', async () => {
    const responses = [
      {
        path: '/customers/1/recommendations/myregulars/',
        responseBody: recommendationsWithUnpublished,
      },
      { path: '/products/3317/similars/', responseBody: similars },
    ]
    wrap(App).atPath('/my-products').withNetwork(responses).withLogin().mount()

    await screen.findByRole('heading', { name: 'My Essentials' })
    viewSimilarProducts('Uva blanca con semillas')
    const similarsModal = await screen.findByRole('dialog')

    expect(similarsModal).toContainElement(
      screen.getByAltText('Main product image Uva blanca con semillas'),
    )
    expect(similarsModal).toHaveTextContent('Product not available')
    expect(similarsModal).toHaveTextContent('Uva blanca con semillas')
    expect(similarsModal).toHaveTextContent('Paquete 200 g | 9,44 €/kg')
    expect(similarsModal).toHaveTextContent('1 alternative available')
    expect(similarsModal).toHaveTextContent('Fabada Hacendado')
    expect(similarsModal).not.toHaveTextContent(
      'Choose one or more alternatives to replace the unavailable product',
    )
    expect(similarsModal).not.toHaveTextContent('OK')
    expect(similarsModal).not.toHaveTextContent('Cancel')
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'start_substitution_click',
      {
        product_id: '3317',
        cart_id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        source: 'my_regulars',
      },
    )
  })

  it('should be able to close the similar products dialog', async () => {
    const responses = [
      {
        path: '/customers/1/recommendations/myregulars/',
        responseBody: recommendationsWithUnpublished,
      },
      { path: '/products/3317/similars/', responseBody: similars },
    ]
    wrap(App).atPath('/my-products').withNetwork(responses).withLogin().mount()

    await screen.findByRole('heading', { name: 'My Essentials' })
    viewSimilarProducts('Uva blanca con semillas')
    const similarsModal = await screen.findByRole('dialog')
    closeSimilarProductsDialog()

    expect(similarsModal).not.toBeInTheDocument()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'finish_substitution_click',
      {
        product_id: '3317',
        cart_id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        source: 'my_regulars',
        choices: ['26107'],
      },
    )
  })

  it('should display the no similar results alert', async () => {
    const responses = [
      {
        path: '/customers/1/recommendations/myregulars/',
        responseBody: recommendationsWithUnpublished,
      },
      { path: '/products/3317/similars/', responseBody: noSimilars },
    ]
    wrap(App).atPath('/my-products').withNetwork(responses).withLogin().mount()

    await screen.findByRole('heading', { name: 'My Essentials' })
    viewSimilarProducts('Uva blanca con semillas')
    const alert = await screen.findByRole('dialog')

    expect(alert).toHaveTextContent('There are no similar products')
    expect(alert).toHaveTextContent(
      'Sorry, we have not found alternatives for this product.',
    )
    expect(alert).toHaveTextContent('OK')
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'start_substitution_click',
      {
        product_id: '3317',
        cart_id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        source: 'my_regulars',
      },
    )
  })

  it('should be able to close the no similar results alert', async () => {
    const responses = [
      {
        path: '/customers/1/recommendations/myregulars/',
        responseBody: recommendationsWithUnpublished,
      },
      {
        path: '/products/3317/similars/',
        responseBody: noSimilars,
      },
    ]
    wrap(App).atPath('/my-products').withNetwork(responses).withLogin().mount()

    await screen.findByRole('heading', { name: 'My Essentials' })
    viewSimilarProducts('Uva blanca con semillas')
    const alert = await screen.findByRole('dialog')
    closeNoSimilarProductsAlert()

    expect(alert).not.toBeInTheDocument()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'finish_substitution_click',
      {
        product_id: '3317',
        cart_id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        source: 'my_regulars',
      },
    )
  })

  it('should be able see an alternative product detail', async () => {
    const responses = [
      {
        path: '/customers/1/recommendations/myregulars/',
        responseBody: recommendationsWithUnpublished,
      },
      { path: '/products/3317/similars/', responseBody: similars },
      { path: '/products/26107/', responseBody: similarProductDetail },
      {
        path: '/products/26107/xselling',
        responseBody: productWithoutXSelling,
      },
    ]
    wrap(App).atPath('/my-products').withNetwork(responses).withLogin().mount()

    await screen.findByRole('heading', { name: 'My Essentials' })
    viewSimilarProducts('Uva blanca con semillas')
    await screen.findByRole('dialog')
    await openProductDetail('Fabada Hacendado')
    const productDetail = await screen.findByRole('dialog')

    expect(productDetail).toHaveTextContent('Back to alternatives')
    expect(productDetail).toHaveTextContent('Hacendado fabada')
    expect(productDetail).toHaveTextContent('Add to cart')
  })

  it('should be able to go back to the alternatives list from the alternative product detail', async () => {
    const responses = [
      {
        path: '/customers/1/recommendations/myregulars/',
        responseBody: recommendationsWithUnpublished,
      },
      { path: '/products/3317/similars/', responseBody: similars },
      { path: '/products/26107/', responseBody: similarProductDetail },
      {
        path: '/products/26107/xselling',
        responseBody: productWithoutXSelling,
      },
    ]
    wrap(App).atPath('/my-products').withNetwork(responses).withLogin().mount()

    await screen.findByRole('heading', { name: 'My Essentials' })
    viewSimilarProducts('Uva blanca con semillas')
    await screen.findByRole('dialog')
    await openProductDetail('Fabada Hacendado')
    await screen.findByRole('dialog')
    goBackToAlternatives()
    const similarsModal = await screen.findByRole('dialog')

    expect(similarsModal).not.toHaveTextContent('Back to alternatives')
    expect(similarsModal).toHaveTextContent('Product not available')
    expect(similarsModal).toHaveTextContent('1 alternative')
  })

  it('should load the similar products for the user session warehouse', async () => {
    wrap(App)
      .atPath('/my-products/')
      .withNetwork([
        {
          path: '/customers/1/recommendations/myregulars/',
          responseBody: recommendationsWithUnpublished,
        },
        { path: '/products/3317/similars/', responseBody: similars },
      ])
      .withLogin()
      .mount()

    await screen.findByRole('heading', { name: 'My Essentials' })
    viewSimilarProducts('Uva blanca con semillas')
    await screen.findByRole('dialog')

    expect(global.fetch).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringContaining(
          '/products/3317/similars/?lang=en&wh=vlc1&exclude=',
        ),
        method: 'GET',
      }),
    )
  })

  it('should load the similar products detail for the user session warehouse', async () => {
    const responses = [
      {
        path: '/customers/1/recommendations/myregulars/',
        responseBody: recommendationsWithUnpublished,
      },
      { path: '/products/3317/similars/', responseBody: similars },
      { path: '/products/26107/', responseBody: similarProductDetail },
      {
        path: '/products/26107/xselling',
        responseBody: productWithoutXSelling,
      },
    ]
    wrap(App).atPath('/my-products').withNetwork(responses).withLogin().mount()

    await screen.findByRole('heading', { name: 'My Essentials' })
    viewSimilarProducts('Uva blanca con semillas')
    await screen.findByRole('dialog')
    await openProductDetail('Fabada Hacendado')
    await screen.findByRole('dialog')

    expect(global.fetch).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringContaining('/products/26107/?lang=en&wh=vlc1'),
        method: 'GET',
      }),
    )
  })

  it('should display the right styles for similar products modal when FF is enabled', async () => {
    const responses = [
      {
        path: '/customers/1/recommendations/myregulars/',
        responseBody: recommendationsWithUnpublished,
      },
      { path: '/products/3317/similars/', responseBody: similars },
      { path: '/products/26107/', responseBody: similarProductDetail },
    ]
    wrap(App).atPath('/my-products').withNetwork(responses).withLogin().mount()

    await screen.findByRole('heading', { name: 'My Essentials' })
    viewSimilarProducts('Uva blanca con semillas')

    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText('1 alternative available')).toHaveClass(
      'product-similar__essentials-title',
    )
    expect(within(dialog).getByTestId('similar-products-list')).toHaveClass(
      'product-similar__alternatives',
    )
  })
})
