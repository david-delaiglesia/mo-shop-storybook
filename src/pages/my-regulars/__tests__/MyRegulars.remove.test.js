import { screen, within } from '@testing-library/react'

import {
  closeRemoveProductModal,
  confirmRemoveProduct,
  openProductDetail,
  removeProduct,
} from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import {
  categories,
  categoryDetail,
} from 'app/catalog/__scenarios__/categories'
import {
  productBaseDetail,
  productXSelling,
} from 'app/catalog/__scenarios__/product'
import {
  recommendations,
  recommendationsWithUnpublished,
} from 'app/catalog/__scenarios__/recommendations'
import { similarResults } from 'app/catalog/__tests__/similar.mock'
import { orderCart } from 'app/order/__scenarios__/orderCart'
import { mockedOrder } from 'app/order/__tests__/order.mock'
import { viewSimilarProducts } from 'pages/helpers'
import { openMyRegulars } from 'pages/order-products/__tests__/helpers'
import { navigateToShoppingLists } from 'pages/shopping-lists/__tests__/helpers.js'
import { shoppingLists } from 'pages/shopping-lists/__tests__/scenarios'
import { Cookie } from 'services/cookie'
import { Storage } from 'services/storage'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('My Regulars - Remove products', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  delete global.window.location
  global.window.location = { pathname: '/my-products' }

  beforeEach(() => {
    Cookie.get = vi.fn(() => ({ language: 'en', postalCode: '46010' }))
  })

  afterEach(() => {
    vi.clearAllMocks()
    Storage.clear()
    localStorage.clear()
  })

  it('should inform to the user the first time that the user delete a recommended product', async () => {
    const responses = {
      path: '/customers/1/recommendations/myregulars/',
      responseBody: recommendations,
    }
    wrap(App).atPath('/my-products').withNetwork(responses).withLogin().mount()

    await screen.findByText('Fideos orientales Yakisoba sabor pollo Hacendado')
    removeProduct('Fideos orientales Yakisoba sabor pollo Hacendado')

    const alert = screen.getByRole('dialog', {
      name: "Don't show in My Essentials. If you remove an essential product it will disappear from the list until you buy it again.",
    })
    expect(alert).toBeInTheDocument()
    expect(alert).toHaveTextContent("Don't show in My Essentials")
    expect(alert).toHaveTextContent(
      'If you remove an essential product it will disappear from the list until you buy it again.',
    )
    expect(alert).toHaveTextContent('Remove product')
  })

  it('should close the alert', async () => {
    const responses = {
      path: '/customers/1/recommendations/myregulars/',
      responseBody: recommendations,
    }
    wrap(App).atPath('/my-products').withNetwork(responses).withLogin().mount()

    await screen.findByText('Fideos orientales Yakisoba sabor pollo Hacendado')
    removeProduct('Fideos orientales Yakisoba sabor pollo Hacendado')
    const alert = screen.getByRole('dialog', {
      name: "Don't show in My Essentials. If you remove an essential product it will disappear from the list until you buy it again.",
    })
    closeRemoveProductModal()

    expect(alert).not.toBeInTheDocument()
  })

  it('should remove a product from my regulars', async () => {
    const responses = [
      {
        path: '/customers/1/recommendations/myregulars/',
        multipleResponses: [
          { responseBody: recommendations },
          { responseBody: [] },
        ],
      },
      {
        path: '/customers/1/recommendations/myregulars/products/8731/',
        method: 'delete',
      },
    ]
    wrap(App).atPath('/my-products').withNetwork(responses).withLogin().mount()

    await screen.findByText('Fideos orientales Yakisoba sabor pollo Hacendado')
    removeProduct('Fideos orientales Yakisoba sabor pollo Hacendado')
    const alert = screen.getByRole('dialog', {
      name: "Don't show in My Essentials. If you remove an essential product it will disappear from the list until you buy it again.",
    })
    confirmRemoveProduct()
    await screen.findByText('Make your first order to see your essentials')

    expect(alert).not.toBeInTheDocument()
    expect(
      screen.queryByText('Fideos orientales Yakisoba sabor pollo Hacendado'),
    ).not.toBeInTheDocument()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'remove_from_my_regulars',
      {
        source: 'my_regulars_precision',
        display_name: 'Fideos orientales Yakisoba sabor pollo Hacendado',
        id: '8731',
      },
    )
  })

  it('should remove a product directly the second time the user removes a product', async () => {
    const responses = [
      {
        path: '/customers/1/recommendations/myregulars/',
        multipleResponses: [
          { responseBody: recommendations },
          { responseBody: recommendations },
          { responseBody: [] },
        ],
      },
      {
        path: '/customers/1/recommendations/myregulars/products/8731/',
        method: 'delete',
      },
      {
        path: '/customers/1/recommendations/myregulars/products/66895/',
        method: 'delete',
      },
    ]
    wrap(App).atPath('/my-products').withNetwork(responses).withLogin().mount()

    await screen.findByText('Fideos orientales Yakisoba sabor pollo Hacendado')
    removeProduct('Fideos orientales Yakisoba sabor pollo Hacendado')
    confirmRemoveProduct()
    await screen.findByText(
      'Cerveza IPA aromática & amarga Especialidades 1897',
    )
    removeProduct('Cerveza IPA aromática & amarga Especialidades 1897')
    const noResultsTitle = await screen.findByText(
      'Make your first order to see your essentials',
    )

    expect(noResultsTitle).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(
      screen.queryByText('Cerveza IPA aromática & amarga Especialidades 1897'),
    ).not.toBeInTheDocument()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'remove_from_my_regulars',
      {
        source: 'my_regulars_precision',
        display_name: 'Cerveza IPA aromática & amarga Especialidades 1897',
        id: '66895',
      },
    )
  })

  it('should remove an unpublished product', async () => {
    Storage.setItem('my_regulars', { productRemoved: true })
    const responses = [
      {
        path: '/customers/1/recommendations/myregulars/',
        multipleResponses: [
          { responseBody: recommendationsWithUnpublished },
          { responseBody: [] },
        ],
      },
      {
        path: '/customers/1/recommendations/myregulars/products/3317/',
        method: 'delete',
      },
    ]
    wrap(App).atPath('/my-products').withNetwork(responses).withLogin().mount()

    await screen.findByText('Uva blanca con semillas')
    removeProduct('Uva blanca con semillas')
    await screen.findByText('Make your first order to see your essentials')

    expect(
      screen.queryByText('Uva blanca con semillas'),
    ).not.toBeInTheDocument()
  })

  it('should not be able to remove an unpublished product from edit order', async () => {
    global.window.location = { pathname: '/orders/1234/edit/products' }
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1440)
    const responses = [
      { path: '/customers/1/orders/1234/', responseBody: mockedOrder },
      { path: '/customers/1/orders/1234/cart/', responseBody: orderCart },
      { path: '/categories/', responseBody: categories },
      {
        path: '/categories/112/',
        responseBody: categoryDetail,
      },
      {
        path: '/customers/1/recommendations/myregulars/',
        responseBody: recommendationsWithUnpublished,
      },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ]
    wrap(App)
      .atPath('/orders/1234/edit/products')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Aceite, especias y salsas')
    navigateToShoppingLists()
    await screen.findByText('My second list')
    openMyRegulars()
    await screen.findByRole('heading', { name: 'My Essentials' })

    expect(screen.queryByLabelText('Remove product')).not.toBeInTheDocument()
  })

  it('should not be able to remove a recommended product from unpublished product', async () => {
    const responses = [
      {
        path: '/customers/1/recommendations/myregulars/',
        responseBody: recommendationsWithUnpublished,
      },
      { path: '/products/3317/similars/', responseBody: similarResults },
    ]
    wrap(App).atPath('/my-products').withNetwork(responses).withLogin().mount()

    await screen.findByText('Uva blanca con semillas')
    viewSimilarProducts('Uva blanca con semillas')
    const similarModal = await screen.findByRole('dialog')
    const { queryByLabelText } = within(similarModal)

    expect(
      queryByLabelText(
        'Remove Ron dominicano añejo superior Brugal from my regulars products',
      ),
    ).not.toBeInTheDocument()
  })

  it('should not be able to remove a xselling product', async () => {
    const responses = [
      {
        path: '/customers/1/recommendations/myregulars/',
        responseBody: recommendations,
      },
      { path: '/products/8731/', responseBody: productBaseDetail },
      { path: '/products/8731/xselling/', responseBody: productXSelling },
    ]
    wrap(App).atPath('/my-products').withNetwork(responses).withLogin().mount()

    await screen.findByText('Fideos orientales Yakisoba sabor pollo Hacendado')
    global.window.location = {
      pathname:
        '/product/3317/fideos-orientales-yakisoba-sabor-pollo-hacendado-paquete',
    }
    await openProductDetail('Fideos orientales Yakisoba sabor pollo Hacendado')
    const productDetail = await screen.findByRole('dialog')
    const { queryByLabelText } = within(productDetail)

    expect(
      queryByLabelText('Remove Pera conferencia from my regular products'),
    ).not.toBeInTheDocument()
  })
})
