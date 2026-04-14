import { screen, within } from '@testing-library/react'

import { activeVariant } from '../../../__tests__/helpers'
import {
  addAlternativeProduct,
  addProductToCart,
  closeModalByText,
  closeWaterLimitAlert,
  confirmToAddAlternativeProducts,
  decreaseAlternativeProduct,
  decreaseProductInCart,
  getProductByDisplayName,
  increaseProductInCart,
  removeProductFromCart,
} from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import {
  cartApiResponseWithUnpublished,
  cartWithWaterUnpublished,
  unPublishedProduct,
} from 'app/cart/__tests__/cart.mock'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
import {
  unpublishedWaterProductWith100Liters,
  waterProduct,
} from 'app/catalog/__scenarios__/product'
import {
  cartSubstituted,
  similarNoResults,
  similarResults,
} from 'app/catalog/__tests__/similar.mock'
import { openProductDetail, viewSimilarProductsFromCart } from 'pages/helpers'
import { Storage } from 'services/storage'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Home - Cart - Similar products of unpublished products', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  window.matchMedia = vi.fn().mockReturnValue({ matches: true })
  const { product: firstPublishedProductAtCart } =
    cartApiResponseWithUnpublished.lines[1]
  const { product: secondPublishedProductAtCart } =
    cartApiResponseWithUnpublished.lines[2]

  afterEach(() => {
    vi.resetAllMocks()
    Storage.clear()
    localStorage.clear()
  })

  it('should show no result for similar products alert', async () => {
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithGrid },
      {
        path: '/customers/1/cart/',
        responseBody: cartApiResponseWithUnpublished,
      },
      {
        path: `/products/${unPublishedProduct.id}/similars/?exclude=3317,28757,71502&lang=es&wh=vlc1`,
        responseBody: similarNoResults,
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Cart')
    Tracker.sendInteraction.mockClear()
    viewSimilarProductsFromCart(unPublishedProduct.display_name)
    const similarModal = await screen.findByRole('dialog')

    expect(similarModal).toHaveTextContent('There are no similar products')
    expect(similarModal).toHaveTextContent(
      'Sorry, we have not found alternatives for this product.',
    )
    expect(similarModal).toHaveTextContent('OK')
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'start_substitution_click',
      {
        product_id: unPublishedProduct.id,
        cart_id: '5529dc8b-0a94-4ae0-8145-de5197b542c6',
        source: 'cart',
      },
    )

    closeModalByText(similarModal, 'OK')
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'finish_substitution_click',
      {
        product_id: unPublishedProduct.id,
        cart_id: '5529dc8b-0a94-4ae0-8145-de5197b542c6',
        source: 'cart',
      },
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('should show the unpublished product', async () => {
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithGrid },
      {
        path: '/customers/1/cart/',
        responseBody: cartApiResponseWithUnpublished,
      },
      {
        path: `/products/${unPublishedProduct.id}/similars/?exclude=3317,28757,71502&lang=es&wh=vlc1`,
        responseBody: similarResults,
      },
    ]
    const choices = similarResults.results.map(({ id }) => id)
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Cart')
    Tracker.sendInteraction.mockClear()
    viewSimilarProductsFromCart(unPublishedProduct.display_name)
    const similarModal = await screen.findByRole('dialog')

    const expectedAltText = `Main product image ${unPublishedProduct.display_name}`
    const similarProductImage = screen.getByAltText(expectedAltText)
    expect(similarProductImage).toBeInTheDocument()
    expect(similarModal).toHaveTextContent('Product not available')
    expect(similarModal).toHaveTextContent(unPublishedProduct.display_name)
    expect(similarModal).toHaveTextContent('Paquete 1 kg')
    expect(similarModal).toHaveTextContent(
      'Choose one or more alternatives to replace the unavailable product',
    )
    expect(similarModal).toHaveTextContent('Confirm')
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'start_substitution_click',
      {
        product_id: unPublishedProduct.id,
        cart_id: '5529dc8b-0a94-4ae0-8145-de5197b542c6',
        source: 'cart',
      },
    )

    Tracker.sendInteraction.mockClear()
    closeModalByText(similarModal, 'Cancel')
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'finish_substitution_click',
      {
        choices,
        product_id: unPublishedProduct.id,
        cart_id: '5529dc8b-0a94-4ae0-8145-de5197b542c6',
        source: 'cart',
      },
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('should show the unpublished product alternatives', async () => {
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithGrid },
      {
        path: '/customers/1/cart/',
        responseBody: cartApiResponseWithUnpublished,
      },
      {
        path: `/products/${unPublishedProduct.id}/similars/?exclude=3317,28757,71502&lang=es&wh=vlc1`,
        responseBody: similarResults,
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Cart')
    viewSimilarProductsFromCart(unPublishedProduct.display_name)
    const similarModal = await screen.findByRole('dialog')
    const { getAllByText, getByAltText } = within(similarModal)

    expect(similarModal).toHaveTextContent('3 alternatives available')
    expect(similarModal).toHaveTextContent(
      similarResults.results[0].display_name,
    )
    expect(
      getByAltText(similarResults.results[0].display_name),
    ).toBeInTheDocument()
    expect(getAllByText('Add to cart')).toHaveLength(3)
    expect(similarModal).toHaveTextContent(
      similarResults.results[1].display_name,
    )
    expect(similarModal).toHaveTextContent(
      similarResults.results[2].display_name,
    )
    expect(similarModal).toHaveTextContent(
      'Choose one or more alternatives to replace the unavailable product',
    )
  })

  it('should increase and decrease alternative product', async () => {
    const today = new Date().toISOString().split('T')[0]
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithGrid },
      {
        path: '/customers/1/cart/',
        responseBody: cartApiResponseWithUnpublished,
      },
      {
        path: `/products/${unPublishedProduct.id}/similars/?exclude=3317,28757,71502&lang=es&wh=vlc1`,
        responseBody: similarResults,
      },
    ]
    const metrics = {
      amount: 0,
      cart_id: '5529dc8b-0a94-4ae0-8145-de5197b542c6',
      display_name: 'Ron dominicano añejo superior Brugal',
      id: '28745',
      merca_code: '28745',
      layout: 'grid',
      price: '13,65',
      requires_age_check: true,
      selling_method: 'units',
      source: 'similar_cart',
      cart_mode: 'purchase',
    }
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Cart')
    viewSimilarProductsFromCart(unPublishedProduct.display_name)
    const similarModal = await screen.findByRole('dialog')
    const alternativeProduct = getProductByDisplayName(
      similarModal,
      similarResults.results[0].display_name,
    )
    addProductToCart(alternativeProduct)
    expect(alternativeProduct).toHaveTextContent('In cart1')
    expect(Tracker.sendInteraction).toHaveBeenCalledWith('add_product_click', {
      ...metrics,
      first_product_added_at: expect.stringContaining(today),
      first_product: true,
      order: 0,
      amount: 0,
      added_amount: 1,
    })

    increaseProductInCart(alternativeProduct)
    expect(alternativeProduct).toHaveTextContent('In cart2')

    decreaseProductInCart(alternativeProduct)
    expect(alternativeProduct).toHaveTextContent('In cart1')
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'decrease_product_click',
      {
        ...metrics,
        amount: 2,
        decreased_amount: 1,
      },
    )

    removeProductFromCart(alternativeProduct)
    expect(alternativeProduct).toHaveTextContent('In cart0')
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'decrease_product_click',
      {
        ...metrics,
        amount: 1,
        decreased_amount: 1,
      },
    )
  })

  it('should see the added alternative products in the proper order in cart', async () => {
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithGrid },
      {
        path: '/customers/1/cart/',
        responseBody: cartApiResponseWithUnpublished,
      },
      {
        path: `/products/${unPublishedProduct.id}/similars/?exclude=3317,28757,71502&lang=es&wh=vlc1`,
        responseBody: similarResults,
      },
      {
        path: '/customers/1/cart/',
        method: 'put',
        requestBody: cartSubstituted,
        responseBody: {
          id: cartApiResponseWithUnpublished.id,
          version: 2,
          lines: [
            {
              product: similarResults.results[0],
              version: 1,
              quantity: 1,
              sources: [],
            },
            {
              product: firstPublishedProductAtCart,
              version: 1,
              quantity: 2,
              sources: [],
            },
            {
              product: secondPublishedProductAtCart,
              version: 1,
              quantity: 3,
              sources: [],
            },
          ],
        },
      },
    ]
    const alternativeProductName = similarResults.results[0].display_name
    const choices = similarResults.results.map(({ id }) => id)
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Cart')
    viewSimilarProductsFromCart(unPublishedProduct.display_name)
    await screen.findByRole('dialog')
    addAlternativeProduct(alternativeProductName)
    addAlternativeProduct(alternativeProductName)
    decreaseAlternativeProduct(alternativeProductName)
    Tracker.sendInteraction.mockClear()
    confirmToAddAlternativeProducts()
    await screen.findByText('Cart')

    expect(screen.getByRole('dialog')).toHaveTextContent(
      'Correctly replaced product',
    )
    closeModalByText(screen.getByRole('dialog'), 'OK')

    const cartProducts = screen.getAllByTestId('cart-product-cell')
    const unpublishedProduct = screen.queryByText(
      unPublishedProduct.display_name,
    )
    const alternativeProductSelected = cartProducts.find((orderCell) =>
      orderCell.textContent.includes(alternativeProductName),
    )
    const [firstProduct] = cartProducts.map((product) => product.textContent)

    expect(firstProduct).toContain(alternativeProductName)
    expect(alternativeProductSelected).toBeInTheDocument()
    expect(unpublishedProduct).not.toBeInTheDocument()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'finish_substitution_click',
      {
        choices,
        product_id: unPublishedProduct.id,
        cart_id: '5529dc8b-0a94-4ae0-8145-de5197b542c6',
        converted: [similarResults.results[0].id],
        source: 'cart',
      },
    )
  })

  it('should be able to add product from product detail', async () => {
    const productToCheck = similarResults.results[0]
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithGrid },
      {
        path: '/customers/1/cart/',
        responseBody: cartApiResponseWithUnpublished,
      },
      {
        path: `/products/${unPublishedProduct.id}/similars/?exclude=3317,28757,71502&lang=es&wh=vlc1`,
        responseBody: similarResults,
      },
      {
        path: `/products/${productToCheck.id}/`,
        responseBody: { ...waterProduct, ...productToCheck },
      },
    ]
    const alternativeProductName = productToCheck.display_name
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Cart')
    await viewSimilarProductsFromCart(unPublishedProduct.display_name)
    await screen.findByRole('dialog')
    await openProductDetail(alternativeProductName)

    const productSimilarDetail = await screen.findByTestId(
      'product-similar-detail',
    )
    addProductToCart(productSimilarDetail)
    closeModalByText(productSimilarDetail, 'Back to alternatives')
    const alternativeProductUpdated = getProductByDisplayName(
      screen.getByRole('dialog'),
      alternativeProductName,
    )

    expect(
      screen.queryByTestId('product-similar-detail'),
    ).not.toBeInTheDocument()
    expect(alternativeProductUpdated).toHaveTextContent('In cart1')
  })

  it('should not confirm without product selected', async () => {
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithGrid },
      {
        path: '/customers/1/cart/',
        responseBody: cartApiResponseWithUnpublished,
      },
      {
        path: `/products/${unPublishedProduct.id}/similars/?exclude=3317,28757,71502&lang=es&wh=vlc1`,
        responseBody: similarResults,
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Cart')
    viewSimilarProductsFromCart(unPublishedProduct.display_name)
    const similarModal = await screen.findByRole('dialog')

    Tracker.sendInteraction.mockClear()
    closeModalByText(similarModal, 'Confirm')

    expect(similarModal).toHaveTextContent('3 alternatives available')
    expect(Tracker.sendInteraction).not.toHaveBeenCalled()
  })

  it('should show the product limit alert', async () => {
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithGrid },
      {
        path: '/customers/1/cart/',
        responseBody: cartApiResponseWithUnpublished,
      },
      {
        path: '/customers/1/cart/',
        method: 'put',
        requestBody: {
          id: cartApiResponseWithUnpublished.id,
          lines: [
            {
              product_id: firstPublishedProductAtCart.id,
              quantity: 2,
              sources: [],
            },
            {
              product_id: secondPublishedProductAtCart.id,
              quantity: 3,
              sources: [],
            },
          ],
        },
      },
      {
        path: `/products/${unPublishedProduct.id}/similars/?exclude=3317,28757,71502&lang=es&wh=vlc1`,
        responseBody: similarResults,
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Cart')
    viewSimilarProductsFromCart(unPublishedProduct.display_name)
    const similarModal = await screen.findByRole('dialog')
    const alternativeProduct = getProductByDisplayName(
      similarModal,
      similarResults.results[1].display_name,
    )
    addProductToCart(alternativeProduct)
    expect(alternativeProduct).toHaveTextContent('In cart1')

    increaseProductInCart(alternativeProduct)

    expect(alternativeProduct).toHaveTextContent('In cart1')
    expect(screen.getByText('Maximum quantity')).toBeInTheDocument()
    expect(Tracker.sendViewChange).toHaveBeenCalledWith(
      'product_quantity_limit_alert',
      {
        product_id: similarResults.results[1].id,
      },
    )
  })

  it('should show the water limit alert and cancel it', async () => {
    activeVariant('maximum_water_liters', 125)

    const product = unpublishedWaterProductWith100Liters
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithGrid },
      {
        path: '/customers/1/cart/',
        responseBody: { ...cartWithWaterUnpublished },
      },
      {
        path: `/products/${product.id}/similars/?exclude=28411&lang=es&wh=vlc1`,
        responseBody: similarResults,
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Cart')
    viewSimilarProductsFromCart(product.display_name)
    const similarModal = await screen.findByRole('dialog')
    const alternativeProduct = getProductByDisplayName(
      similarModal,
      similarResults.results[2].display_name,
    )
    addProductToCart(alternativeProduct)
    expect(alternativeProduct).toHaveTextContent('In cart1')

    increaseProductInCart(alternativeProduct)

    expect(alternativeProduct).toHaveTextContent('In cart1')
    expect(screen.getByText('Maximum limit for water')).toBeInTheDocument()

    await screen.findByText('Maximum limit for water')

    const waterLimitAlert = screen
      .getAllByRole('dialog')
      .find((dialog) => dialog.textContent.includes('Maximum limit for water'))
    const currentLiters = '100'
    expect(waterLimitAlert).toHaveTextContent(currentLiters)
    expect(waterLimitAlert).toHaveTextContent('125')
    expect(Tracker.sendViewChange).toHaveBeenCalledWith(
      'water_quantity_limit_alert',
    )

    closeWaterLimitAlert(waterLimitAlert)

    expect(
      screen.queryByText('Maximum limit for water'),
    ).not.toBeInTheDocument()
  })

  it('should show the water limit alert even with variant disabled and cancel it', async () => {
    const product = unpublishedWaterProductWith100Liters
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithGrid },
      {
        path: '/customers/1/cart/',
        responseBody: { ...cartWithWaterUnpublished },
      },
      {
        path: `/products/${product.id}/similars/?exclude=28411&lang=es&wh=vlc1`,
        responseBody: similarResults,
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Cart')
    viewSimilarProductsFromCart(product.display_name)
    const similarModal = await screen.findByRole('dialog')
    const alternativeProduct = getProductByDisplayName(
      similarModal,
      similarResults.results[2].display_name,
    )
    addProductToCart(alternativeProduct)
    expect(alternativeProduct).toHaveTextContent('In cart1')

    increaseProductInCart(alternativeProduct)

    expect(alternativeProduct).toHaveTextContent('In cart1')

    await screen.findByText('Maximum limit for water')

    const waterLimitAlert = screen.getByRole('dialog', {
      name: 'Maximum limit for water. The maximum limit of water per order is 100 and you currently have 100 litres.',
    })
    expect(
      await screen.findByText(
        'The maximum limit of water per order is 100 and you currently have 100 litres.',
      ),
    ).toBeVisible()

    expect(Tracker.sendViewChange).toHaveBeenCalledWith(
      'water_quantity_limit_alert',
    )

    closeWaterLimitAlert(waterLimitAlert)

    expect(
      screen.queryByText('Maximum limit for water'),
    ).not.toBeInTheDocument()
  })

  it('should load the similar products for the user warehouse', async () => {
    wrap(App)
      .atPath('/')
      .withNetwork([
        { path: '/customers/1/home/', responseBody: homeWithGrid },
        {
          path: '/customers/1/cart/',
          responseBody: cartApiResponseWithUnpublished,
        },
        {
          path: `/products/${unPublishedProduct.id}/similars/`,
          responseBody: similarNoResults,
        },
      ])
      .withLogin()
      .mount()

    await screen.findByText('Cart')
    viewSimilarProductsFromCart(unPublishedProduct.display_name)
    await screen.findByRole('dialog')

    expect(global.fetch).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringContaining(
          `/products/${unPublishedProduct.id}/similars/?lang=en&wh=vlc1&exclude=3317,28757,71502`,
        ),
        method: 'GET',
      }),
    )
  })

  it('should display the right styles for similar products modal', async () => {
    wrap(App)
      .atPath('/')
      .withNetwork([
        { path: '/customers/1/home/', responseBody: homeWithGrid },
        {
          path: '/customers/1/cart/',
          responseBody: cartApiResponseWithUnpublished,
        },
        {
          path: `/products/${unPublishedProduct.id}/similars/`,
          responseBody: similarResults,
        },
      ])
      .withLogin()
      .mount()

    await screen.findByText('Cart')
    viewSimilarProductsFromCart(unPublishedProduct.display_name)
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText('3 alternatives available')).toHaveClass(
      'product-similar__alternatives-title',
    )
    expect(within(dialog).getByTestId('similar-products-list')).toHaveClass(
      'product-similar__alternatives',
    )
  })

  // TODO upgrading to node 16 broke this step
  it.skip('should load the similar product detail for the user warehouse', async () => {
    wrap(App)
      .atPath('/')
      .withNetwork([
        { path: '/customers/1/home/', responseBody: homeWithGrid },
        {
          path: '/customers/1/cart/',
          responseBody: cartApiResponseWithUnpublished,
        },
        {
          path: `/products/${unPublishedProduct.id}/similars/`,
          responseBody: similarResults,
        },
      ])
      .withLogin()
      .mount()

    await screen.findByText('Cart')
    viewSimilarProductsFromCart(unPublishedProduct.display_name)
    await screen.findByRole('dialog')
    await openProductDetail('Ron dominicano añejo superior Brugal')

    expect(global.fetch).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringContaining(`/products/28745/?lang=en&wh=vlc1`),
        method: 'GET',
      }),
    )
  })
})
