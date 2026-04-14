import { screen, waitFor, within } from '@testing-library/react'

import { waitForCartItemRemovedAnnouncement } from './helpers'
import { configure, wrap } from 'wrapito'

import { activeFeatureFlags } from '__tests__/helpers'
import { App, history } from 'app'
import { openCart } from 'app/cart/containers/cart-button-container/actions'
import {
  homeWithGrid,
  homeWithPackProduct,
  homeWithProductFormats,
} from 'app/catalog/__scenarios__/home'
import { recommendations } from 'app/catalog/__scenarios__/recommendations'
import {
  addProductToCart,
  decreaseProductFromCart,
  getProductCellByDisplayName,
  increaseProductInCart,
  removeProductFromCart,
} from 'pages/home/__tests__/helpers'
import { addProductRecommendation } from 'pages/my-regulars/__tests__/helpers'
import { cloneDeep } from 'utils/objects'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

configure({
  changeRoute: (route) => history.push(route),
})

beforeEach(() => {
  vi.resetAllMocks()
})

it('should put Aria Live into aria live portal', async () => {
  const responses = [{ path: '/home/', responseBody: homeWithGrid }]
  wrap(App).atPath('/').withNetwork(responses).mount()

  await screen.findByText('Fideos orientales Yakisoba sabor pollo Hacendado')
  const productToAdd = getProductCellByDisplayName(
    'Fideos orientales Yakisoba sabor pollo Hacendado',
  )

  addProductToCart(productToAdd)

  const productAddedAriaLive = screen.getByText('1 UNIT HAS BEEN ADDED TO CART')
  expect(productAddedAriaLive.parentElement.id).toEqual('aria-live-portal')
})

it('should show proper feedback when removing a product from cart in cart, and keep the focus in cart', async () => {
  const responses = [{ path: '/home/', responseBody: homeWithGrid }]
  wrap(App).atPath('/').withNetwork(responses).mount()

  await screen.findByText('Fideos orientales Yakisoba sabor pollo Hacendado')
  const productToAdd = getProductCellByDisplayName(
    'Fideos orientales Yakisoba sabor pollo Hacendado',
  )

  addProductToCart(productToAdd)
  openCart()

  const cartSidebar = await screen.findByTestId('cart')

  removeProductFromCart(cartSidebar)

  expect(
    screen.getByText('The product has been removed from cart.'),
  ).toBeInTheDocument()

  expect(within(cartSidebar).getByText('Cart')).toHaveFocus()
})

it('should show proper feedback when removing product with grams from cart, keeping buttons accessible', async () => {
  const responses = [{ path: '/home/', responseBody: homeWithProductFormats }]
  wrap(App).atPath('/').withNetwork(responses).mount()

  await screen.findByText(
    'Pintalabios Velvet Nudes mate Deliplus 01 nude claro',
  )
  const productToAdd = getProductCellByDisplayName('Judía verde plana')

  expect(within(productToAdd).getByTestId('button-picker')).toHaveAttribute(
    'aria-hidden',
    'true',
  )

  addProductToCart(productToAdd)
  increaseProductInCart(productToAdd)
  decreaseProductFromCart(productToAdd)

  expect(
    within(productToAdd).getByRole('button', {
      name: 'Remove 150 Grams from cart',
    }),
  ).toBeInTheDocument()
  expect(
    screen.getByText('150 GRAMS HAVE BEEN REMOVED FROM CART'),
  ).toBeInTheDocument()
})

it('should show proper feedback when adding product with grams from cart', async () => {
  const responses = [{ path: '/home/', responseBody: homeWithProductFormats }]
  wrap(App).atPath('/').withNetwork(responses).mount()

  await screen.findByText(
    'Pintalabios Velvet Nudes mate Deliplus 01 nude claro',
  )
  const productToAdd = getProductCellByDisplayName('Judía verde plana')

  addProductToCart(productToAdd)

  expect(
    within(productToAdd).getByRole('button', {
      name: 'Add 150 Grams to cart',
    }),
  ).toBeInTheDocument()
  expect(
    screen.getByText('150 GRAMS HAVE BEEN ADDED TO CART'),
  ).toBeInTheDocument()
  expect(within(productToAdd).getByTestId('button-picker')).toHaveAttribute(
    'aria-hidden',
    'false',
  )
})

it('should show right label for adding and removing a pack to the cart', async () => {
  const responses = [{ path: '/home/', responseBody: homeWithPackProduct }]
  wrap(App).atPath('/').withNetwork(responses).mount()

  await screen.findByText('Plataforma mopa grande abrillantadora Bosque Verde')
  const productToAdd = getProductCellByDisplayName(
    'Plataforma mopa grande abrillantadora Bosque Verde',
  )

  addProductToCart(productToAdd)
  increaseProductInCart(productToAdd)

  expect(
    within(productToAdd).getByRole('button', { name: 'Add 1 Pack to cart' }),
  ).toBeInTheDocument()
  expect(
    within(productToAdd).getByRole('button', {
      name: 'Remove 1 Pack from cart',
    }),
  ).toBeInTheDocument()
})

