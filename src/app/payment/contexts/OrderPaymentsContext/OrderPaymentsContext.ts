import { createContext } from 'react'

import { PaymentAuthFlow } from 'app/payment/hooks'
import { PaymentTokenAuthnFlow } from 'app/payment/interfaces'

export interface OrderPaymentsContextState {
  resolvePaymentIncidence: (
    paymentMethodId: number,
    paymentAuthnFlow:
      | PaymentAuthFlow.RESOLVE_PAYMENT_INCIDENCE
      | PaymentAuthFlow.RESOLVE_RESCHEDULED_PAYMENT_INCIDENCE,
  ) => void

  resolvePaymentIncidenceNewBizum: (
    paymentMethod: { countryCode: string; nationalNumber: string },
    paymentTokenAuthnFlow:
      | PaymentTokenAuthnFlow.RESOLVE_PAYMENT_INCIDENT
      | PaymentTokenAuthnFlow.RESOLVE_RESCHEDULED_PAYMENT_INCIDENT,
  ) => void

  startPollingOrderPaymentIncident: () => void
}

export const OrderPaymentsContext =
  createContext<OrderPaymentsContextState | null>(null)
