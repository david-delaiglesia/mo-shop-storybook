import { screen, waitFor, within } from '@testing-library/react'

import { EditOrderScenario } from './EditOrderScenario'
import { confirmOrderEdition } from './helpers'
import userEvent from '@testing-library/user-event'
import { configure, wrap } from 'wrapito'

import { activeFeatureFlags } from '__tests__/helpers'
import { App, history } from 'app'
import {
  MaxSizeAreaExceededException,
  MinPurchaseAmountNotReachedException,
} from 'app/cart'
import { CartMother } from 'app/cart/__scenarios__/CartMother'
import { OrderMother } from 'app/order/__scenarios__/OrderMother'
import { preparedLines } from 'app/order/__scenarios__/orderDetail'
import { PaymentTPV } from 'app/payment'
import { PaymentAuthenticationMother } from 'app/payment/__scenarios__/PaymentAuthenticationMother'
import { authorizeMIT } from 'pages/user-area/__tests__/helpers'
import { knownFeatureFlags } from 'services/feature-flags'
import { Storage } from 'services/storage'
import { STORAGE_KEYS } from 'services/storage/constants'
import { Support } from 'services/support'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

configure({
  changeRoute: (route) => history.push(route),
})

const ORDER_ID = OrderMother.DEFAULT_ORDER_ID

