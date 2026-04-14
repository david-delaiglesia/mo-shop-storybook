import {
  Checkout,
  CheckoutAuthStatusResponse,
  CheckoutAuthenticationDetail,
  CheckoutAuthenticationDetailResponse,
  CheckoutConfirmation,
  CheckoutConfirmationAuthenticationRequired,
  CheckoutConfirmationResponse,
  CheckoutConfirmationStatus,
  CheckoutResponse,
} from './interfaces'

import {
  camelCaseToSnakeCase,
  snakeCaseToCamelCase,
} from '@mercadona/mo.library.dashtil'

import { deserializeAddress } from 'app/address/serializer'
import { Cart } from 'app/cart'
import { deserializeCart } from 'app/cart/serializer'
import { serializeCheckout } from 'app/checkout/serializer'
import { Order, OrderResponse } from 'app/order'
import {
  AuthenticationConfig,
  AuthenticationConfigResponse,
  PaymentMethod,
} from 'app/payment'
import { Product } from 'app/products'
import { Http, HttpWithErrorHandler } from 'services/http'
import { isResponse } from 'utils/response'

export const CheckoutClient = {
  async updateContactInfo(
    userUuid: string,
    checkoutId: number,
    contactInfo: Pick<
      CheckoutResponse,
      'phone_country_code' | 'phone_national_number'
    >,
  ): Promise<void> {
    const path = `/customers/${userUuid}/checkouts/${checkoutId}/phone-number/`
    const options = {
      body: JSON.stringify(contactInfo),
      shouldCatchErrors: false,
    }
    await HttpWithErrorHandler.auth().put(path, options)
  },

  async updateDeliveryInfo(
    userUuid: string,
    checkoutId: number,
    deliveryInfo: {
      address: {
        id: number
      }
      slot: {
        id: number
      }
    },
  ): Promise<void> {
    const path = `/customers/${userUuid}/checkouts/${checkoutId}/delivery-info/`
    const options = {
      body: JSON.stringify({
        address: deserializeAddress(deliveryInfo.address),
        slot: deliveryInfo.slot,
      }),
      shouldCatchErrors: false,
    }

    await HttpWithErrorHandler.auth().put(path, options)
  },

  async updatePaymentInfo(
    userUuid: string,
    checkoutId: number,
    paymentInfo: Pick<PaymentMethod, 'id'>,
  ): Promise<void> {
    const path = `/customers/${userUuid}/checkouts/${checkoutId}/payment-method/`

    const options = {
      body: JSON.stringify({ payment_method: paymentInfo }),
      shouldCatchErrors: false,
    }

    await HttpWithErrorHandler.auth().put(path, options)
  },

  async confirmLegacy(
    userId: string,
    checkoutId: number,
  ): Promise<Pick<Order, 'orderId'> | undefined> {
    const path = `/customers/${userId}/checkouts/${checkoutId}/orders/`

    const options = { shouldCatchErrors: false, body: undefined }

    return HttpWithErrorHandler.auth()
      .post<Pick<OrderResponse, 'order_id'> | undefined>(path, options)
      .then((response) => snakeCaseToCamelCase(response))
  },

  /**
   * @throws {MaxWaterLitersInCartException | BonusAlreadyAppliedException | FieldRequiredException | FieldInvalidException}
   */
  async confirm(
    userId: string,
    checkoutId: number,
  ): Promise<CheckoutConfirmation> {
    return Http.auth()
      .post<CheckoutConfirmationResponse>(
        `/customers/${userId}/checkouts/${checkoutId}/confirm/`,
      )
      .then(async (response) => {
        if (isResponse(response)) {
          if (response.status === 202) {
            const responseData: CheckoutConfirmationAuthenticationRequired =
              await response.json()

            return {
              status: CheckoutConfirmationStatus.ACCEPTED,
              payload: snakeCaseToCamelCase(responseData),
            }
          }
        }

        return {
          status: CheckoutConfirmationStatus.CREATED,
          payload: { orderId: response.order_id },
        }
      })
  },

  async create(
    userUuid: string,
    cart: Pick<Cart, 'id' | 'products' | 'version'>,
    shouldCatchErrors: boolean,
  ): Promise<Checkout | undefined> {
    const path = `/customers/${userUuid}/checkouts/`

    const options = {
      body: JSON.stringify({
        cart: deserializeCart(cart),
      }),
      shouldCatchErrors,
    }

    return HttpWithErrorHandler.auth()
      .post<CheckoutResponse>(path, options)
      .then(serializeCheckout)
  },

  async getById(
    userUuid: string,
    checkoutId: number,
  ): Promise<Checkout | undefined> {
    const path = `/customers/${userUuid}/checkouts/${checkoutId}/`

    return HttpWithErrorHandler.auth()
      .get<CheckoutResponse | undefined>(path)
      .then(serializeCheckout)
  },

  async removeBlinkingProducts(
    userUuid: string,
    checkoutId: number,
    blinkingProductIdsList: Array<Product['id']>,
  ): Promise<void> {
    const path = `/customers/${userUuid}/checkouts/${checkoutId}/remove-lines/`

    const options = {
      body: JSON.stringify({ product_ids: blinkingProductIdsList }),
    }

    await HttpWithErrorHandler.auth().post(path, options)
  },

  async getAuthenticationStatus(
    customerId: string,
    checkoutId: number,
  ): Promise<CheckoutAuthStatusResponse> {
    return Http.auth().get(
      `/customers/${customerId}/checkouts/${checkoutId}/status/`,
    )
  },

  async getAuthenticationDetails(
    customerId: string,
    checkoutId: number,
  ): Promise<CheckoutAuthenticationDetail> {
    return Http.auth()
      .get<CheckoutAuthenticationDetailResponse>(
        `/customers/${customerId}/checkouts/${checkoutId}/authentication-detail/`,
      )
      .then((response) => snakeCaseToCamelCase(response))
  },

  async cancelAuthentication({
    customerId,
    checkoutId,
  }: {
    customerId: string
    checkoutId: Checkout['id']
  }): Promise<void> {
    return Http.auth().put(
      `/customers/${customerId}/checkouts/${checkoutId}/authentication/cancel/`,
    )
  },

  /**
   * @throws {PhoneWithoutBizumException | CheckoutAlreadyConfirmedException}
   */
  updatePaymentMethodWithBizum({
    customerId,
    checkoutId,
    phone,
  }: {
    customerId: string
    checkoutId: number | string
    phone: { phoneCountryCode: string; phoneNationalNumber: string }
  }): Promise<AuthenticationConfig> {
    return Http.auth()
      .post<Response>(
        `/customers/${customerId}/checkouts/${checkoutId}/payment-methods/bizum/`,
        {
          body: JSON.stringify(camelCaseToSnakeCase(phone)),
        },
      )
      .then(async (response) => {
        const data: AuthenticationConfigResponse = await response.json()
        return snakeCaseToCamelCase(data)
      })
  },
}
