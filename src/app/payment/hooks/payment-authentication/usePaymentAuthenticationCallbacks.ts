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

export const usePaymentAuthenticationCallbacks = ({
  flow,
  paymentMethodType,
  onAuthSuccess,
  onAuthFailure,
  enabled = true,
  skipClearParamsOnSuccess = false,
}: {
  flow: PaymentAuthFlow
  paymentMethodType: PaymentMethodType | 'any'
  onAuthSuccess: () => void
  onAuthFailure: () => void
  enabled?: boolean
  skipClearParamsOnSuccess?: boolean
}) => {
  const { searchParams, clearAllSearchParams } = useSearchParams()

  const handleAuthResult = () => {
    const paymentAuthenticationStorageKey = searchParams.get(
      PaymentAuthParams.PAYMENT_AUTH_STORAGE_KEY,
    )
    const paymentFlow = searchParams.get(PaymentAuthParams.PAYMENT_FLOW)
    const paymentMethod = searchParams.get(PaymentAuthParams.PAYMENT_METHOD)
    const paymentStatus = searchParams.get(PaymentAuthParams.PAYMENT_STATUS)

    const paymentAuthenticationUuid =
      searchParams.get(PaymentAuthParams.PAYMENT_AUTH_UUID) ??
      localStorage.getItem(paymentAuthenticationStorageKey!)

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
      onAuthSuccess()
      if (skipClearParamsOnSuccess) {
        return
      }
    }

    if (paymentStatus === PaymentAuthStatus.FAILURE) {
      PaymentMetrics.endPsd2Flow({
        status: 'failed',
        paymentAuthenticationUuid: paymentAuthenticationUuid,
        userFlow: mapPaymentAuthFlows[flow],
      })
      onAuthFailure()
    }

    clearAllSearchParams()
  }

  useEffect(() => {
    if (!enabled) {
      return
    }

    handleAuthResult()
  }, [searchParams])
}
