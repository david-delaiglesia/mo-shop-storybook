import { PaymentIncidentReason } from './PaymentIncidentDetails'
import { PaymentIncidentStatus } from './PaymentIncidentStatus'

export enum PaymentIncidentState {
  PROCESSING_AUTHENTICATION = 'processing_authentication',
  AUTHENTICATING = 'authenticating',
  AUTHENTICATION_FAILED = 'authentication_failed',
  PROCESSING_PAYMENT = 'processing_payment',
  PAYMENT_SUCCEEDED = 'payment_succeeded',
  PAYMENT_FAILED = 'payment_failed',
  FALLBACK_REQUIRED = 'fallback_required',
}

type PaymentIncidentStatusLegacy = {
  status: PaymentIncidentStatus
  state?: never
  reason?: PaymentIncidentReason
}

export type PaymentIncidentStatusResponse =
  | PaymentIncidentStatusLegacy
  | {
      state:
        | PaymentIncidentState.PROCESSING_AUTHENTICATION
        | PaymentIncidentState.AUTHENTICATING
        | PaymentIncidentState.AUTHENTICATION_FAILED
        | PaymentIncidentState.PROCESSING_PAYMENT
        | PaymentIncidentState.PAYMENT_SUCCEEDED
      status: never
    }
  | {
      state: PaymentIncidentState.PAYMENT_FAILED
      reason?: PaymentIncidentReason
      status: never
    }
  | {
      state: PaymentIncidentState.FALLBACK_REQUIRED
      authentication_uuid: string
      status: never
    }