it('should show right label for adding and removing an unit to the cart', async () => {
  const responses = [{ path: '/home/', responseBody: homeWithGrid }]
  wrap(App).atPath('/').withNetwork(responses).mount()

  await screen.findByText('Fideos orientales Yakisoba sabor pollo Hacendado')
  const productToAdd = getProductCellByDisplayName(
    'Fideos orientales Yakisoba sabor pollo Hacendado',
  )

  addProductToCart(productToAdd)
  increaseProductInCart(productToAdd)

  expect(
    within(productToAdd).getByRole('button', { name: 'Add 1 Unit to cart' }),
  ).toBeInTheDocument()
  expect(
    within(productToAdd).getByRole('button', {
      name: 'Remove 1 Unit from cart',
    }),
  ).toBeInTheDocument()
})

it('should show right label for removing a product from cart', async () => {
  const responses = [{ path: '/home/', responseBody: homeWithPackProduct }]
  wrap(App).atPath('/').withNetwork(responses).mount()

  await screen.findByText('Plataforma mopa grande abrillantadora Bosque Verde')
  const product = getProductCellByDisplayName(
    'Plataforma mopa grande abrillantadora Bosque Verde',
  )

  addProductToCart(product)

  expect(
    within(product).getByRole('button', { name: 'Remove product from cart' }),
  ).toBeInTheDocument()
})

it('should show proper feedback when removing a pack from cart and hide the buttons', async () => {
  activeFeatureFlags(['web-accessibility-cart'])

  const responses = [{ path: '/home/', responseBody: homeWithPackProduct }]
  wrap(App).atPath('/').withNetwork(responses).mount()

  await screen.findByText('Plataforma mopa grande abrillantadora Bosque Verde')
  const productToRemove = getProductCellByDisplayName(
    'Plataforma mopa grande abrillantadora Bosque Verde',
  )

  addProductToCart(productToRemove)
  removeProductFromCart(productToRemove)

  expect(
    screen.queryByText('1 Pack has been removed from cart'),
  ).not.toBeInTheDocument()
  expect(
    screen.getByText('The product has been removed from cart.'),
  ).toBeInTheDocument()

  expect(screen.getByTestId('button-picker')).toHaveClass(
    'button-picker--hidden',
  )
  await waitForCartItemRemovedAnnouncement()

  expect(screen.getByText('Cart is empty')).toBeInTheDocument()
  expect(
    screen.queryByText('The product has been removed from cart.'),
  ).not.toBeInTheDocument()
})

it('should show proper feedback when decreasing the quantity of a pack from cart', async () => {
  const responses = [{ path: '/home/', responseBody: homeWithPackProduct }]
  wrap(App).atPath('/').withNetwork(responses).mount()

  await screen.findByText('Plataforma mopa grande abrillantadora Bosque Verde')
  const productToRemove = getProductCellByDisplayName(
    'Plataforma mopa grande abrillantadora Bosque Verde',
  )

  addProductToCart(productToRemove)
  increaseProductInCart(productToRemove)
  decreaseProductFromCart(productToRemove)

  expect(
    screen.getByText('1 PACK HAS BEEN REMOVED FROM CART'),
  ).toBeInTheDocument()
})

it('should show proper feedback when adding product to cart', async () => {
  const responses = [{ path: '/home/', responseBody: homeWithGrid }]
  wrap(App).atPath('/').withNetwork(responses).mount()

  await screen.findByText('Fideos orientales Yakisoba sabor pollo Hacendado')
  const productToAdd = getProductCellByDisplayName(
    'Fideos orientales Yakisoba sabor pollo Hacendado',
  )

  addProductToCart(productToAdd)

  expect(screen.getByText('1 UNIT HAS BEEN ADDED TO CART')).toBeInTheDocument()
})

it('should show proper feedback when adding more of the same product to cart', async () => {
  const responses = [{ path: '/home/', responseBody: homeWithGrid }]
  wrap(App).atPath('/').withNetwork(responses).mount()

  await screen.findByText('Fideos orientales Yakisoba sabor pollo Hacendado')
  const productToAdd = getProductCellByDisplayName(
    'Fideos orientales Yakisoba sabor pollo Hacendado',
  )

  addProductToCart(productToAdd)
  openCart()

  const cartSidebar = await screen.findByTestId('cart')

  increaseProductInCart(cartSidebar)

  const feedbackContainer = screen.getByText('1 unit has been added to cart')

  expect(feedbackContainer).toBeInTheDocument()

  increaseProductInCart(cartSidebar)

  expect(
    within(feedbackContainer).getByText('1 UNIT HAS BEEN ADDED TO CART'),
  ).toBeInTheDocument()
})

