import { screen, within } from '@testing-library/react'

import {
  goToCategories,
  minimizeHelpDeskChatWithFloatingButton,
  openHelpDeskChat,
} from '../helpers'
import { NetworkResponses, configure, wrap } from 'wrapito'

import { activeFeatureFlags } from '__tests__/helpers'
import { App, history } from 'app'
import { categories } from 'app/catalog/__scenarios__/categories'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
import { recommendations } from 'app/catalog/__scenarios__/recommendations'
import { ChatSetupMother } from 'app/chat/__scenarios__/ChatSetupMother'
import { CheckoutMother } from 'app/checkout/__scenarios__/CheckoutMother'
import { OrderMother } from 'app/order/__scenarios__/OrderMother'
import { order } from 'app/order/__scenarios__/orderDetail'
import { emptyOrderList } from 'app/order/__scenarios__/orderList'
import {
  moodStep,
  serviceRating,
} from 'app/service-rating/__scenarios__/serviceRating'
import { shoppingLists } from 'pages/shopping-lists/__tests__/scenarios'
import { knownFeatureFlags } from 'services/feature-flags'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Chat - Pages visibility', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  beforeEach(() => {
    activeFeatureFlags([knownFeatureFlags.NEW_SUPPORT_CHAT])
  })

  describe('should see the chat button', () => {
    it('on the home page', async () => {
      const responses = [{ path: '/home/', responseBody: homeWithGrid }]
      wrap(App).atPath('/').withNetwork(responses).mount()

      await screen.findByText('Novedades')

      expect(
        screen.getByRole('button', { name: /Open chat/i }),
      ).toBeInTheDocument()
    })

    it('on the checkout page', async () => {
      const responses = [
        {
          path: '/customers/1/checkouts/5/',
          multipleResponses: [
            { responseBody: CheckoutMother.filled() },
            { responseBody: CheckoutMother.confirmed() },
          ],
        },
      ]
      wrap(App).atPath('/checkout/5').withNetwork(responses).withLogin().mount()

      await screen.findByRole('heading', { name: 'Checkout', level: 1 })

      expect(
        screen.getByRole('button', { name: /Open chat/i }),
      ).toBeInTheDocument()
    })
  })

  describe('should not see the chat button', () => {
    it('on the categories page', async () => {
      const responses = [{ path: '/categories/', responseBody: categories }]
      wrap(App).atPath('/categories').withNetwork(responses).withLogin().mount()

      await screen.findAllByText('Aceite, especias y salsas')

      expect(
        screen.queryByRole('button', { name: /Open chat/i }),
      ).not.toBeInTheDocument()
    })

    it('on my products page', async () => {
      const responses = [
        {
          path: '/customers/1/recommendations/myregulars/',
          responseBody: recommendations,
        },
      ]
      wrap(App)
        .atPath('/my-products')
        .withNetwork(responses)
        .withLogin()
        .mount()
      await screen.findByText(
        'Fideos orientales Yakisoba sabor pollo Hacendado',
      )

      expect(
        screen.queryByRole('button', { name: /Open chat/i }),
      ).not.toBeInTheDocument()
    })

    it('on the shopping lists page', async () => {
      wrap(App)
        .atPath('/shopping-lists')
        .withNetwork([
          { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
        ])
        .withLogin()
        .mount()

      await screen.findByRole('heading', { level: 1, name: 'Lists' })

      expect(
        screen.queryByRole('button', { name: /Open chat/i }),
      ).not.toBeInTheDocument()
    })

    it('on the user area page', async () => {
      const responses = [
        { path: '/customers/1/orders/', responseBody: emptyOrderList },
      ]
      wrap(App)
        .atPath('/user-area/orders')
        .withNetwork(responses)
        .withLogin()
        .mount()
      await screen.findByText('My orders')

      expect(
        screen.queryByRole('button', { name: /Open chat/i }),
      ).not.toBeInTheDocument()
    })

    it('on the edit order page', async () => {
      const responses = [
        {
          path: `/customers/1/orders/1235/`,
          responseBody: order,
        },
      ]
      wrap(App)
        .atPath('/orders/1235/edit/products')
        .withNetwork(responses)
        .withLogin()
        .mount()

      await screen.findByText('Categories')

      expect(
        screen.queryByRole('button', { name: /Open chat/i }),
      ).not.toBeInTheDocument()
    })

    it('on the order confirmation page', async () => {
      wrap(App)
        .atPath('/purchases/44051/confirmation')
        .withNetwork([
          {
            path: '/customers/1/orders/44051/',
            responseBody: OrderMother.confirmed(),
          },
        ])
        .withLogin()
        .mount()

      await screen.findByRole('region', {
        name: 'Order 44051 confirmed',
      })

      expect(
        screen.queryByRole('button', { name: /Open chat/i }),
      ).not.toBeInTheDocument()
    })

    it('on the search products', async () => {
      wrap(App)
        .atPath('/search-results?query=jam')
        .withNetwork()
        .withLogin()
        .mount()

      await screen.findByText(/Showing 3 results for 'jam'/)

      expect(
        screen.queryByRole('button', { name: /Open chat/i }),
      ).not.toBeInTheDocument()
    })

    it('on the password recovery page', async () => {
      wrap(App).atPath(`/password-recovery/12345`).mount()

      await screen.findAllByText('Reset password')

      expect(
        screen.queryByRole('button', { name: /Open chat/i }),
      ).not.toBeInTheDocument()
    })

    it('on service rating page', async () => {
      const responses = [
        {
          path: `/service-rating/12345/`,
          responseBody: serviceRating,
        },
        {
          path: `/service-rating/12345/steps/1/`,
          responseBody: moodStep,
        },
      ]
      wrap(App).atPath('/service-rating/12345').withNetwork(responses).mount()

      await screen.findByText('How was your order?')

      expect(
        screen.queryByRole('button', { name: /Open chat/i }),
      ).not.toBeInTheDocument()
    })
  })

  describe('on change between allowed and not allowed pages after init a chat', () => {
    it('should keep the chat opened', async () => {
      const responses: NetworkResponses = [
        { path: '/home/', responseBody: homeWithGrid },
        { path: '/categories/', responseBody: categories },
        {
          path: '/conversations/chats/setup/',
          method: 'post',
          requestBody: {
            anonymous_id: '10000000-1000-4000-8000-100000000000',
          },
          responseBody: ChatSetupMother.default(),
        },
      ]
      wrap(App).atPath('/').withNetwork(responses).mount()

      await screen.findByText('Novedades')
      openHelpDeskChat()
      const helpDeskChat = await screen.findByLabelText('Customer service')
      const messages = await within(helpDeskChat).findByRole('log')
      goToCategories()
      await screen.findAllByText('Aceite, especias y salsas')

      expect(messages).toBeInTheDocument()
    })

    it('should allow to minimize the chat', async () => {
      const responses: NetworkResponses = [
        { path: '/home/', responseBody: homeWithGrid },
        { path: '/categories/', responseBody: categories },
        {
          path: '/conversations/chats/setup/',
          method: 'post',
          requestBody: {
            anonymous_id: '10000000-1000-4000-8000-100000000000',
          },
          responseBody: ChatSetupMother.default(),
        },
      ]
      wrap(App).atPath('/').withNetwork(responses).mount()

      await screen.findByText('Novedades')
      openHelpDeskChat()
      const helpDeskChat = await screen.findByLabelText('Customer service')
      await within(helpDeskChat).findByRole('log')
      goToCategories()
      await screen.findAllByText('Aceite, especias y salsas')
      minimizeHelpDeskChatWithFloatingButton()

      expect(
        screen.getByRole('button', { name: /Open chat/i }),
      ).toBeInTheDocument()
    })
  })
})
