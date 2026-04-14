import { screen } from '@testing-library/react'

import { shoppingListDetail } from './scenarios'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { cart } from 'app/cart/__scenarios__/cart'
import { cookies } from 'app/cookie/__scenarios__/cookies'
import { openCart } from 'pages/home/__tests__/helpers'
import {
  clickOnCreateListButton,
  clickOnSaveToNewListButton,
  openCartActionsMenu,
  typeListName,
} from 'pages/home/__tests__/helpers'
import {
  moreSuggestions,
  suggestions,
} from 'pages/shopping-lists/__tests__/scenarios.suggestions'
import { Cookie } from 'services/cookie'
import { cloneDeep } from 'utils/objects'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

configure({
  changeRoute: (route) => history.push(route),
})

beforeEach(() => {
  vi.spyOn(Cookie, 'get').mockImplementation((cookie) => cookies[cookie])
})

it('should refresh the suggestions section when fetching a new list', async () => {
  const shoppingListDetailCopy = cloneDeep(shoppingListDetail)
  shoppingListDetailCopy.id = '8faebfdc-8a03-41fe-ab95-1818d9363543'
  shoppingListDetailCopy.name = 'New List from cart'

  wrap(App)
    .atPath('/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679')
    .withNetwork([
      {
        path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/',
        responseBody: shoppingListDetail,
      },
      {
        path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/suggested-products/',
        responseBody: suggestions,
      },
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
      {
        path: '/customers/1/shopping-lists/8faebfdc-8a03-41fe-ab95-1818d9363543/suggested-products/',
        responseBody: moreSuggestions,
      },
    ])
    .withLogin()
    .mount()

  await screen.findByRole('heading', { name: 'My second list', level: 1 })
  openCart()
  openCartActionsMenu()
  clickOnSaveToNewListButton()
  typeListName('New List from cart')
  clickOnCreateListButton()
  await screen.findByRole('heading', { name: 'New List from cart' })

  expect(
    await screen.findByText(
      'Patatas prefritas corte grueso Hacendado ultracongeladas',
    ),
  ).toBeInTheDocument()
})

it('should refresh the suggestions section when fetching a new list - LEGACY', async () => {
  const shoppingListDetailCopy = cloneDeep(shoppingListDetail)
  shoppingListDetailCopy.id = '8faebfdc-8a03-41fe-ab95-1818d9363543'
  shoppingListDetailCopy.name = 'New List from cart'

  wrap(App)
    .atPath('/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679')
    .withNetwork([
      {
        path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/',
        responseBody: shoppingListDetail,
      },
      {
        path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/suggested-products/',
        responseBody: suggestions,
      },
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
      {
        path: '/customers/1/shopping-lists/8faebfdc-8a03-41fe-ab95-1818d9363543/suggested-products/',
        responseBody: moreSuggestions,
      },
    ])
    .withLogin()
    .mount()

  await screen.findByRole('heading', { name: 'My second list', level: 1 })
  openCart()
  openCartActionsMenu()
  clickOnSaveToNewListButton()
  typeListName('New List from cart')
  clickOnCreateListButton()
  await screen.findByRole('heading', { name: 'New List from cart' })

  expect(
    await screen.findByText(
      'Patatas prefritas corte grueso Hacendado ultracongeladas',
    ),
  ).toBeInTheDocument()
})