it('should show proper feedback when adding more of the same product with grams to cart', async () => {
  const responses = [{ path: '/home/', responseBody: homeWithProductFormats }]
  wrap(App).atPath('/').withNetwork(responses).mount()

  await screen.findByText(
    'Pintalabios Velvet Nudes mate Deliplus 01 nude claro',
  )
  const productToAdd = getProductCellByDisplayName('Judía verde plana')

  addProductToCart(productToAdd)
  openCart()

  const cartSidebar = await screen.findByTestId('cart')

  increaseProductInCart(cartSidebar)

  expect(
    screen.getByText('150 Grams have been added to cart'),
  ).toBeInTheDocument()

  increaseProductInCart(cartSidebar)

  expect(
    screen.queryAllByText('150 GRAMS HAVE BEEN ADDED TO CART'),
  ).toHaveLength(2)
})

it('should show proper feedback when adding a pack to cart', async () => {
  const responses = [{ path: '/home/', responseBody: homeWithPackProduct }]
  wrap(App).atPath('/').withNetwork(responses).mount()

  await screen.findByText('Plataforma mopa grande abrillantadora Bosque Verde')
  const productToAdd = getProductCellByDisplayName(
    'Plataforma mopa grande abrillantadora Bosque Verde',
  )

  addProductToCart(productToAdd)

  const increaseQuantityButton = within(productToAdd).getByRole('button', {
    name: 'Add 1 Pack to cart',
  })

  await waitFor(() => {
    expect(document.activeElement).toStrictEqual(increaseQuantityButton)
  })
  expect(screen.getByText('1 PACK HAS BEEN ADDED TO CART')).toBeInTheDocument()
})

it('should show proper feedback when adding more of the pack to cart', async () => {
  const responses = [{ path: '/home/', responseBody: homeWithPackProduct }]
  wrap(App).atPath('/').withNetwork(responses).mount()

  await screen.findByText('Plataforma mopa grande abrillantadora Bosque Verde')
  const productToAdd = getProductCellByDisplayName(
    'Plataforma mopa grande abrillantadora Bosque Verde',
  )

  addProductToCart(productToAdd)
  openCart()

  const cartSidebar = await screen.findByTestId('cart')

  increaseProductInCart(cartSidebar)

  expect(screen.getByText('1 pack has been added to cart')).toBeInTheDocument()
})

it('should not have "add product to cart" button accessible after adding a product to cart', async () => {
  const responses = [{ path: '/home/', responseBody: homeWithPackProduct }]
  wrap(App).atPath('/').withNetwork(responses).mount()

  await screen.findByText('Plataforma mopa grande abrillantadora Bosque Verde')
  const productToAdd = getProductCellByDisplayName(
    'Plataforma mopa grande abrillantadora Bosque Verde',
  )

  addProductToCart(productToAdd)
  openCart()

  const cartSidebar = await screen.findByTestId('cart')

  increaseProductInCart(cartSidebar)

  const addToCartButton = within(cartSidebar).getByRole('button', {
    name: 'Add to cart',
  })

  expect(addToCartButton).toHaveAttribute('tabindex', '-1')
  expect(addToCartButton.closest('div')).toHaveClass(
    'product-quantity-button--hidden ',
  )
})

it('should show proper feedback when adding an unit product with plural recommendedations to the cart', async () => {
  const responses = [
    {
      path: '/customers/1/recommendations/myregulars/',
      responseBody: recommendations,
    },
  ]
  wrap(App).atPath('/my-products').withNetwork(responses).withLogin().mount()
  await screen.findByText('Fideos orientales Yakisoba sabor pollo Hacendado')
  addProductRecommendation('Fideos orientales Yakisoba sabor pollo Hacendado')

  expect(
    screen.getByText('2 UNITS HAVE BEEN ADDED TO CART'),
  ).toBeInTheDocument()
})

it('should show proper feedback when adding a pack product with plural recommendedations to the cart', async () => {
  const recommendationsClone = cloneDeep(recommendations)
  recommendationsClone[0].product.price_instructions.is_pack = true

  const responses = [
    {
      path: '/customers/1/recommendations/myregulars/',
      responseBody: recommendationsClone,
    },
  ]
  wrap(App).atPath('/my-products').withNetwork(responses).withLogin().mount()
  await screen.findByText('Fideos orientales Yakisoba sabor pollo Hacendado')

  addProductRecommendation('Fideos orientales Yakisoba sabor pollo Hacendado')

  expect(
    screen.getByText('2 PACKS HAVE BEEN ADDED TO CART'),
  ).toBeInTheDocument()
})

it('should show proper feedback when adding a product in a list with no recommended quantity to the cart', async () => {
  const recommendationsClone = cloneDeep(recommendations)
  recommendationsClone[0].recommended_quantity = 0

  const responses = [
    {
      path: '/customers/1/recommendations/myregulars/',
      responseBody: recommendationsClone,
    },
  ]
  wrap(App).atPath('/my-products').withNetwork(responses).withLogin().mount()

  await screen.findByText('Fideos orientales Yakisoba sabor pollo Hacendado')

  const productToAdd = getProductCellByDisplayName(
    'Fideos orientales Yakisoba sabor pollo Hacendado',
  )
  addProductToCart(productToAdd)

  expect(screen.getByText('1 UNIT HAS BEEN ADDED TO CART')).toBeInTheDocument()
})
