import { SCA_SOURCES } from './constants'
import {
  PaymentAuthentication,
  PaymentAuthenticationResponse,
  PaymentIncidentDetails,
  PaymentIncidentDetailsResponse,
  PaymentIncidentStatusResponse,
  PaymentTokenAuthnFlow,
  ResolvePaymentIncidentResult,
  ResolvePaymentIncidentResultResponse,
} from './interfaces'

import {
  camelCaseToSnakeCase,
  snakeCaseToCamelCase,
} from '@mercadona/mo.library.dashtil'

import { Http, HttpWithErrorHandler } from 'services/http'
import { isResponse } from 'utils/response'

export const OrderPaymentClient = {
  /**
   * @throws {PhoneWithoutBizumException | PaymentFailedException | PaymentAuthenticationRequiredException}
   */
  retryOrderPaymentWithBizum({
    customerId,
    orderId,
    phone,
  }: {
    customerId: string
    orderId: number | string
    phone: {
      phoneCountryCode: string
      phoneNationalNumber: string
    }
  }): Promise<void> {
    return Http.auth().post(
      `/customers/${customerId}/orders/${orderId}/retry-payment-bizum/`,
      {
        body: JSON.stringify(camelCaseToSnakeCase(phone)),
      },
    )
  },

  getPaymentAuthenticationForBizum({
    customerId,
    orderId,
    phone,
    okUrl,
    koUrl,
  }: {
    customerId: string
    orderId: number | string
    phone: {
      phoneCountryCode: string
      phoneNationalNumber: string
    }
    okUrl: string
    koUrl: string
  }): Promise<PaymentAuthentication> {
    return Http.auth()
      .post<PaymentAuthenticationResponse>(
        `/customers/${customerId}/orders/${orderId}/payment-authentication-bizum/`,
        {
          body: JSON.stringify(
            camelCaseToSnakeCase({
              ...phone,
              okUrl,
              koUrl,
            }),
          ),
        },
      )
      .then(({ params, ...response }) => {
        return {
          ...snakeCaseToCamelCase(response),
          params,
        }
      })
  },

  getAuthenticationParameters({
    id,
    userUuid,
    source,
  }: {
    id: string
    userUuid: string
    source: Exclude<
      ValueOf<typeof SCA_SOURCES>,
      typeof SCA_SOURCES.SCA_RESOLVE_RESCHEDULED_PAYMENT_INCIDENT
    >
  }): Promise<PaymentAuthentication> {
    const FILES: Record<
      Exclude<
        ValueOf<typeof SCA_SOURCES>,
        typeof SCA_SOURCES.SCA_RESOLVE_RESCHEDULED_PAYMENT_INCIDENT
      >,
      { ok: string; ko: string }
    > = {
      [SCA_SOURCES.SCA_CONFIRM]: {
        ok: 'sca_confirm_ok.html',
        ko: 'sca_confirm_ko.html',
      },
      [SCA_SOURCES.SCA_UPDATE_PAYMENT]: {
        ok: 'sca_update_payment_ok.html',
        ko: 'sca_update_payment_ko.html',
      },
      [SCA_SOURCES.SCA_ADDED_PAYMENT]: {
        ok: 'sca_added_payment_ok.html',
        ko: 'sca_added_payment_ko.html',
      },
    }

    return HttpWithErrorHandler.auth()
      .get<PaymentAuthenticationResponse>(
        `/customers/${userUuid}/payment-cards/auth/${id}/`,
        {
          params: {
            ok_url: `${window.location.origin}/${FILES[source].ok}?url=${window.location.origin}${window.location.pathname}`,
            ko_url: `${window.location.origin}/${FILES[source].ko}?url=${window.location.origin}${window.location.pathname}`,
            checkout_auto_confirm: 'yes',
          },
        },
      )
      .then(({ params, ...response }) => {
        return {
          ...snakeCaseToCamelCase(response),
          params,
        }
      })
  },

  /**
   * @throws {PhoneWithoutBizumException | PaymentAuthenticationRequiredException}
   */
  updateOrderPaymentMethodWithBizum({
    customerId,
    orderId,
    phone,
  }: {
    customerId: string
    orderId: number | string
    phone: { phoneCountryCode: string; phoneNationalNumber: string }
  }): Promise<void> {
    return Http.auth().post<void>(
      `/customers/${customerId}/orders/${orderId}/payment-method-bizum/`,
      {
        body: JSON.stringify(camelCaseToSnakeCase(phone)),
      },
    )
  },

  /**
   * @throws {PhoneWithoutBizumException}
   */
  async addOrderPaymentMethodBizum({
    customerId,
    orderId,
    phone,
    okUrl,
    koUrl,
    flow,
  }: {
    customerId: string
    orderId: number | string
    phone: { phoneCountryCode: string; phoneNationalNumber: string }
    okUrl: string
    koUrl: string
    flow: PaymentTokenAuthnFlow
  }): Promise<
    | { authenticationMode: 'redirection'; payload: PaymentAuthentication }
    | { authenticationMode: 'rest' }
  > {
    return Http.auth()
      .post<PaymentAuthenticationResponse | Response>(
        `/customers/${customerId}/orders/${orderId}/payment-methods/bizum/`,
        {
          body: JSON.stringify(
            camelCaseToSnakeCase({
              ...phone,
              okUrl,
              koUrl,
              flow,
            }),
          ),
        },
      )
      .then((response) => {
        if (isResponse(response)) {
          return { authenticationMode: 'rest' }
        }

        const { params, ...responseData } = response
        return {
          authenticationMode: 'redirection',
          payload: {
            ...snakeCaseToCamelCase(responseData),
            params,
          },
        }
      })
  },

  async addOrderPaymentMethodCard({
    customerId,
    orderId,
    okUrl,
    koUrl,
    flow,
  }: {
    customerId: string
    orderId: number | string
    okUrl: string
    koUrl: string
    flow: PaymentTokenAuthnFlow
  }): Promise<PaymentAuthentication> {
    return Http.auth()
      .post<PaymentAuthenticationResponse>(
        `/customers/${customerId}/orders/${orderId}/payment-methods/card/`,
        {
          body: JSON.stringify(
            camelCaseToSnakeCase({
              okUrl,
              koUrl,
              flow,
            }),
          ),
        },
      )
      .then(({ params, ...response }) => {
        return {
          ...snakeCaseToCamelCase(response),
          params,
        }
      })
  },

  /**
   * @throws {PhoneWithoutBizumException | PaymentAuthenticationRequiredException}
   */
  updateCheckoutPaymentMethodWithBizum({
    customerId,
    checkoutId,
    phone,
    autoConfirm,
  }: {
    customerId: string
    checkoutId: number | string
    phone: { phoneCountryCode: string; phoneNationalNumber: string }
    autoConfirm: boolean
  }): Promise<void> {
    return Http.auth().post<void>(
      `/customers/${customerId}/checkouts/${checkoutId}/payment-method-bizum/`,
      {
        body: JSON.stringify(
          camelCaseToSnakeCase({
            ...phone,
            checkoutAutoConfirm: autoConfirm ? 'yes' : 'no',
          }),
        ),
      },
    )
  },

  async getOrderPaymentAuthenticationParams({
    customerId,
    orderId,
    authenticationUuid,
    okUrl,
    koUrl,
  }: {
    customerId: string
    orderId: number | string
    authenticationUuid: string
    okUrl: string
    koUrl: string
  }): Promise<PaymentAuthentication> {
    return Http.auth()
      .get<PaymentAuthenticationResponse>(
        `/customers/${customerId}/orders/${orderId}/authentication/`,
        {
          params: {
            authentication_uuid: authenticationUuid,
            ok_url: encodeURIComponent(okUrl),
            ko_url: encodeURIComponent(koUrl),
          },
        },
      )
      .then(({ params, ...response }) => {
        return {
          ...snakeCaseToCamelCase(response),
          params,
        }
      })
  },

  async getCheckoutPaymentAuthenticationParams({
    customerId,
    checkoutId,
    authenticationUuid,
    okUrl,
    koUrl,
  }: {
    customerId: string
    checkoutId: number | string
    authenticationUuid: string
    okUrl: string
    koUrl: string
  }): Promise<PaymentAuthentication> {
    return Http.auth()
      .get<PaymentAuthenticationResponse>(
        `/customers/${customerId}/checkouts/${checkoutId}/authentication/`,
        {
          params: {
            authentication_uuid: authenticationUuid,
            ok_url: encodeURIComponent(okUrl),
            ko_url: encodeURIComponent(koUrl),
          },
        },
      )
      .then(({ params, ...response }) => {
        return {
          ...snakeCaseToCamelCase(response),
          params,
        }
      })
  },

  /**
   * @throws {PhoneWithoutBizumException}
   */
  async createPaymentMethodBizum({
    customerId,
    payload,
  }: {
    customerId: string
    payload: {
      phoneCountryCode: string
      phoneNationalNumber: string
    }
  }): Promise<void> {
    return Http.auth().post<void>(
      `/customers/${customerId}/payment-methods/bizum/`,
      {
        body: JSON.stringify(camelCaseToSnakeCase(payload)),
      },
    )
  },

  async resolvePaymentIncident({
    customerId,
    orderId,
    paymentMethodId,
  }: {
    customerId: string
    orderId: number | string
    paymentMethodId: number | string
  }): Promise<ResolvePaymentIncidentResult> {
    const response = await Http.auth()
      .post<ResolvePaymentIncidentResultResponse>(
        `/customers/${customerId}/orders/${orderId}/payment-incident/resolve/`,
        {
          body: JSON.stringify(camelCaseToSnakeCase({ paymentMethodId })),
        },
      )
      .then((response) =>
        snakeCaseToCamelCase<ResolvePaymentIncidentResult>(response),
      )

    if (isResponse(response)) {
      const data = await response.json()
      return snakeCaseToCamelCase<ResolvePaymentIncidentResult>(data)
    }

    return response
  },

  async getPaymentIncidentStatus({
    customerId,
    orderId,
  }: {
    customerId: string
    orderId: number | string
  }): Promise<PaymentIncidentStatusResponse> {
    return Http.auth().get(
      `/customers/${customerId}/orders/${orderId}/payment-incident/status/`,
    )
  },

  async getPaymentIncidentDetails({
    customerId,
    orderId,
  }: {
    customerId: string
    orderId: number | string
  }): Promise<PaymentIncidentDetails> {
    return Http.auth()
      .get<PaymentIncidentDetailsResponse>(
        `/customers/${customerId}/orders/${orderId}/payment-incident/`,
      )
      .then(snakeCaseToCamelCase<PaymentIncidentDetails>)
  },

  async makeDefault({
    customerId,
    paymentMethodId,
  }: {
    customerId: string
    paymentMethodId: number
  }): Promise<void> {
    await HttpWithErrorHandler.auth().put(
      `/customers/${customerId}/payment-cards/${paymentMethodId}/`,
      {
        body: JSON.stringify({
          default_card: true,
        }),
      },
    )
  },

  async getAuthenticationDetails({
    customerId,
    orderId,
  }: {
    customerId: string
    orderId: number | string
  }): Promise<{
    totalAmount: string
    remainingTime: number
  }> {
    return Http.auth()
      .get(`/customers/${customerId}/orders/${orderId}/authentication-detail/`)
      .then((response) => snakeCaseToCamelCase(response))
  },

  async cancelAuthentication({
    customerId,
    orderId,
  }: {
    customerId: string
    orderId: number | string
  }): Promise<void> {
    return Http.auth().put(
      `/customers/${customerId}/orders/${orderId}/authentication/cancel/`,
    )
  },
}
