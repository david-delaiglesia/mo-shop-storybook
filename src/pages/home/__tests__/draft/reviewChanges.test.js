import { screen } from '@testing-library/react'

import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { cart } from 'app/cart/__scenarios__/cart'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
import { orderCart, orderCartDraft } from 'app/order/__scenarios__/orderCart'
import { order } from 'app/order/__scenarios__/orderDetail'
import { seeChangesButtonDraftAlert } from 'pages/helpers'
import { shoppingLists } from 'pages/shopping-lists/__tests__/scenarios'
import { Storage } from 'services/storage'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

configure({
  changeRoute: (route) => history.push(route),
})

afterEach(() => {
  Storage.clear()
  localStorage.clear()
})

it('should go to the order when the user clicks on the modal draft button view changes', async () => {
  const pushSpy = vi.spyOn(history, 'push')

  const responses = [
    { path: '/customers/1/home/', responseBody: homeWithGrid },
    {
      path: '/customers/1/cart/',
      multipleResponses: [{ responseBody: cart }],
    },
    {
      path: '/customers/1/orders/cart/drafts/?lang=en&wh=vlc1',
      responseBody: {
        order_id: 26523,
        payment_status: 0,
        start_date: '2023-11-13T19:00:00Z',
        end_date: '2023-11-13T20:00:00Z',
        service_rating_token: null,
        warehouse_code: 'vlc1',
      },
    },
    {
      path: `/customers/1/orders/?lang=en&wh=vlc1&page=1`,
      responseBody: {},
    },
    {
      path: `/customers/1/orders/26523/?lang=en&wh=vlc1`,
      responseBody: order,
    },
    {
      path: `/customers/1/orders/26523/cart/?lang=en&wh=vlc1`,
      responseBody: orderCart,
    },
    {
      path: '/customers/1/orders/26523/cart/draft/?lang=en&wh=vlc1',
      multipleResponses: [{ responseBody: orderCartDraft }],
    },
    { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
  ]
  wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

  await screen.findByRole('button', {
    name: 'See changes',
  })

  seeChangesButtonDraftAlert()

  await screen.findByText('Products in my order')

  const cartProducts = screen.getAllByTestId('cart-product-cell')

  expect(cartProducts[0]).toHaveTextContent(
    'Uva blanca con semillas2,11 € /200 gIn cart5 kgAdd to cart',
  )
  expect(pushSpy).toHaveBeenCalledTimes(2)
})
