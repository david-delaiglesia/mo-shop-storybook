import { screen } from '@testing-library/react'

import {
  addPrivateProductToCart,
  addXsellingProductToCart,
  decreasePrivateProductInCart,
  decreaseXsellingProductToCart,
  increasePrivateProductInCart,
  increaseXsellingProductToCart,
  removePrivateProductInCart,
  removeXsellingProductFromCart,
} from './helpers'
import { configure, wrap } from 'wrapito'

import { activeFeatureFlags } from '__tests__/helpers'
import { App, history } from 'app'
import {
  productBaseDetail,
  productBaseDetailWithNutritionInformation,
  productWithBulk,
  productWithoutXSelling,
  productXSelling,
} from 'app/catalog/__scenarios__/product'
import { knownFeatureFlags } from 'services/feature-flags'
import { Storage } from 'services/storage'
import { Tracker } from 'services/tracker'

const today = new Date().toISOString().split('T')[0]
const metrics = {
  amount: 0,
  cart_id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
  display_name: 'Fideos orientales Yakisoba sabor pollo Hacendado',
  id: '8731',
  merca_code: '8731',
  layout: 'product_detail',
  price: '0,85',
  requires_age_check: false,
  selling_method: 'units',
  source: 'product',
  cart_mode: 'purchase',
}

