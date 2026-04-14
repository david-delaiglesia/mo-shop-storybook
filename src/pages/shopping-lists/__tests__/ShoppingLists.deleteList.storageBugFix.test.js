import { screen } from '@testing-library/react'

import {
  clickIntoOptionsButton,
  confirmListDeletion,
  deleteList,
} from './helpers'
import { shoppingListDetail, shoppingLists } from './scenarios'
import { vi } from 'vitest'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { cookies } from 'app/cookie/__scenarios__/cookies'
import { Cookie } from 'services/cookie'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

configure({
  changeRoute: (route) => history.push(route),
})

beforeEach(() => {
  vi.spyOn(Cookie, 'get').mockImplementation((cookie) => cookies[cookie])
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('when the application dos not have the key MO-shopping_list_detail in the local storage', () => {
  it('should allow to delete a shopping list', async () => {
    wrap(App)
      .atPath('/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/')
      .withNetwork([
        {
          path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/',
          responseBody: shoppingListDetail,
        },
        {
          path: '/customers/1/shopping-lists/',
          responseBody: shoppingLists,
        },
      ])
      .withLogin()
      .mount()

    await screen.findByRole('heading', { name: 'My second list', level: 1 })
    clickIntoOptionsButton()
    deleteList()
    const dialog = screen.getByRole('dialog', {
      name: 'Do you want to delete this list?',
    })
    confirmListDeletion(dialog)
    await screen.findByRole('heading', { level: 1, name: 'Lists' })
  })
})
