export enum CheckoutAuthState {
  PROCESSING_AUTHENTICATION = 'processing_authentication',
  AUTHENTICATING = 'authenticating',
  AUTHENTICATION_FAILED = 'authentication_failed',
  CONFIRMED = 'confirmed',
  NOT_CONFIRMED = 'not_confirmed',
  FALLBACK_REQUIRED = 'fallback_required',
  MIT_REQUIRED = 'mit_required',
}

export type CheckoutAuthStatusResponse =
  | { state: CheckoutAuthState.PROCESSING_AUTHENTICATION }
  | { state: CheckoutAuthState.AUTHENTICATING }
  | { state: CheckoutAuthState.AUTHENTICATION_FAILED }
  | { state: CheckoutAuthState.CONFIRMED }
  | { state: CheckoutAuthState.NOT_CONFIRMED }
  | { state: CheckoutAuthState.FALLBACK_REQUIRED; authentication_uuid: string }
  | { state: CheckoutAuthState.MIT_REQUIRED; authentication_uuid: string }
