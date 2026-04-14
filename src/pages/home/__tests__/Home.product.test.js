import { act, screen, waitFor, within } from '@testing-library/react'

import {
  addProductToCart,
  closeProductModal,
  decreaseProductInCart,
  getProductByDisplayName,
  getProductCellByDisplayName,
  increaseProductInCart,
  openCart,
  openProductDetail,
  openProductDetailSimplified,
  removeProductFromCart,
  selectSecondImage,
  simulateBackNavigation,
} from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { cart, emptyLocalCart } from 'app/cart/__scenarios__/cart'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
import {
  productBase,
  productBaseDetail,
  productWithoutXSelling,
  productXSelling,
} from 'app/catalog/__scenarios__/product'
import { Storage } from 'services/storage'
import { Tracker } from 'services/tracker'
import { cloneDeep } from 'utils/objects'

const today = new Date().toISOString().split('T')[0]
const metrics = {
  amount: 0,
  cart_id: '10000000-1000-4000-8000-100000000000',
  display_name: 'Fideos orientales Yakisoba sabor pollo Hacendado',
  id: '8731',
  merca_code: '8731',
  layout: 'grid',
  price: '0,85',
  requires_age_check: false,
  selling_method: 'units',
  source: 'new_arrivals',
  cart_mode: 'purchase',
}

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Home - Product', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    vi.clearAllMocks()
    Storage.clear()
    localStorage.clear()
  })

  it('should show the product detail in modal', async () => {
    Storage.setItem('cart', emptyLocalCart)
    const responses = [
      { path: '/home/', responseBody: homeWithGrid },
      {
        path: '/products/8731/?lang=es&wh=vlc1',
        responseBody: { ...productBaseDetail },
      },
      {
        path: '/products/8731/xselling/',
        responseBody: productXSelling,
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).mount()

    await screen.findByText('Fideos orientales Yakisoba sabor pollo Hacendado')
    const productToSeeDetail = getProductCellByDisplayName(
      'Fideos orientales Yakisoba sabor pollo Hacendado',
    )
    openProductDetail(
      productToSeeDetail,
      'Fideos orientales Yakisoba sabor pollo Hacendado',
    )
    const productDetail = await screen.findByRole('dialog')

    expect(productDetail).toHaveTextContent(
      'Descripción Fideos orientales Yakisoba sabor pollo',
    )
    expect(productDetail).toHaveTextContent('Arroz, legumbres y pasta')
    expect(Tracker.sendViewChange).toHaveBeenCalledWith('product_detail', {
      product_id: '8731',
      display_name: 'Fideos orientales Yakisoba sabor pollo Hacendado',
      source: 'new_arrivals',
    })
  })

  it('should select the first image by default', async () => {
    Storage.setItem('cart', emptyLocalCart)
    const responses = [
      { path: '/home/', responseBody: homeWithGrid },
      {
        path: '/products/8731/?lang=es&wh=vlc1',
        responseBody: { ...productBaseDetail },
      },
      {
        path: '/products/8731/xselling/',
        responseBody: productXSelling,
      },
      {
        path: '/products/3119/?lang=es&wh=vlc1',
        responseBody: {
          ...productBaseDetail,
          id: '3119',
          display_name: 'Pera conferencia',
        },
      },
      {
        path: '/products/3119/xselling/',
        responseBody: productWithoutXSelling,
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).mount()

    await screen.findByText('Fideos orientales Yakisoba sabor pollo Hacendado')
    const productToSeeDetail = getProductCellByDisplayName(
      'Fideos orientales Yakisoba sabor pollo Hacendado',
    )
    openProductDetail(
      productToSeeDetail,
      'Fideos orientales Yakisoba sabor pollo Hacendado',
    )

    const productDetail = await screen.findByRole('dialog')

    selectSecondImage('Fideos orientales Yakisoba sabor pollo Hacendado')

    const newProductToSeeDetail = getProductByDisplayName(
      productDetail,
      'Pera conferencia',
    )
    openProductDetail(newProductToSeeDetail, 'Pera conferencia')

    await screen.findByRole('dialog')

    const [firstThumbnailImage, secondThumbnailImage] =
      screen.getAllByLabelText(
        'Thumbnail image of the product Pera conferencia',
      )
    expect(firstThumbnailImage).toHaveClass(
      'product-gallery__thumbnail--selected',
    )
    expect(secondThumbnailImage).not.toHaveClass(
      'product-gallery__thumbnail--selected',
    )
  })

  it('should be able to add product to the cart', async () => {
    Storage.setItem('cart', emptyLocalCart)
    const responses = [{ path: '/home/', responseBody: homeWithGrid }]
    wrap(App).atPath('/').withNetwork(responses).mount()

    await screen.findByText('Fideos orientales Yakisoba sabor pollo Hacendado')
    const productToAdd = getProductCellByDisplayName(
      'Fideos orientales Yakisoba sabor pollo Hacendado',
    )
    addProductToCart(productToAdd)
    const [productCellQuantity] = await screen.findAllByText('1 unit')

    expect(productCellQuantity).toBeInTheDocument()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith('add_product_click', {
      ...metrics,
      order: 0,
      first_product_added_at: expect.stringContaining(today),
      first_product: true,
      added_amount: 1,
    })
  })

  it('should be able to increase product to the cart', async () => {
    Storage.setItem('cart', emptyLocalCart)
    const responses = [
      { path: '/home/', responseBody: homeWithGrid },
      {
        path: '/carts/',
        method: 'post',
        requestBody: {
          id: '10000000-1000-4000-8000-100000000000',
          lines: [{ quantity: 1, product_id: '8731', sources: ['+NA'] }],
        },
        responseBody: { ...cart },
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).mount()

    await screen.findByText('Fideos orientales Yakisoba sabor pollo Hacendado')
    const productToAdd = getProductCellByDisplayName(
      'Fideos orientales Yakisoba sabor pollo Hacendado',
    )
    addProductToCart(productToAdd)
    openCart()
    const cartSidebar = await screen.findByTestId('cart')
    increaseProductInCart(cartSidebar)
    const [productCellQuantity] = await screen.findAllByText('3 units')

    expect(productCellQuantity).toBeInTheDocument()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith('add_product_click', {
      ...metrics,
      cart_id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
      layout: 'list',
      order: 0,
      amount: 2,
      source: 'cart',
      first_product: false,
      added_amount: 1,
    })
    expect('/carts/').toHaveBeenFetchedWith({
      method: 'POST',
      body: {
        id: '10000000-1000-4000-8000-100000000000',
        lines: [{ quantity: 1, product_id: '8731', sources: ['+NA'] }],
      },
    })
  })

  it('should be able to decrease product to the cart', async () => {
    Storage.setItem('cart', emptyLocalCart)
    const responses = [{ path: '/home/', responseBody: homeWithGrid }]
    wrap(App).atPath('/').withNetwork(responses).mount()

    await screen.findByText('Fideos orientales Yakisoba sabor pollo Hacendado')
    const productToAdd = getProductCellByDisplayName(
      'Fideos orientales Yakisoba sabor pollo Hacendado',
    )
    addProductToCart(productToAdd)
    increaseProductInCart(productToAdd)
    decreaseProductInCart(productToAdd)
    const [productCellQuantity] = await screen.findAllByText('1 unit')

    expect(productCellQuantity).toBeInTheDocument()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'decrease_product_click',
      {
        ...metrics,
        amount: 2,
        decreased_amount: 1,
      },
    )
  })

  it('should be able to remove a product to the cart', async () => {
    Storage.setItem('cart', emptyLocalCart)
    const responses = [{ path: '/home/', responseBody: homeWithGrid }]
    wrap(App).atPath('/').withNetwork(responses).mount()

    await screen.findByText('Fideos orientales Yakisoba sabor pollo Hacendado')
    const productToAdd = getProductCellByDisplayName(
      'Fideos orientales Yakisoba sabor pollo Hacendado',
    )
    addProductToCart(productToAdd)
    removeProductFromCart(productToAdd)
    const [productCellQuantity] = await screen.findAllByText('0 unit')

    expect(productCellQuantity).toBeInTheDocument()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'decrease_product_click',
      {
        ...metrics,
        amount: 1,
        decreased_amount: 1,
      },
    )
  })

  it('should be able to add a bulk product to the cart', async () => {
    Storage.setItem('cart', emptyLocalCart)
    const responses = [{ path: '/home/', responseBody: homeWithGrid }]
    wrap(App).atPath('/').withNetwork(responses).mount()

    await screen.findByText('Uva blanca con semillas')
    const productToAdd = getProductCellByDisplayName('Uva blanca con semillas')
    addProductToCart(productToAdd)
    const [productCellQuantity] = await screen.findAllByText('200 g')

    expect(productCellQuantity).toBeInTheDocument()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith('add_product_click', {
      ...metrics,
      id: '3317',
      merca_code: '3317',
      display_name: 'Uva blanca con semillas',
      price: '1,89',
      selling_method: 'bunch',
      order: 1,
      first_product_added_at: expect.stringContaining(today),
      first_product: true,
      added_amount: 1,
    })
  })

  it('should be able to increase a bulk product to the cart', async () => {
    Storage.setItem('cart', emptyLocalCart)
    const responses = [{ path: '/home/', responseBody: homeWithGrid }]
    wrap(App).atPath('/').withNetwork(responses).mount()

    await screen.findByText('Uva blanca con semillas')
    const productToAdd = getProductCellByDisplayName('Uva blanca con semillas')
    addProductToCart(productToAdd)
    increaseProductInCart(productToAdd)
    const [productCellQuantity] = await screen.findAllByText('300 g')

    expect(productCellQuantity).toBeInTheDocument()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith('add_product_click', {
      ...metrics,
      id: '3317',
      merca_code: '3317',
      display_name: 'Uva blanca con semillas',
      price: '1,89',
      selling_method: 'bunch',
      order: 1,
      amount: 0.2,
      first_product: false,
      added_amount: 1,
    })
  })

  it('should be able to decrease a bulk product to the cart', async () => {
    Storage.setItem('cart', emptyLocalCart)
    const responses = [{ path: '/home/', responseBody: homeWithGrid }]
    wrap(App).atPath('/').withNetwork(responses).mount()

    await screen.findByText('Uva blanca con semillas')
    const productToAdd = getProductCellByDisplayName('Uva blanca con semillas')
    addProductToCart(productToAdd)
    increaseProductInCart(productToAdd)
    decreaseProductInCart(productToAdd)

    const [productCellQuantity] = await screen.findAllByText('200 g')

    expect(productCellQuantity).toBeInTheDocument()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'decrease_product_click',
      {
        ...metrics,
        id: '3317',
        merca_code: '3317',
        display_name: 'Uva blanca con semillas',
        price: '1,89',
        selling_method: 'bunch',
        amount: 0.3,
        decreased_amount: 1,
      },
    )
  })

  it('should be able to add a product to the cart from the product modal', async () => {
    Storage.setItem('cart', emptyLocalCart)
    const responses = [
      { path: '/home/', responseBody: homeWithGrid },
      {
        path: '/products/8731/?lang=es&wh=vlc1',
        responseBody: { ...productBaseDetail },
      },
      {
        path: '/products/8731/xselling/',
        responseBody: productWithoutXSelling,
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).mount()

    await screen.findByText('Fideos orientales Yakisoba sabor pollo Hacendado')
    const productToAdd = getProductCellByDisplayName(
      'Fideos orientales Yakisoba sabor pollo Hacendado',
    )
    await openProductDetail(
      productToAdd,
      'Fideos orientales Yakisoba sabor pollo Hacendado',
    )
    const productDetail = await screen.findByRole('dialog')
    addProductToCart(productDetail)
    await screen.findAllByText('1 unit')

    expect(productDetail).toHaveTextContent('1 unit')
    expect(Tracker.sendInteraction).toHaveBeenCalledWith('add_product_click', {
      ...metrics,
      layout: 'product_detail',
      first_product_added_at: expect.stringContaining(today),
      first_product: true,
      added_amount: 1,
    })
  })

  it('should be able to add a product to the cart from the xselling', async () => {
    Storage.setItem('cart', emptyLocalCart)
    const responses = [
      { path: '/home/', responseBody: homeWithGrid },
      {
        path: '/products/8731/?lang=es&wh=vlc1',
        responseBody: { ...productBaseDetail },
      },
      {
        path: '/products/8731/xselling/',
        responseBody: productXSelling,
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).mount()

    await screen.findByText('Fideos orientales Yakisoba sabor pollo Hacendado')
    const productToSeeDetail = getProductCellByDisplayName(
      'Fideos orientales Yakisoba sabor pollo Hacendado',
    )
    await openProductDetail(
      productToSeeDetail,
      'Fideos orientales Yakisoba sabor pollo Hacendado',
    )
    const productDetail = await screen.findByRole('dialog')
    const productToAdd = getProductByDisplayName(
      productDetail,
      'Pera conferencia',
    )
    addProductToCart(productToAdd)
    await screen.findAllByText('1 unit')

    expect(productDetail).toHaveTextContent('1 unit')
    expect(Tracker.sendInteraction).toHaveBeenCalledWith('add_product_click', {
      ...metrics,
      id: '3119',
      merca_code: '3119',
      display_name: 'Pera conferencia',
      layout: 'carousel',
      source: 'xselling',
      order: 0,
      price: '0,30',
      first_product_added_at: expect.stringContaining(today),
      first_product: true,
      added_amount: 1,
    })
  })

  it('should not throw an error if decrease the product quantity under zero', async () => {
    Storage.setItem('cart', emptyLocalCart)
    const responses = [{ path: '/home/', responseBody: homeWithGrid }]
    wrap(App).atPath('/').withNetwork(responses).mount()

    await screen.findByText('Fideos orientales Yakisoba sabor pollo Hacendado')
    const productToAdd = getProductCellByDisplayName(
      'Fideos orientales Yakisoba sabor pollo Hacendado',
    )
    addProductToCart(productToAdd)
    await screen.findAllByText('1 unit')

    expect(async () => {
      removeProductFromCart(productToAdd)
      await waitFor(() => {
        decreaseProductInCart(productToAdd)
      })
    }).not.toThrow()
  })

  it('should load the product detail for the user session warehouse', async () => {
    const responses = [
      { path: '/home/', responseBody: homeWithGrid },
      {
        path: '/products/8731/',
        responseBody: { ...productBaseDetail },
      },
      {
        path: '/products/8731/xselling/',
        responseBody: productXSelling,
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).mount()

    await screen.findByText('Fideos orientales Yakisoba sabor pollo Hacendado')
    const productCell = getProductCellByDisplayName(
      'Fideos orientales Yakisoba sabor pollo Hacendado',
    )
    await openProductDetail(
      productCell,
      'Fideos orientales Yakisoba sabor pollo Hacendado',
    )
    await screen.findByText('Related products')

    expect(global.fetch).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringContaining('/products/8731/?lang=en&wh=vlc1'),
        method: 'GET',
      }),
    )
    expect(global.fetch).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringContaining(
          '/products/8731/xselling/?lang=en&wh=vlc1&exclude=',
        ),
        method: 'GET',
      }),
    )
  })

  it('should not show the close button before the product information', async () => {
    Storage.setItem('cart', emptyLocalCart)
    const responses = [
      { path: '/home/', responseBody: homeWithGrid },
      {
        path: '/products/8731/?lang=es&wh=vlc1',
        responseBody: { ...productBaseDetail, delay: 2000 },
      },
      {
        path: '/products/8731/xselling/',
        responseBody: productXSelling,
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).mount()

    await screen.findByText('Fideos orientales Yakisoba sabor pollo Hacendado')
    const productToSeeDetail = getProductCellByDisplayName(
      'Fideos orientales Yakisoba sabor pollo Hacendado',
    )
    openProductDetail(
      productToSeeDetail,
      'Fideos orientales Yakisoba sabor pollo Hacendado',
    )

    expect(
      screen.queryByRole('button', { name: 'Close product detail dialog' }),
    ).not.toBeInTheDocument()

    await act(async () => {
      await screen.findByText('Arroz, legumbres y pasta >')
      expect(
        screen.getByRole('button', { name: 'Close product detail dialog' }),
      ).toBeInTheDocument()
    })
  })

  it('should hide the close button modal when we go back on the navigator', async () => {
    Storage.setItem('cart', emptyLocalCart)
    const responses = [
      { path: '/home/', responseBody: homeWithGrid },
      {
        path: '/products/8731/?lang=es&wh=vlc1',
        responseBody: { ...productBaseDetail, delay: 2000 },
      },
      {
        path: '/products/8731/xselling/',
        responseBody: productXSelling,
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).mount()

    const productToSeeDetail = await screen.findByText(
      'Fideos orientales Yakisoba sabor pollo Hacendado',
    )
    openProductDetailSimplified(productToSeeDetail)

    await act(async () => {
      await screen.findByText('Arroz, legumbres y pasta >')
      simulateBackNavigation()
      await screen.findByText(
        'Fideos orientales Yakisoba sabor pollo Hacendado',
      )
      openProductDetailSimplified(productToSeeDetail)
      await screen.findByText('Arroz, legumbres y pasta >')

      expect(
        screen.queryByRole('button', { name: 'Close product detail dialog' }),
      ).not.toBeInTheDocument()
      expect(
        await screen.findByRole('button', {
          name: 'Close product detail dialog',
        }),
      ).toBeInTheDocument()
    })
  })

  it('should hide the close button modal when click on the close button modal', async () => {
    Storage.setItem('cart', emptyLocalCart)
    const responses = [
      { path: '/home/', responseBody: homeWithGrid },
      {
        path: '/products/8731/?lang=es&wh=vlc1',
        responseBody: { ...productBaseDetail, delay: 2000 },
      },
      {
        path: '/products/8731/xselling/',
        responseBody: productXSelling,
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).mount()

    const productToSeeDetail = await screen.findByText(
      'Fideos orientales Yakisoba sabor pollo Hacendado',
    )
    openProductDetailSimplified(productToSeeDetail)

    await act(async () => {
      await screen.findByText('Arroz, legumbres y pasta >')
      closeProductModal()
      await screen.findByText(
        'Fideos orientales Yakisoba sabor pollo Hacendado',
      )
      openProductDetailSimplified(productToSeeDetail)
      await screen.findByText('Arroz, legumbres y pasta >')

      expect(
        screen.queryByRole('button', { name: 'Close product detail dialog' }),
      ).not.toBeInTheDocument()
      expect(
        await screen.findByRole('button', {
          name: 'Close product detail dialog',
        }),
      ).toBeInTheDocument()
    })
  })

  it('should NOT show new arrival text for products in home', async () => {
    const productClone = cloneDeep(productBase)
    productClone.is_new_arrival = true

    const responses = [
      {
        path: '/home/',
        responseBody: {
          sections: [
            {
              layout: 'unknown_layout',
              content: {},
            },
            {
              layout: 'grid',
              content: {
                title: 'Novedades',
                subtitle: 'Productos recién añadidos o mejorados',
                api_path: '/home/new_arrivals/',
                source: 'new_arrivals',
                source_code: 'NA',
                items: [{ ...productClone }],
              },
            },
          ],
        },
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).mount()

    const product = await screen.findByText(
      'Fideos orientales Yakisoba sabor pollo Hacendado',
    )
    expect(within(product).queryByText('NEW')).not.toBeInTheDocument()
  })
})
