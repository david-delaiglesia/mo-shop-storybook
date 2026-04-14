import { screen, within } from '@testing-library/react'

import { shoppingListDetail } from './scenarios'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { cookies } from 'app/cookie/__scenarios__/cookies'
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

it('shows the amount recommended for a product', async () => {
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
  const [strawberryBananaKeffir] = screen.getAllByTestId('product-cell')

  expect(
    within(strawberryBananaKeffir).getByRole('button', {
      name: 'Add 2 units to cart',
    }),
  ).toBeInTheDocument()
})
