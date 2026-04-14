import { screen, waitFor, within } from '@testing-library/react'

import {
  clickOnCreateListButton,
  clickOnDismissCreateListDialog,
  clickOnSaveToNewListButton,
  openCartActionsMenu,
  typeListName,
} from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import {
  cart,
  emptyCart as emptyCartScenario,
  localCart,
  validatedLocalCart,
} from 'app/cart/__scenarios__/cart'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
import {
  cocaColaProductBarcelona,
  productWithBulk,
  productWithPack,
} from 'app/catalog/__scenarios__/product'
import { openCart } from 'pages/home/__tests__/helpers'
import { shoppingListDetail } from 'pages/shopping-lists/__tests__/scenarios'
import { Storage } from 'services/storage'
import { cloneDeep } from 'utils/objects'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

configure({
  changeRoute: (route) => history.push(route),
})

it('should disable the save to a new list button if user is not logged in', async () => {
  Storage.setItem('cart', localCart)
  const responses = [
    { path: '/home/', responseBody: homeWithGrid },
    {
      path: '/carts/',
      method: 'post',
      requestBody: {
        id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        lines: [{ quantity: 1, product_id: '28757', sources: ['+RO'] }],
      },
      responseBody: validatedLocalCart,
    },
  ]
  wrap(App).atPath('/').withNetwork(responses).mount()

  await screen.findByText('Novedades')
  openCart()
  openCartActionsMenu()

  expect(
    screen.getByRole('button', { name: 'Save to new list' }),
  ).toBeDisabled()
})

it('should display the create list modal when clicking on save to a new list button', async () => {
  const responses = [
    { path: '/customers/1/home/', responseBody: homeWithGrid },
    { path: '/customers/1/cart/', responseBody: cart },
  ]
  wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

  await screen.findByText('Novedades')

  openCart()
  openCartActionsMenu()
  clickOnSaveToNewListButton()
  expect(
    screen.getByRole('dialog', {
      name: 'Create list, Enter a name for your new list',
    }),
  ).toBeInTheDocument()
})

it('should dismiss the create list modal when clicking on cancel button', async () => {
  const responses = [
    { path: '/customers/1/home/', responseBody: homeWithGrid },
    { path: '/customers/1/cart/', responseBody: cart },
  ]
  wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

  await screen.findByText('Novedades')

  openCart()
  openCartActionsMenu()
  clickOnSaveToNewListButton()
  clickOnDismissCreateListDialog()
  expect(
    screen.queryByRole('dialog', {
      name: 'Create list, Enter a name for your new list',
    }),
  ).not.toBeInTheDocument()
})

it('should create a new list when clicking on create list button and close the cart sidebar', async () => {
  const shoppingListDetailCopy = cloneDeep(shoppingListDetail)
  shoppingListDetailCopy.id = '8faebfdc-8a03-41fe-ab95-1818d9363543'
  shoppingListDetailCopy.name = 'New List from cart'

  const responses = [
    { path: '/customers/1/home/', responseBody: homeWithGrid },
    { path: '/customers/1/cart/', responseBody: cart },
    {
      path: '/customers/1/shopping-lists/create-with-products/',
      method: 'POST',
      requestBody: {
        name: 'New List from cart',
        products: [
          {
            merca_code: '8731',
            quantity: 2,
          },
        ],
      },
      responseBody: {
        id: '8faebfdc-8a03-41fe-ab95-1818d9363543',
      },
    },
    {
      path: '/customers/1/shopping-lists/8faebfdc-8a03-41fe-ab95-1818d9363543/',
      responseBody: shoppingListDetailCopy,
    },
  ]
  wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

  await screen.findByText('Novedades')

  openCart()
  openCartActionsMenu()
  clickOnSaveToNewListButton()
  typeListName('New List from cart')
  clickOnCreateListButton()

  expect(
    await screen.findByRole('heading', {
      name: 'New List from cart',
      level: 1,
    }),
  ).toBeInTheDocument()
  expect(
    screen.queryByRole('dialog', { name: 'Create list' }),
  ).not.toBeInTheDocument()

  const overlay = screen.getByTestId('overlay-container')
  const cartSidebar = screen.getByLabelText('Cart')
  expect(cartSidebar).not.toHaveClass('cart--open')
  expect(overlay).not.toHaveClass('overlay--show')
})