describe('Edit order - Lines endpoint strategy', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('when ORDER_EDIT_LINES_NEW_STRATEGY flag is ON', () => {
    beforeEach(() => {
      activeFeatureFlags([knownFeatureFlags.ORDER_EDIT_LINES_NEW_STRATEGY])
    })

    it('should show Order updated modal after confirming edition', async () => {
      wrap(App)
        .atPath(`/orders/${ORDER_ID}/edit/products/`)
        .withNetwork(EditOrderScenario.confirmed())
        .withLogin()
        .mount()

      await screen.findByText('Products in my order')
      confirmOrderEdition()

      await screen.findByText('Order updated')
      expect(`/customers/1/orders/${ORDER_ID}/lines/`).toHaveBeenFetchedWith({
        method: 'PUT',
        body: {
          lines: [
            { id: 1, quantity: 5, product_id: '8731' },
            { id: 2, quantity: 5, product_id: '3317' },
          ],
        },
      })
    })

    it('should redirect to TPV when PUT /lines/ returns 202 with redirection (no MIT)', async () => {
      vi.spyOn(PaymentTPV, 'autoRedirectToPaymentAuth')

      const authUuid = 'auth-uuid-123'
      const okSearchParams = new URLSearchParams({
        status: 'success',
        payment_method: 'any',
        payment_flow: 'update_order_lines',
        payment_authentication_uuid: authUuid,
      })
      const koSearchParams = new URLSearchParams({
        status: 'failure',
        payment_method: 'any',
        payment_flow: 'update_order_lines',
        payment_authentication_uuid: authUuid,
      })

      wrap(App)
        .atPath(`/orders/${ORDER_ID}/edit/products/`)
        .withNetwork([
          ...EditOrderScenario.confirmed(),
          {
            path: `/customers/1/orders/${ORDER_ID}/lines/`,
            method: 'put',
            status: 202,
            requestBody: {
              lines: [
                { id: 1, quantity: 5, product_id: '8731' },
                { id: 2, quantity: 5, product_id: '3317' },
              ],
            },
            responseBody: {
              authentication_mode: 'redirection',
              authentication_uuid: authUuid,
              exemption: null,
            },
          },
          {
            path: `/customers/1/orders/${ORDER_ID}/authentication/?${new URLSearchParams(
              {
                lang: 'en',
                wh: 'vlc1',
                authentication_uuid: authUuid,
                ok_url: `http://localhost:3000/orders/${ORDER_ID}/edit/products/?${okSearchParams}`,
                ko_url: `http://localhost:3000/orders/${ORDER_ID}/edit/products/?${koSearchParams}`,
              },
            )}`,
            catchParams: true,
            responseBody: PaymentAuthenticationMother.redsysCard(),
          },
        ])
        .withLogin()
        .mount()

      await screen.findByText('Products in my order')
      confirmOrderEdition()

      await waitFor(() => {
        expect(
          PaymentTPV.autoRedirectToPaymentAuth,
        ).toHaveBeenCalledExactlyOnceWith(
          PaymentAuthenticationMother.redsysCard().params,
        )
      })
    })

    it('should redirect to TPV as MIT after accepting authorisation modal', async () => {
      vi.spyOn(PaymentTPV, 'autoRedirectToPaymentAuth')

      const authUuid = 'auth-uuid-mit'
      const okSearchParams = new URLSearchParams({
        status: 'success',
        payment_method: 'any',
        payment_flow: 'update_order_lines',
        payment_authentication_uuid: authUuid,
      })
      const koSearchParams = new URLSearchParams({
        status: 'failure',
        payment_method: 'any',
        payment_flow: 'update_order_lines',
        payment_authentication_uuid: authUuid,
      })

      wrap(App)
        .atPath(`/orders/${ORDER_ID}/edit/products/`)
        .withNetwork([
          ...EditOrderScenario.confirmed(),
          {
            path: `/customers/1/orders/${ORDER_ID}/lines/`,
            method: 'put',
            status: 202,
            requestBody: {
              lines: [
                { id: 1, quantity: 5, product_id: '8731' },
                { id: 2, quantity: 5, product_id: '3317' },
              ],
            },
            responseBody: {
              authentication_mode: 'redirection',
              authentication_uuid: authUuid,
              exemption: 'MIT',
            },
          },
          {
            path: `/customers/1/orders/${ORDER_ID}/authentication/?${new URLSearchParams(
              {
                lang: 'en',
                wh: 'vlc1',
                authentication_uuid: authUuid,
                ok_url: `http://localhost:3000/orders/${ORDER_ID}/edit/products/?${okSearchParams}`,
                ko_url: `http://localhost:3000/orders/${ORDER_ID}/edit/products/?${koSearchParams}`,
              },
            )}`,
            catchParams: true,
            responseBody: PaymentAuthenticationMother.redsysCard(),
          },
        ])
        .withLogin()
        .mount()

      await screen.findByText('Products in my order')
      confirmOrderEdition()

      await screen.findByRole('dialog', {
        name: 'Authorisation required',
      })
      authorizeMIT()

      await waitFor(() => {
        expect(
          PaymentTPV.autoRedirectToPaymentAuth,
        ).toHaveBeenCalledExactlyOnceWith(
          PaymentAuthenticationMother.redsysCard().params,
        )
      })
      expect(Tracker.sendInteraction).toHaveBeenCalledWith(
        'start_psd2_flow',
        expect.objectContaining({ is_MIT: true }),
      )
    })

    it('should close authorisation modal without redirecting when user cancels', async () => {
      vi.spyOn(PaymentTPV, 'autoRedirectToPaymentAuth')

      const authUuid = 'auth-uuid-mit'

      wrap(App)
        .atPath(`/orders/${ORDER_ID}/edit/products/`)
        .withNetwork([
          ...EditOrderScenario.confirmed(),
          {
            path: `/customers/1/orders/${ORDER_ID}/lines/`,
            method: 'put',
            status: 202,
            requestBody: {
              lines: [
                { id: 1, quantity: 5, product_id: '8731' },
                { id: 2, quantity: 5, product_id: '3317' },
              ],
            },
            responseBody: {
              authentication_mode: 'redirection',
              authentication_uuid: authUuid,
              exemption: 'MIT',
            },
          },
        ])
        .withLogin()
        .mount()

      await screen.findByText('Products in my order')
      const saveButton = screen.getByRole('button', { name: /save changes/i })
      confirmOrderEdition()

      const mitModal = await screen.findByRole('dialog', {
        name: 'Authorisation required',
      })
      expect(within(saveButton).getByLabelText('loader')).toBeInTheDocument()

      userEvent.click(within(mitModal).getByRole('button', { name: 'Back' }))

      await waitFor(() => {
        expect(
          screen.queryByRole('dialog', { name: 'Authorisation required' }),
        ).not.toBeInTheDocument()
      })
      expect(
        within(saveButton).queryByLabelText('loader'),
      ).not.toBeInTheDocument()
      expect(PaymentTPV.autoRedirectToPaymentAuth).not.toHaveBeenCalled()
    })

    describe('Auth TPV callbacks', () => {
      const authUuid = 'auth-uuid-callback'
      const okSearchParams = new URLSearchParams({
        status: 'success',
        payment_method: 'any',
        payment_flow: 'update_order_lines',
        payment_authentication_uuid: authUuid,
      })
      const koSearchParams = new URLSearchParams({
        status: 'failure',
        payment_method: 'any',
        payment_flow: 'update_order_lines',
        payment_authentication_uuid: authUuid,
      })

      it('should navigate to order detail when returning from TPV with success', async () => {
        Storage.setItem(STORAGE_KEYS.SCA_CONFIRM, CartMother.simple())

        wrap(App)
          .atPath(`/orders/${ORDER_ID}/edit/products/?${okSearchParams}`)
          .withNetwork([
            {
              path: `/customers/1/orders/${ORDER_ID}/`,
              responseBody: OrderMother.confirmed(),
            },
            {
              path: `/customers/1/orders/${ORDER_ID}/cart/`,
              responseBody: CartMother.simple(),
            },
            {
              path: `/customers/1/orders/${ORDER_ID}/lines/prepared/`,
              responseBody: preparedLines,
            },
          ])
          .withLogin()
          .mount()

        await screen.findByText('Order updated')
      })
      it('should show payment authentication failed modal when returning from TPV with failure', async () => {
        vi.spyOn(Storage, 'setFailedAuthPaymentModal')

        wrap(App)
          .atPath(`/orders/${ORDER_ID}/edit/products/?${koSearchParams}`)
          .withNetwork([
            {
              path: `/customers/1/orders/${ORDER_ID}/`,
              responseBody: OrderMother.confirmed(),
            },
            {
              path: `/customers/1/orders/${ORDER_ID}/cart/`,
              responseBody: CartMother.simple(),
            },
          ])
          .withLogin()
          .mount()

        await screen.findByRole('dialog', {
          name: 'The transaction could not be carried out',
        })
        expect(Storage.setFailedAuthPaymentModal).toHaveBeenCalled()
        expect(Support.showButton).toHaveBeenCalled()
      })

      it('should hide the auth failed modal when user clicks Retry', async () => {
        wrap(App)
          .atPath(`/orders/${ORDER_ID}/edit/products/?${koSearchParams}`)
          .withNetwork([
            {
              path: `/customers/1/orders/${ORDER_ID}/`,
              responseBody: OrderMother.confirmed(),
            },
            {
              path: `/customers/1/orders/${ORDER_ID}/cart/`,
              responseBody: CartMother.simple(),
            },
          ])
          .withLogin()
          .mount()

        const failedModal = await screen.findByRole('dialog', {
          name: 'The transaction could not be carried out',
        })
        userEvent.click(
          within(failedModal).getByRole('button', { name: 'Retry' }),
        )

        await waitFor(() => {
          expect(failedModal).not.toBeInTheDocument()
        })
      })
    })

    describe('Error handling', () => {
      it('should show MaxSizeAreaExceededModal when PUT /lines/ returns MaxSizeAreaExceededException', async () => {
        wrap(App)
          .atPath(`/orders/${ORDER_ID}/edit/products/`)
          .withNetwork([
            ...EditOrderScenario.confirmed(),
            {
              path: `/customers/1/orders/${ORDER_ID}/lines/`,
              method: 'put',
              status: 400,
              requestBody: {
                lines: [
                  { id: 1, quantity: 5, product_id: '8731' },
                  { id: 2, quantity: 5, product_id: '3317' },
                ],
              },
              responseBody: {
                errors: [
                  MaxSizeAreaExceededException.toJSON({
                    areas_exceeded: {
                      ambient: true,
                      chilled: false,
                      frozen: false,
                    },
                  }),
                ],
              },
            },
          ])
          .withLogin()
          .mount()

        await screen.findByText('Products in my order')
        confirmOrderEdition()

        expect(
          await screen.findByRole('dialog', { name: 'Order too large' }),
        ).toBeInTheDocument()
      })

      it('should show minimum purchase alert when PUT /lines/ returns MinPurchaseAmountNotReachedException', async () => {
        wrap(App)
          .atPath(`/orders/${ORDER_ID}/edit/products/`)
          .withNetwork([
            ...EditOrderScenario.confirmed(),
            {
              path: `/customers/1/orders/${ORDER_ID}/lines/`,
              method: 'put',
              status: 400,
              requestBody: {
                lines: [
                  { id: 1, quantity: 5, product_id: '8731' },
                  { id: 2, quantity: 5, product_id: '3317' },
                ],
              },
              responseBody: {
                errors: [
                  MinPurchaseAmountNotReachedException.toJSON({
                    detail:
                      'Remember that to place your order the minimum amount is €60',
                  }),
                ],
              },
            },
          ])
          .withLogin()
          .mount()

        await screen.findByText('Products in my order')
        confirmOrderEdition()

        expect(
          await screen.findByRole('dialog', {
            name: 'Minimum order. Remember that to place your order the minimum amount is €60',
          }),
        ).toBeInTheDocument()
      })
    })
  })
})
