// Remove void on remove flag BIZUM_REST_RESOLVE_PAYMENT_INCIDENT
export type ResolvePaymentIncidentResultResponse =
  | void
  | {
      code: 'processing_payment'
    }
  | {
      code: 'authentication_required'
    }

// Remove undefined on remove flag BIZUM_REST_RESOLVE_PAYMENT_INCIDENT
export type ResolvePaymentIncidentResult =
  | undefined
  | {
      code: 'processing_payment'
    }
  | {
      code: 'authentication_required'
    }
