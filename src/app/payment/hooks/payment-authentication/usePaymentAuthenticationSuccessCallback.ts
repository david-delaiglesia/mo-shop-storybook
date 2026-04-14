import { useEffect } from 'react'

import {
  PaymentAuthFlow,
  PaymentAuthParams,
  PaymentAuthStatus,
  mapPaymentAuthFlows,
} from './parameters'

import { PaymentMetrics } from 'app/payment/PaymentMetrics'
import { PaymentMethodType } from 'app/payment/interfaces'
import { useSearchParams } from 'hooks/useSearchParams'

export const usePaymentAuthenticationSuccessCallback = ({
  flow,
  paymentMethodType,
}: {
  flow: PaymentAuthFlow
  paymentMethodType: PaymentMethodType
}) => {
  const { searchParams, clearAllSearchParams } = useSearchParams()

  const handleAuthResult = () => {
    const paymentAuthenticationUuid = searchParams.get(
      PaymentAuthParams.PAYMENT_AUTH_UUID,
    )
    const paymentFlow = searchParams.get(PaymentAuthParams.PAYMENT_FLOW)
    const paymentMethod = searchParams.get(PaymentAuthParams.PAYMENT_METHOD)
    const paymentStatus = searchParams.get(PaymentAuthParams.PAYMENT_STATUS)

    if (
      !paymentAuthenticationUuid ||
      !paymentFlow ||
      !paymentMethod ||
      !paymentStatus ||
      paymentFlow !== flow ||
      paymentMethod !== paymentMethodType
    ) {
      return
    }

    if (paymentStatus === PaymentAuthStatus.SUCCESS) {
      PaymentMetrics.endPsd2Flow({
        status: 'success',
        paymentAuthenticationUuid: paymentAuthenticationUuid,
        userFlow: mapPaymentAuthFlows[flow],
      })
      clearAllSearchParams()
    }
  }

  useEffect(() => {
    handleAuthResult()
  }, [searchParams])
}
