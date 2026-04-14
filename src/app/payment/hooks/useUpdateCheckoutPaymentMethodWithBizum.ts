import { useState } from 'react'

import { OrderPaymentClient } from '../client_new'
import { PaymentAuthenticationRequiredException } from '../exceptions'
import { PaymentAuthenticationType, PaymentMethodType } from '../interfaces'
import { PaymentAuthFlow } from './payment-authentication/parameters'
import { usePaymentAuthentication } from './payment-authentication/usePaymentAuthentication'
import { usePaymentAuthenticationCallbacks } from './payment-authentication/usePaymentAuthenticationCallbacks'

import { useUserUUID } from 'app/authentication'
import { ManagedException, cloneResponse } from 'app/shared/exceptions'

const PAYMENT_METHOD_TYPE = PaymentMethodType.BIZUM

export const useUpdateCheckoutPaymentMethodWithBizum = ({
  checkoutId,
  paymentFlow,
  onAuthFailure,
  clearAllSearchParams = true,
}: {
  checkoutId: number | string
  paymentFlow:
    | PaymentAuthFlow.UPDATE_CHECKOUT_PAYMENT_METHOD
    | PaymentAuthFlow.CHECKOUT_AUTO_CONFIRM
  onAuthFailure: () => void
  clearAllSearchParams?: boolean
}) => {
  const customerId = useUserUUID()
  const [isMutating, setIsMutating] = useState(false)

  const { launchPaymentAuthentication } = usePaymentAuthentication({
    entityId: checkoutId,
  })

  usePaymentAuthenticationCallbacks({
    flow: paymentFlow,
    paymentMethodType: PAYMENT_METHOD_TYPE,
    onAuthSuccess: () => null,
    onAuthFailure,
    enabled: clearAllSearchParams,
  })

  const updateCheckoutPaymentMethodWithBizum = async (
    payload: {
      phoneCountryCode: string
      phoneNationalNumber: string
      autoConfirm: boolean
    },
    callbacks?: {
      onError: (error: unknown) => void
      onSettled?: () => void
    },
  ) => {
    setIsMutating(true)
    try {
      await OrderPaymentClient.updateCheckoutPaymentMethodWithBizum({
        customerId,
        checkoutId,
        phone: {
          phoneCountryCode: payload.phoneCountryCode,
          phoneNationalNumber: payload.phoneNationalNumber,
        },
        autoConfirm: true,
      })
    } catch (error) {
      const [errorResponse, errorResponseCloned] = cloneResponse(
        error as Response,
      )

      if (ManagedException.isManagedError(errorResponseCloned)) {
        const exception =
          await ManagedException.getException(errorResponseCloned)

        if (PaymentAuthenticationRequiredException.isException(exception)) {
          await launchPaymentAuthentication({
            paymentAuthenticationUuid: exception.authentication_uuid,
            paymentMethodType: PAYMENT_METHOD_TYPE,
            paymentFlow,
            paymentAuthenticationType:
              paymentFlow === PaymentAuthFlow.CHECKOUT_AUTO_CONFIRM
                ? PaymentAuthenticationType.TOKEN_AUTH
                : PaymentAuthenticationType.AUTH,
          })

          return
        }
      }

      callbacks?.onError(errorResponse)
    } finally {
      setIsMutating(false)
      callbacks?.onSettled?.()
    }
  }

  return {
    updateCheckoutPaymentMethodWithBizum,
    isMutating,
  }
}
