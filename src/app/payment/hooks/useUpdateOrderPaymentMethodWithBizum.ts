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

export const useUpdateOrderPaymentMethodWithBizum = ({
  orderId,
  paymentFlow,
  onAuthSuccess,
  onAuthFailure,
}: {
  orderId: number | string
  paymentFlow: PaymentAuthFlow
  onAuthSuccess: () => void
  onAuthFailure: () => void
}) => {
  const customerId = useUserUUID()
  const [isMutating, setIsMutating] = useState(false)

  const { launchPaymentAuthentication } = usePaymentAuthentication({
    entityId: orderId,
  })

  usePaymentAuthenticationCallbacks({
    flow: paymentFlow,
    paymentMethodType: PAYMENT_METHOD_TYPE,
    onAuthSuccess,
    onAuthFailure,
  })

  const updateOrderPaymentMethodWithBizum = async (
    phone: {
      phoneCountryCode: string
      phoneNationalNumber: string
    },
    callbacks?: {
      onError: (error: unknown) => void
      onSettled?: () => void
    },
  ) => {
    setIsMutating(true)
    try {
      await OrderPaymentClient.updateOrderPaymentMethodWithBizum({
        customerId,
        orderId,
        phone,
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
            paymentAuthenticationType: PaymentAuthenticationType.AUTH,
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
    updateOrderPaymentMethodWithBizum,
    isMutating,
  }
}