vi.unmock('react-i18next')
vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Product - Private - Cart', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    vi.clearAllMocks()
    Storage.clear()
    localStorage.clear()
  })

  it('should be able to add the product to the cart', async () => {
    const responses = [
      { path: '/products/8731/', responseBody: productBaseDetail },
      {
        path: '/products/8731/xselling/',
        responseBody: productWithoutXSelling,
      },
    ]
    wrap(App).atPath('/product/8731').withNetwork(responses).withLogin().mount()

    await screen.findByText(
      'Descripción Fideos orientales Yakisoba sabor pollo',
    )
    addPrivateProductToCart()
    const [productDetailQuantity] = await screen.findAllByText('1 unit')

    expect(productDetailQuantity).toBeInTheDocument()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith('add_product_click', {
      ...metrics,
      first_product_added_at: expect.stringContaining(today),
      first_product: true,
      added_amount: 1,
    })
    expect('/customers/1/cart/').toHaveBeenFetchedWith({
      method: 'PUT',
      body: {
        id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        lines: [{ quantity: 1, product_id: '8731', sources: ['+PL'] }],
      },
    })
  })

  it('should be able to increase the product to the cart', async () => {
    const responses = [
      { path: '/products/8731/', responseBody: productBaseDetail },
      {
        path: '/products/8731/xselling/',
        responseBody: productWithoutXSelling,
      },
    ]
    wrap(App).atPath('/product/8731').withNetwork(responses).withLogin().mount()

    await screen.findByText(
      'Descripción Fideos orientales Yakisoba sabor pollo',
    )
    addPrivateProductToCart()
    increasePrivateProductInCart()
    const [productDetailQuantity] = await screen.findAllByText('2 units')

    expect(productDetailQuantity).toBeInTheDocument()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith('add_product_click', {
      ...metrics,
      amount: 1,
      first_product: false,
      added_amount: 1,
    })
    expect('/customers/1/cart/').toHaveBeenFetchedWith({
      method: 'PUT',
      body: {
        id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        lines: [{ quantity: 2, product_id: '8731', sources: ['+PL', '+PL'] }],
      },
    })
  })

  it('should be able to decrease the product to the cart', async () => {
    const responses = [
      { path: '/products/8731/', responseBody: productBaseDetail },
      {
        path: '/products/8731/xselling/',
        responseBody: productWithoutXSelling,
      },
    ]
    wrap(App).atPath('/product/8731').withNetwork(responses).withLogin().mount()

    await screen.findByText(
      'Descripción Fideos orientales Yakisoba sabor pollo',
    )
    addPrivateProductToCart()
    increasePrivateProductInCart()
    decreasePrivateProductInCart()
    const [productDetailQuantity] = await screen.findAllByText('1 unit')

    expect(productDetailQuantity).toBeInTheDocument()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'decrease_product_click',
      {
        ...metrics,
        amount: 2,
        decreased_amount: 1,
      },
    )
    expect('/customers/1/cart/').toHaveBeenFetchedWith({
      method: 'PUT',
      body: {
        id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        lines: [
          { quantity: 1, product_id: '8731', sources: ['+PL', '+PL', '-PL'] },
        ],
      },
    })
  })

  it('should be able to remove the product from cart', async () => {
    const responses = [
      { path: '/products/8731/', responseBody: productBaseDetail },
      {
        path: '/products/8731/xselling/',
        responseBody: productWithoutXSelling,
      },
    ]
    wrap(App).atPath('/product/8731').withNetwork(responses).withLogin().mount()

    await screen.findByText(
      'Descripción Fideos orientales Yakisoba sabor pollo',
    )
    addPrivateProductToCart()
    removePrivateProductInCart()
    const [productDetailQuantity] = await screen.findAllByText('0 unit')

    expect(productDetailQuantity).toBeInTheDocument()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'decrease_product_click',
      {
        ...metrics,
        amount: 1,
        decreased_amount: 1,
      },
    )
    expect('/customers/1/cart/').toHaveBeenFetchedWith({
      method: 'PUT',
      body: {
        id: '10000000-1000-4000-8000-100000000000',
        lines: [],
      },
    })
  })

  it('should be able to add the bulk product to the cart', async () => {
    const responses = [
      { path: '/products/3317/', responseBody: productWithBulk },
      {
        path: '/products/3317/xselling/',
        responseBody: productWithoutXSelling,
      },
    ]
    wrap(App).atPath('/product/3317').withNetwork(responses).withLogin().mount()

    await screen.findByText('Uva blanca con semillas')
    addPrivateProductToCart()
    const [productDetailQuantity] = await screen.findAllByText('200 g')

    expect(productDetailQuantity).toBeInTheDocument()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith('add_product_click', {
      ...metrics,
      id: '3317',
      merca_code: '3317',
      display_name: 'Uva blanca con semillas',
      price: '1,89',
      selling_method: 'bunch',
      first_product_added_at: expect.stringContaining(today),
      first_product: true,
      added_amount: 1,
    })
    expect('/customers/1/cart/').toHaveBeenFetchedWith({
      method: 'PUT',
      body: {
        id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        lines: [{ quantity: 0.2, product_id: '3317', sources: ['+PL'] }],
      },
    })
  })

  it('should be able to increase the bulk product to the cart', async () => {
    const responses = [
      { path: '/products/3317/', responseBody: productWithBulk },
      {
        path: '/products/3317/xselling/',
        responseBody: productWithoutXSelling,
      },
    ]
    wrap(App).atPath('/product/3317').withNetwork(responses).withLogin().mount()

    await screen.findByText('Uva blanca con semillas')
    addPrivateProductToCart()
    increasePrivateProductInCart()
    const [productDetailQuantity] = await screen.findAllByText('300 g')

    expect(productDetailQuantity).toBeInTheDocument()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith('add_product_click', {
      ...metrics,
      id: '3317',
      merca_code: '3317',
      display_name: 'Uva blanca con semillas',
      amount: 0.2,
      price: '1,89',
      selling_method: 'bunch',
      first_product: false,
      added_amount: 1,
    })
    expect('/customers/1/cart/').toHaveBeenFetchedWith({
      method: 'PUT',
      body: {
        id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        lines: [{ quantity: 0.3, product_id: '3317', sources: ['+PL', '+PL'] }],
      },
    })
  })

  it('should be able to add a product from xselling to the cart', async () => {
    const responses = [
      { path: '/products/8731/', responseBody: productBaseDetail },
      {
        path: '/products/8731/xselling/',
        responseBody: productXSelling,
      },
    ]
    wrap(App).atPath('/product/8731').withNetwork(responses).withLogin().mount()

    await screen.findByText(
      'Descripción Fideos orientales Yakisoba sabor pollo',
    )
    addXsellingProductToCart()
    const [productDetailQuantity] = await screen.findAllByText('1 unit')

    expect(productDetailQuantity).toBeInTheDocument()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith('add_product_click', {
      ...metrics,
      id: '3119',
      merca_code: '3119',
      display_name: 'Pera conferencia',
      price: '0,30',
      layout: 'carousel',
      source: 'xselling',
      cart_mode: 'purchase',
      order: 0,
      first_product_added_at: expect.stringContaining(today),
      first_product: true,
      added_amount: 1,
    })
    expect('/customers/1/cart/').toHaveBeenFetchedWith({
      method: 'PUT',
      body: {
        id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        lines: [{ quantity: 1, product_id: '3119', sources: ['+XS'] }],
      },
    })
  })

  it('should be able to increase the product from xselling to the cart', async () => {
    const responses = [
      { path: '/products/8731/', responseBody: productBaseDetail },
      {
        path: '/products/8731/xselling/',
        responseBody: productXSelling,
      },
    ]
    wrap(App).atPath('/product/8731').withNetwork(responses).withLogin().mount()

    await screen.findByText(
      'Descripción Fideos orientales Yakisoba sabor pollo',
    )
    addXsellingProductToCart()
    increaseXsellingProductToCart()
    const [productDetailQuantity] = await screen.findAllByText('2 units')

    expect(productDetailQuantity).toBeInTheDocument()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith('add_product_click', {
      ...metrics,
      id: '3119',
      merca_code: '3119',
      display_name: 'Pera conferencia',
      price: '0,30',
      layout: 'carousel',
      source: 'xselling',
      cart_mode: 'purchase',
      order: 0,
      amount: 1,
      first_product: false,
      added_amount: 1,
    })
    expect('/customers/1/cart/').toHaveBeenFetchedWith({
      method: 'PUT',
      body: {
        id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        lines: [{ quantity: 2, product_id: '3119', sources: ['+XS', '+XS'] }],
      },
    })
  })

  it('should be able to decrease the product from xselling to the cart', async () => {
    const responses = [
      { path: '/products/8731/', responseBody: productBaseDetail },
      {
        path: '/products/8731/xselling/',
        responseBody: productXSelling,
      },
    ]
    wrap(App).atPath('/product/8731').withNetwork(responses).withLogin().mount()

    await screen.findByText(
      'Descripción Fideos orientales Yakisoba sabor pollo',
    )
    addXsellingProductToCart()
    increaseXsellingProductToCart()
    decreaseXsellingProductToCart()
    const [productDetailQuantity] = await screen.findAllByText('1 unit')

    expect(productDetailQuantity).toBeInTheDocument()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'decrease_product_click',
      {
        ...metrics,
        id: '3119',
        merca_code: '3119',
        display_name: 'Pera conferencia',
        price: '0,30',
        layout: 'carousel',
        source: 'xselling',
        cart_mode: 'purchase',
        amount: 2,
        decreased_amount: 1,
      },
    )
    expect('/customers/1/cart/').toHaveBeenFetchedWith({
      method: 'PUT',
      body: {
        id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        lines: [
          { quantity: 1, product_id: '3119', sources: ['+XS', '+XS', '-XS'] },
        ],
      },
    })
  })

  it('should be able to remove the product from xselling to the cart', async () => {
    const responses = [
      { path: '/products/8731/', responseBody: productBaseDetail },
      {
        path: '/products/8731/xselling/',
        responseBody: productXSelling,
      },
    ]
    wrap(App).atPath('/product/8731').withNetwork(responses).withLogin().mount()

    await screen.findByText(
      'Descripción Fideos orientales Yakisoba sabor pollo',
    )

    addXsellingProductToCart()
    removeXsellingProductFromCart()

    const [productDetailQuantity] = await screen.findAllByText('0 unit')

    expect(productDetailQuantity).toBeInTheDocument()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'decrease_product_click',
      {
        ...metrics,
        id: '3119',
        merca_code: '3119',
        display_name: 'Pera conferencia',
        price: '0,30',
        layout: 'carousel',
        source: 'xselling',
        cart_mode: 'purchase',
        amount: 1,
        decreased_amount: 1,
      },
    )
    expect('/customers/1/cart/').toHaveBeenFetchedWith({
      method: 'PUT',
      body: {
        id: '10000000-1000-4000-8000-100000000000',
        lines: [],
      },
    })
  })

  it('should include page product-detail in add_product_click for xselling when flags are ON', async () => {
    activeFeatureFlags([
      knownFeatureFlags.WEB_ADD_PRODUCT_CLICK_PAYLOAD,
      knownFeatureFlags.WEB_XSELLING_ADD_PRODUCT_CLICK_PAGE,
    ])

    const responses = [
      { path: '/products/8731/', responseBody: productBaseDetail },
      {
        path: '/products/8731/xselling/',
        responseBody: productXSelling,
      },
    ]
    wrap(App).atPath('/product/8731').withNetwork(responses).withLogin().mount()

    await screen.findByText(
      'Descripción Fideos orientales Yakisoba sabor pollo',
    )
    addXsellingProductToCart()
    await screen.findAllByText('1 unit')

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'add_product_click',
      expect.objectContaining({
        source: 'xselling',
        page: 'product-detail',
        section: 'xselling',
        position: 0,
      }),
    )
  })

  it('should not include page in add_product_click for xselling when flag is OFF', async () => {
    activeFeatureFlags([])

    const responses = [
      { path: '/products/8731/', responseBody: productBaseDetail },
      {
        path: '/products/8731/xselling/',
        responseBody: productXSelling,
      },
    ]
    wrap(App).atPath('/product/8731').withNetwork(responses).withLogin().mount()

    await screen.findByText(
      'Descripción Fideos orientales Yakisoba sabor pollo',
    )
    addXsellingProductToCart()
    await screen.findAllByText('1 unit')

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'add_product_click',
      expect.not.objectContaining({
        page: 'product-detail',
      }),
    )
  })

  it('should have an aria label so is possible to listen to the ingredients and allergens', async () => {
    const resultAriaLabel =
      'Fideos orientales Yakisoba sabor pollo Hacendado. Allergens: Puede contener crustáceos y productos a base de crustáceos. Puede contener pescado y productos a base de pescado. Puede contener granos de sésamo y productos a base de granos de sésamo. Contiene cereales que contengan gluten. Puede contener apio y productos derivados. Contiene moluscos y productos a base de moluscos.. Ingredients: Fideos 83,0% [harina de trigo, aceite de palma, sal, agentes de tratamiento de la harina (E500, E451), estabilizante (E501), espesante (E412), antioxidante (E306)], Sazonador líquido 16,1% [azúcar, agua, aceite de colza, salsa de soja (agua, habas de soja, sal, trigo) 8,8% en el sazonador líquido, potenciadores del sabor (E621, E635), colorante (E150c), dextrosa, melaza, vinagre, sal, especias, proteína vegetal hidrolizada, tomate en polvo, corrector de acidez: ácido cítrico, aromas], cebolleta. Puede contener trazas de apio, crustáceos, pescado, leche, moluscos, mostaza y sésamo.. Storage instructions: Mantener alejado de la humedad y de la luz. Instructions for use: 1. Retire las dos tapas y el sobre. Llene el vaso con agua hirviendo hasta la línea interior.. Origin: Japan'

    const responses = [
      {
        path: '/products/8731/',
        responseBody: productBaseDetailWithNutritionInformation,
      },
      {
        path: '/products/8731/xselling/',
        responseBody: productWithoutXSelling,
      },
    ]
    wrap(App).atPath('/product/8731').withNetwork(responses).withLogin().mount()

    await screen.findByText(
      'Descripción Fideos orientales Yakisoba sabor pollo',
    )
    expect(screen.getByLabelText(`${resultAriaLabel}`)).toBeInTheDocument()
  })
})