it('should create a list with products in the right order', async () => {
  const firstProduct = cocaColaProductBarcelona
  const secondProduct = productWithBulk
  const thirdProduct = productWithPack

  const shoppingListDetailCopy = cloneDeep(shoppingListDetail)
  shoppingListDetailCopy.id = '8faebfdc-8a03-41fe-ab95-1818d9363543'
  shoppingListDetailCopy.name = 'New List from cart'

  const cartWithMultipleProducts = cloneDeep(emptyCartScenario)
  cartWithMultipleProducts.lines = [
    {
      product: firstProduct,
      quantity: 1,
      sources: ['+CT'],
    },
    {
      product: secondProduct,
      quantity: 1,
      sources: ['+CT'],
    },
    {
      product: thirdProduct,
      quantity: 1,
      sources: ['+CT'],
    },
  ]

  const responses = [
    { path: '/customers/1/home/', responseBody: homeWithGrid },
    { path: '/customers/1/cart/', responseBody: cartWithMultipleProducts },
    {
      path: '/customers/1/shopping-lists/create-with-products/',
      method: 'POST',
      requestBody: {
        name: 'New List from cart',
        products: [
          {
            merca_code: firstProduct.id,
            quantity: 1,
          },
          {
            merca_code: secondProduct.id,
            quantity: 1,
          },
          {
            merca_code: thirdProduct.id,
            quantity: 1,
          },
        ],
      },
      responseBody: {
        id: '8faebfdc-8a03-41fe-ab95-1818d9363543',
      },
    },
    {
      path: '/customers/1/shopping-lists/8faebfdc-8a03-41fe-ab95-1818d9363543/',
      responseBody: shoppingListDetailCopy,
    },
  ]
  wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

  await screen.findByText('Novedades')

  openCart()
  openCartActionsMenu()
  clickOnSaveToNewListButton()
  typeListName('New List from cart')
  clickOnCreateListButton()

  await screen.findByRole('heading', {
    name: 'New List from cart',
    level: 1,
  })

  expect(
    '/customers/1/shopping-lists/create-with-products/',
  ).toHaveBeenFetchedWith({
    method: 'POST',
    body: {
      name: 'New List from cart',
      products: [
        {
          merca_code: firstProduct.id,
          quantity: 1,
        },
        {
          merca_code: secondProduct.id,
          quantity: 1,
        },
        {
          merca_code: thirdProduct.id,
          quantity: 1,
        },
      ],
    },
  })
})

it('should display error message when there is an error creating a list from the cart', async () => {
  const shoppingListDetailCopy = cloneDeep(shoppingListDetail)
  shoppingListDetailCopy.id = '8faebfdc-8a03-41fe-ab95-1818d9363543'
  shoppingListDetailCopy.name = 'New List from cart'

  const responses = [
    { path: '/customers/1/home/', responseBody: homeWithGrid },
    { path: '/customers/1/cart/', responseBody: cart },
    {
      path: '/customers/1/shopping-lists/create-with-products/',
      method: 'POST',
      requestBody: {
        name: 'New List from cart',
        products: [
          {
            merca_code: '8731',
            quantity: 2,
          },
        ],
      },
      status: 400,
    },
    {
      path: '/customers/1/shopping-lists/8faebfdc-8a03-41fe-ab95-1818d9363543/',
      responseBody: shoppingListDetailCopy,
    },
  ]
  wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

  await screen.findByText('Novedades')
  openCart()
  openCartActionsMenu()
  clickOnSaveToNewListButton()
  typeListName('New List from cart')
  clickOnCreateListButton()
  const errorDialog = await screen.findByRole('dialog', {
    name: 'Operation not performed.It was not possible to create the list, please try again.',
  })
  expect(
    within(errorDialog).getByText(
      'It was not possible to create the list, please try again.',
    ),
  ).toBeInTheDocument()
})

it('should reenable the create list button if there is an error creating a list', async () => {
  const responses = [
    { path: '/customers/1/home/', responseBody: homeWithGrid },
    { path: '/customers/1/cart/', responseBody: cart },
    {
      path: '/customers/1/shopping-lists/create-with-products/',
      method: 'POST',
      requestBody: {
        name: 'New List from cart',
        products: [
          {
            merca_code: '8731',
            quantity: 2,
          },
        ],
      },
      status: 400,
    },
  ]
  wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

  await screen.findByText('Novedades')

  openCart()
  openCartActionsMenu()
  clickOnSaveToNewListButton()
  typeListName('New List from cart')
  clickOnCreateListButton()

  await screen.findByRole('dialog', {
    name: 'Operation not performed.It was not possible to create the list, please try again.',
  })
  const dialog = screen.getByRole('dialog', {
    name: 'Create list, Enter a name for your new list',
  })
  const buttons = within(dialog).getAllByRole('button')

  await waitFor(() => {
    expect(buttons[1]).toBeEnabled()
  })
})

it('should disable the create list button when creating a list', async () => {
  const responses = [
    { path: '/customers/1/home/', responseBody: homeWithGrid },
    { path: '/customers/1/cart/', responseBody: cart },
    {
      path: '/customers/1/shopping-lists/create-with-products/',
      method: 'POST',
      requestBody: {
        name: 'New List from cart',
        products: [
          {
            merca_code: '8731',
            quantity: 2,
          },
        ],
      },
      responseBody: {
        id: '8faebfdc-8a03-41fe-ab95-1818d9363543',
      },
      delay: 300,
    },
  ]
  wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

  await screen.findByText('Novedades')

  openCart()
  openCartActionsMenu()
  clickOnSaveToNewListButton()
  typeListName('New List from cart')
  clickOnCreateListButton()

  const dialog = screen.getByRole('dialog', {
    name: 'Create list, Enter a name for your new list',
  })
  const buttons = within(dialog).getAllByRole('button')
  expect(buttons[1]).toBeDisabled()
})
