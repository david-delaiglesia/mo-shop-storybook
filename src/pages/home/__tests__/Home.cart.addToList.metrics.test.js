import { screen } from '@testing-library/react'

import { clickOnSaveToNewListButton, openCartActionsMenu } from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { cart } from 'app/cart/__scenarios__/cart'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
import {
  clickOnCreateListButton,
  openCart,
  typeListName,
} from 'pages/home/__tests__/helpers'
import { shoppingListDetail } from 'pages/shopping-lists/__tests__/scenarios'
import { Tracker } from 'services/tracker'
import { cloneDeep } from 'utils/objects'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

configure({
  changeRoute: (route) => history.push(route),
})

it('should send metric when clicking save cart as list menu action', async () => {
  const responses = [
    { path: '/customers/1/home/', responseBody: homeWithGrid },
    { path: '/customers/1/cart/', responseBody: cart },
  ]
  wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

  await screen.findByText('Novedades')

  openCart()
  openCartActionsMenu()
  clickOnSaveToNewListButton()

  expect(Tracker.sendInteraction).toHaveBeenCalledWith(
    'cart_option_save_cart_as_list_click',
  )
})

it('should send metric when saving a list from cart', async () => {
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

  await screen.findByRole('heading', {
    name: 'New List from cart',
    level: 1,
  })

  expect(Tracker.sendInteraction).toHaveBeenCalledWith(
    'save_new_shopping_list_button_click',
    {
      source: 'cart',
      name: 'New List from cart',
    },
  )
})
