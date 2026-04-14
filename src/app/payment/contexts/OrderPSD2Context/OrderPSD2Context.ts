import { createContext } from 'react'

import { PaymentAuthFlow } from 'app/payment/hooks'
import {
  PaymentAuthentication,
  PaymentTokenAuthnFlow,
} from 'app/payment/interfaces'

export const OrderPSD2Context = createContext<{
  startPsd2Auth: (
    paymentAuthnFlow:
      | PaymentAuthFlow.RESOLVE_PAYMENT_INCIDENCE
      | PaymentAuthFlow.RESOLVE_RESCHEDULED_PAYMENT_INCIDENCE,
    paymentAuthenticationUuid: string,
  ) => void
  redirectPsd2TokenAuth: (payload: {
    paymentTokenAuthnFlow: PaymentTokenAuthnFlow
    paymentAuthentication: PaymentAuthentication
    paymentAuthenticationStorageKey: string
  }) => void
  getPsd2TokenAuthnCardParams: (
    paymentTokenAuthnFlow: PaymentTokenAuthnFlow,
  ) => Promise<{
    paymentAuthentication: PaymentAuthentication
    okUrl: string
    koUrl: string
  }>
} | null>(null)
