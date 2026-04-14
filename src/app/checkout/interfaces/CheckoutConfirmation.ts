import { AuthenticationExemption } from 'app/payment'

export enum CheckoutConfirmationStatus {
  CREATED,
  ACCEPTED,
}

export type CheckoutConfirmationResponse = { order_id: number }

export type CheckoutConfirmationAuthenticationRequired =
  | {
      authentication_mode: 'redirection'
      authentication_uuid: string
      exemption: AuthenticationExemption | null
    }
  | {
      authentication_mode: 'rest'
    }

export type CheckoutConfirmation =
  | {
      status: CheckoutConfirmationStatus.CREATED
      payload: { orderId: number }
    }
  | {
      status: CheckoutConfirmationStatus.ACCEPTED
      payload:
        | {
            authenticationMode: 'redirection'
            authenticationUuid: string
            exemption: AuthenticationExemption | null
          }
        | {
            authenticationMode: 'rest'
          }
    }
