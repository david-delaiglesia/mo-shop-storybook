import { cleanup, screen, waitFor, within } from '@testing-library/react'

import {
  closeSCAWithoutSaving,
  confirmOrderEdition,
  incrementProductInCart,
  tryAnotherPaymentMethod,
} from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { CartMother } from 'app/cart/__scenarios__/CartMother'
import { HomeSectionMother } from 'app/home/__scenarios__/HomeSectionMother'
import { HomeSectionsBuilder } from 'app/home/__scenarios__/HomeSectionsBuilder'
import { OrderMother } from 'app/order/__scenarios__/OrderMother'
import { preparedLines } from 'app/order/__scenarios__/orderDetail'
import {
  PaymentAuthenticationRequiredException,
  PaymentTPV,
  PhoneWithoutBizumException,
} from 'app/payment'
import { PaymentAuthenticationMother } from 'app/payment/__scenarios__/PaymentAuthenticationMother'
import { PaymentMethodMother } from 'app/payment/__scenarios__/PaymentMethodMother'
import {
  clickToAddNewPaymentMethod,
  fillBizumForm,
  selectNewPaymentMethodBizum,
  selectNewPaymentMethodCard,
} from 'pages/__tests__/helper'
import { selectExistentPaymentMethod } from 'pages/__tests__/helpers/payment'
import { confirmAddPaymentMethod, savePaymentMethod } from 'pages/helpers'
import { Storage } from 'services/storage'
import { STORAGE_KEYS } from 'services/storage/constants'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

const OK_SEARCH_PARAMS = new URLSearchParams({
  status: 'success',
  payment_method: 'bizum',
  payment_flow: 'update_order_lines',
  payment_authentication_uuid: 'payment_authentication_uuid',
})
const KO_SEARCH_PARAMS = new URLSearchParams({
  status: 'failure',
  payment_method: 'bizum',
  payment_flow: 'update_order_lines',
  payment_authentication_uuid: 'payment_authentication_uuid',
})

const NEW_BIZUM_OK_SEARCH_PARAMS = new URLSearchParams({
  status: 'success',
  payment_method: 'bizum',
  payment_flow: 'update_order_payment_method',
  payment_authentication_uuid: 'payment_bizum_authentication_uuid',
})
const NEW_BIZUM_KO_SEARCH_PARAMS = new URLSearchParams({
  status: 'failure',
  payment_method: 'bizum',
  payment_flow: 'update_order_payment_method',
  payment_authentication_uuid: 'payment_bizum_authentication_uuid',
})

