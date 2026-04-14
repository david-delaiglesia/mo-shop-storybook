import { PaymentMethod, PaymentMethodResponse } from './PaymentMethod'

export enum PaymentIncidentReason {
  INSUFFICIENT_FUNDS = 'insufficient_funds',
  UNKNOWN = 'unknown',
  INACTIVE_CARD = 'inactive_card',
  ONLINE_PAYMENT_DISABLED = 'online_payment_disabled',
}

export interface PaymentIncidentDetailsResponse {
  reason: PaymentIncidentReason
  payment_method: PaymentMethodResponse
}

export interface PaymentIncidentDetails {
  reason: PaymentIncidentReason
  paymentMethod: PaymentMethod
}
