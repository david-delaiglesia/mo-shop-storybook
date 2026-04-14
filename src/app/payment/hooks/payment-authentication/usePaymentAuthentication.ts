import { PaymentTPV } from '../../PaymentTPV'
import { OrderPaymentClient } from '../../client_new'
import { generateCallbackUrl } from './generate-urls'
import {
  PaymentAuthFlow,
  PaymentAuthStatus,
  mapPaymentAuthFlows,
} from './parameters'

import { useUserUUID } from 'app/authentication'
import { PaymentMetrics } from 'app/payment/PaymentMetrics'
import {
  PaymentAuthenticationType,
  PaymentMethodType,
} from 'app/payment/interfaces'

const isCheckoutRelatedFlow = (flow: PaymentAuthFlow) =>
  flow === PaymentAuthFlow.CHECKOUT ||
  flow === PaymentAuthFlow.CHECKOUT_AUTO_CONFIRM ||
  flow === PaymentAuthFlow.UPDATE_CHECKOUT_PAYMENT_METHOD

export const usePaymentAuthentication = ({
  entityId,
}: {
  entityId: number | string
}) => {
  const customerId = useUserUUID()

  const launchPaymentAuthentication = async ({
    paymentAuthenticationUuid,
    paymentMethodType,
    paymentFlow,
    paymentAuthenticationType,
    isMIT = false,
  }: {
    paymentAuthenticationUuid: string
    paymentMethodType: PaymentMethodType | 'any'
    paymentFlow: PaymentAuthFlow
    paymentAuthenticationType: PaymentAuthenticationType
    isMIT?: boolean
  }) => {
    const getPaymentAuthenticationParams = (params: {
      customerId: string
      entityId: number | string
      authenticationUuid: string
      okUrl: string
      koUrl: string
    }) =>
      isCheckoutRelatedFlow(paymentFlow)
        ? OrderPaymentClient.getCheckoutPaymentAuthenticationParams({
            ...params,
            checkoutId: entityId,
          })
        : OrderPaymentClient.getOrderPaymentAuthenticationParams({
            ...params,
            orderId: entityId,
          })

    const response = await getPaymentAuthenticationParams({
      customerId,
      entityId,
      authenticationUuid: paymentAuthenticationUuid,
      okUrl: generateCallbackUrl({
        status: PaymentAuthStatus.SUCCESS,
        paymentAuthenticationUuid,
        paymentMethodType,
        paymentFlow,
      }).toString(),
      koUrl: generateCallbackUrl({
        status: PaymentAuthStatus.FAILURE,
        paymentAuthenticationUuid,
        paymentMethodType,
        paymentFlow,
      }).toString(),
    })

    PaymentMetrics.startPsd2Flow({
      paymentMethodType: response.paymentMethodType,
      type: paymentAuthenticationType,
      provider: response.provider,
      paymentAuthenticationUuid: paymentAuthenticationUuid,
      userFlow: mapPaymentAuthFlows[paymentFlow],
      isMIT,
    })

    PaymentTPV.autoRedirectToPaymentAuth(response.params)
  }

  return {
    launchPaymentAuthentication,
  }
}