describe('Edit order - Bizum', () => {
  configure({
    changeRoute: history.push,
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.resetAllMocks()
    localStorage.clear()
    cleanup()
  })

  it('should redirect to TPV on authentication_required exception', async () => {
    vi.spyOn(PaymentTPV, 'autoRedirectToPaymentAuth')

    wrap(App)
      .atPath('/orders/44051/edit/products')
      .withNetwork([
        {
          path: '/customers/1/orders/44051/',
          responseBody: OrderMother.confirmedWithBizum(),
        },
        {
          path: '/customers/1/orders/44051/cart/',
          responseBody: CartMother.simple(),
        },
        {
          path: '/customers/1/orders/44051/cart/',
          method: 'put',
          status: 400,
          requestBody: {
            cart: {
              id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
              lines: [
                { id: 1, quantity: 6, product_id: '8731', sources: ['+CA'] },
                { id: 2, quantity: 5, product_id: '3317' },
              ],
            },
          },
          responseBody: {
            errors: [
              PaymentAuthenticationRequiredException.toJSON({
                authentication_uuid: 'payment_authentication_uuid',
              }),
            ],
          },
        },
        {
          path: `/customers/1/orders/44051/authentication/?${new URLSearchParams(
            {
              lang: 'en',
              wh: 'vlc1',
              authentication_uuid: 'payment_authentication_uuid',
              ok_url: `http://localhost:3000/orders/44051/edit/products?${OK_SEARCH_PARAMS}`,
              ko_url: `http://localhost:3000/orders/44051/edit/products?${KO_SEARCH_PARAMS}`,
            },
          )}`,
          catchParams: true,
          responseBody: PaymentAuthenticationMother.redsysBizum(),
        },
      ])
      .withLogin()
      .mount()

    await screen.findByText('Products in my order')
    await screen.findByText('Modify order')
    incrementProductInCart()
    confirmOrderEdition()

    await waitFor(() => {
      expect(
        PaymentTPV.autoRedirectToPaymentAuth,
      ).toHaveBeenCalledExactlyOnceWith(
        PaymentAuthenticationMother.redsysBizum().params,
      )
    })
  })

  describe('Auth TPV callbacks', () => {
    it('should redirect to success order details on authentication success', async () => {
      vi.spyOn(history, 'push')
      Storage.setItem(STORAGE_KEYS.SCA_CONFIRM, CartMother.simple())

      wrap(App)
        .atPath(`/orders/44051/edit/products?${OK_SEARCH_PARAMS}`)
        .withNetwork([
          {
            path: '/customers/1/orders/44051/',
            responseBody: OrderMother.confirmedWithBizum(),
          },
          {
            path: '/customers/1/orders/44051/cart/',
            responseBody: CartMother.simple(),
          },
          {
            path: '/customers/1/orders/44051/lines/prepared/',
            responseBody: preparedLines,
          },
        ])
        .withLogin()
        .mount()

      await waitFor(async () => {
        expect(history.push).toHaveBeenCalledWith('/user-area/orders/44051', {
          hasEditedProducts: true,
        })
      })

      await screen.findByText('Order updated')
    })

    it('should display the failed alert and do not display the draft alert on authentication failure', async () => {
      wrap(App)
        .atPath(`/orders/44051/edit/products?${KO_SEARCH_PARAMS}`)
        .withNetwork([
          {
            path: '/customers/1/orders/44051/',
            responseBody: OrderMother.confirmedWithBizum(),
          },
          {
            path: '/customers/1/orders/44051/cart/',
            responseBody: CartMother.simple(),
          },
        ])
        .withLogin()
        .mount()

      const challengeErrorModal = await screen.findByRole('dialog', {
        name: 'The changes were not saved correctly',
      })

      expect(screen.getAllByRole('dialog')).toHaveLength(1)

      expect(challengeErrorModal).toHaveTextContent(
        'The changes were not saved correctly',
      )
      expect(challengeErrorModal).toHaveTextContent(
        'It looks like there was a problem with the authorization. You can try with another card or contact us through the Help chat.',
      )
      expect(challengeErrorModal).toHaveTextContent('Try again')
      expect(challengeErrorModal).toHaveTextContent(
        'Close without saving changes',
      )
    })

    it('should go home if the authorization fails and the user cancels the edition', async () => {
      wrap(App)
        .atPath(`/orders/44051/edit/products?${KO_SEARCH_PARAMS}`)
        .withNetwork([
          {
            path: '/customers/1/home/',
            responseBody: new HomeSectionsBuilder()
              .withSection(HomeSectionMother.gridNews())
              .build(),
          },
          {
            path: '/customers/1/orders/44051/',
            responseBody: OrderMother.confirmedWithBizum(),
          },
          {
            path: '/customers/1/orders/44051/cart/',
            responseBody: CartMother.simple(),
          },
          {
            path: '/customers/1/orders/44051/cart/draft/',
            method: 'delete',
            requestBody: undefined,
          },
          {
            path: '/customers/1/shopping-lists/',
            responseBody: { shopping_lists: [] },
          },
        ])
        .withLogin()
        .mount()

      const challengeErrorModal = await screen.findByLabelText(
        'The changes were not saved correctly',
      )
      closeSCAWithoutSaving()

      await screen.findByText('Novedades')

      expect(challengeErrorModal).not.toBeInTheDocument()
    })

    describe('When retry with different payment method', () => {
      it('should be able to see modal to change payment method or create a new one on authentication failure', async () => {
        wrap(App)
          .atPath(`/orders/44051/edit/products?${KO_SEARCH_PARAMS}`)
          .withNetwork([
            {
              path: '/customers/1/orders/44051/',
              responseBody: OrderMother.confirmedWithBizum(),
            },
            {
              path: '/customers/1/orders/44051/cart/',
              responseBody: CartMother.simple(),
            },
            {
              path: '/customers/1/payment-cards/',
              responseBody: {
                results: [PaymentMethodMother.creditCardVisaValid()],
              },
            },
          ])
          .withLogin()
          .mount()

        await screen.findByLabelText('The changes were not saved correctly')

        tryAnotherPaymentMethod()

        const paymentMethodModal = await screen.findByRole('dialog', {
          name: 'Use a different card for this order',
        })

        expect(paymentMethodModal).toHaveTextContent(
          'Use a different card for this order',
        )

        const currentPaymentMethodButton = within(paymentMethodModal).getByRole(
          'radio',
          {
            name: 'Bizum, +34 700000000, Bizum',
          },
        )
        const visaPaymentMethodButton = within(paymentMethodModal).getByRole(
          'radio',
          {
            name: 'Visa, **** 6017, Expires 01/23',
          },
        )
        expect(currentPaymentMethodButton).toBeInTheDocument()
        expect(visaPaymentMethodButton).toBeInTheDocument()
      })

      it('should be able to change the payment method to some that already exist on authentication failure', async () => {
        Storage.setItem(STORAGE_KEYS.SCA_CONFIRM, CartMother.simple())

        wrap(App)
          .atPath(`/orders/44051/edit/products?${KO_SEARCH_PARAMS}`)
          .withNetwork([
            {
              path: '/customers/1/orders/44051/',
              multipleResponses: [
                {
                  responseBody: OrderMother.confirmedWithBizum(),
                },
                {
                  responseBody: OrderMother.confirmed(),
                },
                {
                  responseBody: OrderMother.confirmed(),
                },
                {
                  responseBody: OrderMother.confirmed(),
                },
              ],
            },
            {
              path: '/customers/1/orders/44051/cart/',
              responseBody: CartMother.simple(),
            },
            {
              path: '/customers/1/payment-cards/',
              responseBody: {
                results: [PaymentMethodMother.creditCardVisaValid()],
              },
            },
            {
              path: '/customers/1/orders/44051/payment-method/',
              method: 'put',
              requestBody: {
                payment_method: {
                  id: PaymentMethodMother.creditCardVisaValid().id,
                },
              },
            },
            {
              path: '/customers/1/orders/44051/cart/',
              method: 'put',
              status: 200,
              requestBody: {
                cart: {
                  id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
                  lines: [
                    { id: 1, quantity: 5, product_id: '8731' },
                    { id: 2, quantity: 5, product_id: '3317' },
                  ],
                },
              },
              responseBody: {
                errors: [
                  PaymentAuthenticationRequiredException.toJSON({
                    authentication_uuid: 'payment_authentication_uuid',
                  }),
                ],
              },
            },
            {
              path: '/customers/1/orders/44051/lines/prepared/',
              responseBody: preparedLines,
            },
          ])
          .withLogin()
          .mount()

        await screen.findByLabelText('The changes were not saved correctly')

        tryAnotherPaymentMethod()

        await screen.findByRole('dialog', {
          name: 'Use a different card for this order',
        })

        await selectExistentPaymentMethod('Visa, **** 6017, Expires 01/23')
        savePaymentMethod()

        await screen.findByText('Order updated')
        const paymentMethodSection = await screen.findByRole('region', {
          name: 'Payment method',
        })

        expect(paymentMethodSection).toHaveTextContent('**** 6017Expires 01/23')
      })

      it('should be able to change the payment method with authentication to some that already exist on authentication failure', async () => {
        Storage.setItem(STORAGE_KEYS.SCA_CONFIRM, CartMother.simple())

        wrap(App)
          .atPath(`/orders/44051/edit/products?${KO_SEARCH_PARAMS}`)
          .withNetwork([
            {
              path: '/customers/1/orders/44051/',
              multipleResponses: [
                {
                  responseBody: OrderMother.confirmed(),
                },
                {
                  responseBody: OrderMother.confirmedWithBizum(),
                },
                {
                  responseBody: OrderMother.confirmedWithBizum(),
                },
                {
                  responseBody: OrderMother.confirmedWithBizum(),
                },
              ],
            },
            {
              path: '/customers/1/orders/44051/cart/',
              responseBody: CartMother.simple(),
            },
            {
              path: '/customers/1/payment-cards/',
              responseBody: {
                results: [
                  PaymentMethodMother.creditCardVisaValid(),
                  PaymentMethodMother.bizum(),
                ],
              },
            },
            {
              path: '/customers/1/orders/44051/payment-method/',
              method: 'put',
              status: 400,
              requestBody: {
                payment_method: {
                  id: PaymentMethodMother.bizum().id,
                },
              },
              responseBody: {
                errors: [
                  PaymentAuthenticationRequiredException.toJSON({
                    authentication_uuid: 'payment_authentication_uuid',
                  }),
                ],
              },
            },
            {
              path: '/customers/1/orders/44051/cart/',
              method: 'put',
              status: 200,
              requestBody: {
                cart: {
                  id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
                  lines: [
                    { id: 1, quantity: 5, product_id: '8731' },
                    { id: 2, quantity: 5, product_id: '3317' },
                  ],
                },
              },
              responseBody: {
                errors: [
                  PaymentAuthenticationRequiredException.toJSON({
                    authentication_uuid: 'payment_method_authentication_uuid',
                  }),
                ],
              },
            },
            {
              path: `/customers/1/orders/44051/authentication/?${new URLSearchParams(
                {
                  lang: 'en',
                  wh: 'vlc1',
                  authentication_uuid: 'payment_method_authentication_uuid',
                  ok_url: `http://localhost:3000/orders/44051/edit/products?${OK_SEARCH_PARAMS}`,
                  ko_url: `http://localhost:3000/orders/44051/edit/products?${KO_SEARCH_PARAMS}`,
                },
              )}`,
              catchParams: true,
              responseBody: PaymentAuthenticationMother.redsysBizum(),
            },
            {
              path: '/customers/1/orders/44051/lines/prepared/',
              responseBody: preparedLines,
            },
          ])
          .withLogin()
          .mount()

        await screen.findByLabelText('The changes were not saved correctly')

        tryAnotherPaymentMethod()

        await screen.findByRole('dialog', {
          name: 'Use a different card for this order',
        })

        await selectExistentPaymentMethod('Visa, **** 6017, Expires 01/23')
        savePaymentMethod()

        await screen.findByText('Order updated')
        const paymentMethodSection = await screen.findByRole('region', {
          name: 'Payment method',
        })

        expect(paymentMethodSection).toHaveTextContent('+34 700000000Bizum')
      })

      it('should be able to change the payment method with authentication to some new card on authentication failure', async () => {
        Storage.setItem(STORAGE_KEYS.SCA_CONFIRM, CartMother.simple())

        wrap(App)
          .atPath(`/orders/44051/edit/products?${KO_SEARCH_PARAMS}`)
          .withNetwork([
            {
              path: '/customers/1/orders/44051/',
              multipleResponses: [
                {
                  responseBody: OrderMother.confirmedWithBizum(),
                },
                {
                  responseBody: OrderMother.confirmed(),
                },
                {
                  responseBody: OrderMother.confirmed(),
                },
                {
                  responseBody: OrderMother.confirmed(),
                },
                {
                  responseBody: OrderMother.confirmed(),
                },
              ],
            },
            {
              path: '/customers/1/orders/44051/cart/',
              responseBody: CartMother.simple(),
            },
            {
              path: '/customers/1/payment-cards/',
              multipleResponses: [
                {
                  responseBody: {
                    results: [PaymentMethodMother.bizum()],
                  },
                },
                {
                  responseBody: {
                    results: [PaymentMethodMother.bizum()],
                  },
                },
                {
                  responseBody: {
                    results: [
                      PaymentMethodMother.creditCardVisaValid(),
                      PaymentMethodMother.bizum(false),
                    ],
                  },
                },
              ],
            },
            {
              path: '/customers/1/orders/44051/lines/prepared/',
              responseBody: preparedLines,
            },
            {
              path: '/customers/1/payment-cards/new/?lang=en&wh=vlc1&ok_url=http://localhost:3000/payment_ok.html?url=http://localhost:3000/orders/44051/edit/products&ko_url=http://localhost:3000/payment_ko.html?url=http://localhost:3000/orders/44051/edit/products',
              catchParams: true,
              responseBody: PaymentAuthenticationMother.redsysCard(),
            },
          ])
          .withLogin()
          .mount()

        await screen.findByLabelText('The changes were not saved correctly')
        tryAnotherPaymentMethod()

        await screen.findByRole('dialog', {
          name: 'Use a different card for this order',
        })

        await clickToAddNewPaymentMethod()
        await selectNewPaymentMethodCard()
        await screen.findByTitle('payment-card-tpv-iframe')
        confirmAddPaymentMethod()

        await screen.findByText('Order updated')

        const paymentMethodSection = await screen.findByRole('region', {
          name: 'Payment method',
        })
        expect(paymentMethodSection).toHaveTextContent('**** 6017Expires 01/23')
      })

      it('should be able to change the payment method with authentication to some new bizum on authentication failure but show phone without bizum', async () => {
        Storage.setItem(STORAGE_KEYS.SCA_CONFIRM, CartMother.simple())

        wrap(App)
          .atPath(`/orders/44051/edit/products?${KO_SEARCH_PARAMS}`)
          .withNetwork([
            {
              path: '/customers/1/orders/44051/',
              responseBody: OrderMother.confirmed(),
            },
            {
              path: '/customers/1/orders/44051/cart/',
              responseBody: CartMother.simple(),
            },
            {
              path: '/customers/1/payment-cards/',
              responseBody: {
                results: [PaymentMethodMother.creditCardVisaValid()],
              },
            },
            {
              path: '/customers/1/orders/44051/payment-method-bizum/',
              method: 'POST',
              requestBody: {
                phone_country_code: '34',
                phone_national_number: '600123456',
              },
              status: 400,
              responseBody: {
                errors: [PhoneWithoutBizumException.toJSON()],
              },
            },
          ])
          .withLogin()
          .mount()

        await screen.findByLabelText('The changes were not saved correctly')
        tryAnotherPaymentMethod()

        await screen.findByRole('dialog', {
          name: 'Use a different card for this order',
        })

        await clickToAddNewPaymentMethod()
        await selectNewPaymentMethodBizum()
        await fillBizumForm()

        const errorDialog = await screen.findByRole('dialog', {
          name: '+34 600 12 34 56 is not linked to Bizum',
        })

        expect(errorDialog).toBeInTheDocument()
      })

      it('should be able to change the payment method with authentication to some new bizum on authentication failure', async () => {
        Storage.setItem(STORAGE_KEYS.SCA_CONFIRM, CartMother.simple())
        vi.spyOn(PaymentTPV, 'autoRedirectToPaymentAuth')

        wrap(App)
          .atPath(`/orders/44051/edit/products?${KO_SEARCH_PARAMS}`)
          .withNetwork([
            {
              path: '/customers/1/orders/44051/',
              responseBody: OrderMother.confirmed(),
            },
            {
              path: '/customers/1/orders/44051/cart/',
              responseBody: CartMother.simple(),
            },
            {
              path: '/customers/1/payment-cards/',
              responseBody: {
                results: [PaymentMethodMother.creditCardVisaValid()],
              },
            },
            {
              path: '/customers/1/orders/44051/payment-method-bizum/',
              method: 'POST',
              requestBody: {
                phone_country_code: '34',
                phone_national_number: '600123456',
              },
              status: 400,
              responseBody: {
                errors: [
                  PaymentAuthenticationRequiredException.toJSON({
                    authentication_uuid: 'payment_bizum_authentication_uuid',
                  }),
                ],
              },
            },
            {
              path: `/customers/1/orders/44051/authentication/?${new URLSearchParams(
                {
                  lang: 'en',
                  wh: 'vlc1',
                  authentication_uuid: 'payment_bizum_authentication_uuid',
                  ok_url: `http://localhost:3000/orders/44051/edit/products?${NEW_BIZUM_OK_SEARCH_PARAMS}`,
                  ko_url: `http://localhost:3000/orders/44051/edit/products?${NEW_BIZUM_KO_SEARCH_PARAMS}`,
                },
              )}`,
              catchParams: true,
              method: 'GET',
              responseBody: PaymentAuthenticationMother.redsysBizum(),
            },
          ])
          .withLogin()
          .mount()

        await screen.findByLabelText('The changes were not saved correctly')
        tryAnotherPaymentMethod()

        await screen.findByRole('dialog', {
          name: 'Use a different card for this order',
        })

        await clickToAddNewPaymentMethod()
        await selectNewPaymentMethodBizum()
        await fillBizumForm()

        await waitFor(() => {
          expect(
            PaymentTPV.autoRedirectToPaymentAuth,
          ).toHaveBeenCalledExactlyOnceWith(
            PaymentAuthenticationMother.redsysBizum().params,
          )
        })
      })

      describe('When retry with bizum return from PSD2 TVP', () => {
        it('should show error modal if authentication fails', async () => {
          Storage.setItem(STORAGE_KEYS.SCA_CONFIRM, CartMother.simple())

          wrap(App)
            .atPath(`/orders/44051/edit/products?${NEW_BIZUM_KO_SEARCH_PARAMS}`)
            .withNetwork([
              {
                path: '/customers/1/orders/44051/',
                responseBody: OrderMother.confirmed(),
              },
              {
                path: '/customers/1/orders/44051/cart/',
                responseBody: CartMother.simple(),
              },
              {
                path: '/customers/1/payment-cards/',
                responseBody: {
                  results: [PaymentMethodMother.creditCardVisaValid()],
                },
              },
            ])
            .withLogin()
            .mount()

          const paymentFailedDialog = await screen.findByRole('dialog', {
            name: 'The changes were not saved correctly',
          })
          expect(paymentFailedDialog).toBeInTheDocument()
        })

        it('should retry update with new payment method bizum', async () => {
          Storage.setItem(STORAGE_KEYS.SCA_CONFIRM, CartMother.simple())

          wrap(App)
            .atPath(`/orders/44051/edit/products?${NEW_BIZUM_OK_SEARCH_PARAMS}`)
            .withNetwork([
              {
                path: '/customers/1/orders/44051/',
                responseBody: OrderMother.confirmedWithBizum(),
              },
              {
                path: '/customers/1/orders/44051/cart/',
                responseBody: CartMother.simple(),
              },
              {
                path: '/customers/1/payment-cards/',
                responseBody: {
                  results: [
                    PaymentMethodMother.creditCardVisaValid(false),
                    PaymentMethodMother.bizum(),
                  ],
                },
              },
              {
                path: '/customers/1/orders/44051/lines/prepared/',
                responseBody: preparedLines,
              },
            ])
            .withLogin()
            .mount()

          await screen.findByText('Order updated')
        })
      })
    })
  })
})
