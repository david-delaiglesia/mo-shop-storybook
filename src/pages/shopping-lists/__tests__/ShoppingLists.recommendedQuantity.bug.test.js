import { screen } from '@testing-library/react'

import { goToHome } from '../../home/__tests__/helpers'
import { shoppingListDetail } from './scenarios'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { englishHomeWithRecommendations } from 'app/catalog/__scenarios__/home'
import { cookies } from 'app/cookie/__scenarios__/cookies'
import { addProductFromDetail, openProductDetail } from 'pages/helpers'
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

afterEach(() => {
  vi.clearAllMocks()
})

it('adds the default quantity when opening detail from shopping list', async () => {
  const shoppingListWithRecommendedQuantity = cloneDeep(shoppingListDetail)
  shoppingListWithRecommendedQuantity.items[0].recommended_quantity = 2.0

  wrap(App)
    .atPath('/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/')
    .withNetwork([
      {
        path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/',
        responseBody: shoppingListWithRecommendedQuantity,
      },
    ])
    .withLogin()
    .mount()

  await screen.findByRole('heading', { name: 'My second list', level: 1 })

  await openProductDetail('strawberry and banana Kefir drink Hacendado')

  const productDetail = await screen.findByRole('dialog')

  await addProductFromDetail()

  await screen.findByLabelText('Show cart')
  expect(productDetail).toHaveTextContent('1 unit')
})

it('adds the default quantity when opening detail from shopping list', async () => {
  const shoppingListWithRecommendedQuantity = cloneDeep(shoppingListDetail)
  const listProduct = shoppingListWithRecommendedQuantity.items[0]
  listProduct.recommended_quantity = 2.0

  const homeDetailCopy = cloneDeep(englishHomeWithRecommendations)
  homeDetailCopy.sections[1].content.items[0].id = listProduct.product.id
  homeDetailCopy.sections[1].content.items[0].display_name =
    listProduct.product.display_name

  wrap(App)
    .atPath('/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/')
    .withNetwork([
      {
        path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/',
        responseBody: shoppingListWithRecommendedQuantity,
      },
      { path: '/customers/1/home/', responseBody: homeDetailCopy },
    ])
    .withLogin()
    .mount()

  await screen.findByRole('heading', { name: 'My second list', level: 1 })

  goToHome()

  await screen.findByText('Recommended for you')

  expect(
    screen.getByRole('button', { name: 'Add to cart' }),
  ).toBeInTheDocument()
})
