import {
  PaymentAuthFlow,
  PaymentAuthParams,
  PaymentAuthStatus,
} from './parameters'

import { PaymentMethodType } from 'app/payment/interfaces'

/**
 * At least one of `paymentAuthenticationUuid` or `paymentAuthenticationStorageKey` must be provided
 */
export const generateCallbackUrl = ({
  status,
  paymentMethodType,
  paymentAuthenticationUuid,
  paymentAuthenticationStorageKey,
  paymentFlow,
}: {
  status: PaymentAuthStatus
  paymentMethodType: PaymentMethodType | 'any'
  paymentAuthenticationUuid?: string
  paymentAuthenticationStorageKey?: string
  paymentFlow: PaymentAuthFlow
}) => {
  const searchParams = new URLSearchParams({
    [PaymentAuthParams.PAYMENT_STATUS]: status,
    [PaymentAuthParams.PAYMENT_METHOD]: paymentMethodType,
    [PaymentAuthParams.PAYMENT_FLOW]: paymentFlow,
  })

  if (paymentAuthenticationUuid) {
    searchParams.set(
      PaymentAuthParams.PAYMENT_AUTH_UUID,
      paymentAuthenticationUuid,
    )
  }

  if (paymentAuthenticationStorageKey) {
    searchParams.set(
      PaymentAuthParams.PAYMENT_AUTH_STORAGE_KEY,
      paymentAuthenticationStorageKey,
    )
  }

  return new URL(`?${searchParams}`, window.location.href)
}
