import { screen, within } from '@testing-library/react'

import { shoppingListDetail } from './scenarios'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { similarResults } from 'app/catalog/__tests__/similar.mock'
import { viewSimilarProducts } from 'pages/helpers'
import { cloneDeep } from 'utils/objects'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

configure({
  changeRoute: (route) => history.push(route),
})

it('should not display more actions button', async () => {
  const shoppingListWithUnpublishedProduct = cloneDeep(shoppingListDetail)
  shoppingListWithUnpublishedProduct.items[0].product.published = false

  wrap(App)
    .atPath('/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/')
    .withNetwork([
      {
        path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/',
        responseBody: shoppingListWithUnpublishedProduct,
      },
      {
        path: `/products/52750/similars/?exclude=28411&lang=es&wh=vlc1`,
        responseBody: similarResults,
      },
    ])
    .withLogin()
    .mount()

  await screen.findByRole('heading', { name: 'My second list', level: 1 })
  viewSimilarProducts('strawberry and banana Kefir drink Hacendado')

  const dialog = await screen.findByRole('dialog')
  expect(
    within(dialog).queryAllByRole('button', { name: 'more actions' }),
  ).toHaveLength(0)
})
