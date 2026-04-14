import { screen } from '@testing-library/react'

import { addCartToOngoingOrder } from '../helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import {
  cart,
  cartWithOngoingOrder,
  expensiveCartRequest,
  mergedCart,
} from 'app/cart/__scenarios__/cart'
import {
  categories,
  categoryDetail,
} from 'app/catalog/__scenarios__/categories'
import { homeWithGrid, homeWithWidget } from 'app/catalog/__scenarios__/home'
import { orderCart, orderCartDraft } from 'app/order/__scenarios__/orderCart'
import { order } from 'app/order/__scenarios__/orderDetail'
import { laterButtonDraftAlert, openCart } from 'pages/helpers'
import { shoppingLists } from 'pages/shopping-lists/__tests__/scenarios'
import { Storage } from 'services/storage'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Home - Cart draft', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    Storage.clear()
    localStorage.clear()
  })

  describe('when arrive at home', () => {
    it('should not check if has a draft when is not connected', async () => {
      const responses = [
        { path: '/customers/1/home/', responseBody: homeWithGrid },
        {
          path: '/customers/1/cart/',
          multipleResponses: [{ responseBody: cart }],
        },
      ]
      wrap(App).atPath('/').withNetwork(responses).mount()

      await screen.findByLabelText('Show cart')
      expect('/customers/undefined/orders/cart/drafts/').not.toHaveBeenFetched()
    })

    it('should check if has a draft when is connected', async () => {
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
      ]
      wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

      await screen.findByLabelText('Show cart')

      expect('/customers/1/orders/cart/drafts/').toHaveBeenFetched()
    })

    it('should show the modal if the user has one draft', async () => {
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
      ]
      wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

      await screen.findByLabelText('Show cart')
      expect(
        screen.getByRole('heading', {
          name: 'You have made unsaved changes to your order',
        }),
      ).toBeInTheDocument()
    })

    it('should not show the modal if the user has zero draft', async () => {
      const responses = [
        { path: '/customers/1/home/', responseBody: homeWithGrid },
        {
          path: '/customers/1/cart/',
          multipleResponses: [{ responseBody: cart }],
        },
        {
          path: '/customers/1/orders/cart/drafts/?lang=en&wh=vlc1',
          responseBody: undefined,
        },
      ]
      wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

      await screen.findByLabelText('Show cart')

      expect(
        screen.queryByRole('heading', {
          name: 'draft_unsaved_changes_title',
        }),
      ).not.toBeInTheDocument()
    })

    it('should stay on the same page when the user clicks on the modal draft button later', async () => {
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
      ]
      wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

      const home = await screen.findByRole('heading', {
        name: 'Mercadona online shopping',
      })

      const modal = screen.getByRole('heading', {
        name: 'You have made unsaved changes to your order',
      })

      laterButtonDraftAlert()
      expect(modal).not.toBeInTheDocument()

      expect(home).toBeInTheDocument()
    })

    it('should not show the draft modal when the api response is empty', async () => {
      Storage.setFailedAuthPaymentModal(false)

      const responses = [
        { path: '/customers/1/home/', responseBody: homeWithGrid },
        {
          path: '/customers/1/cart/',
          multipleResponses: [{ responseBody: cart }],
        },
        {
          path: '/customers/1/orders/cart/drafts/?lang=en&wh=vlc1',
          status: 404,
          responseBody: undefined,
        },
      ]
      wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

      await screen.findByLabelText('Show cart')

      const draftAlertModal = screen.queryByRole('button', {
        name: 'See changes',
      })

      expect(draftAlertModal).not.toBeInTheDocument()
    })

    it('should not show the draft modal when Storage as failedAuthPaymentModal is true', async () => {
      Storage.setFailedAuthPaymentModal(true)
      const responses = [
        { path: '/customers/1/home/', responseBody: homeWithGrid },
        {
          path: '/customers/1/cart/',
          multipleResponses: [{ responseBody: cart }],
        },
      ]
      wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

      await screen.findByLabelText('Show cart')

      const draftAlertModal = screen.queryByRole('button', {
        name: 'See changes',
      })
      expect(draftAlertModal).not.toBeInTheDocument()
    })

    it('should create a draft when the user add products to a current order', async () => {
      const defaultResponses = [
        { path: '/customers/1/home/', responseBody: homeWithWidget },
        {
          path: '/customers/1/orders/44051/cart/validate-merge/',
          method: 'post',
          requestBody: expensiveCartRequest,
          responseBody: { ...mergedCart },
        },
        {
          path: '/customers/1/orders/44051/',
          responseBody: { ...order },
        },
        { path: '/categories/', responseBody: categories },
        {
          path: `/categories/${categoryDetail.id}/`,
          responseBody: categoryDetail,
        },
        { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
      ]

      wrap(App)
        .atPath('/')
        .withNetwork(defaultResponses)
        .withLogin({ cart: cartWithOngoingOrder })
        .mount()

      await screen.findByText('Próxima entrega')
      openCart()
      await screen.findByText('Add to current order')
      addCartToOngoingOrder()
      await screen.findByText('Products in my order')

      expect(
        '/customers/1/orders/44051/cart/draft/?lang=en&wh=vlc1',
      ).toHaveBeenFetchedWith({
        method: 'PUT',
        body: {
          origin: 'from_merge_cart',
          id: '57e2fd9e-d5ce-4f4e-964a-b629fe3c831e',
          lines: [
            { quantity: 200, product_id: '8731', sources: [] },
            { quantity: 1, product_id: '28491', sources: [] },
          ],
        },
      })
    })
  })
})
