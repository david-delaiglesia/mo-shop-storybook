import { PaymentAuthenticationFlow } from 'app/payment/PaymentMetrics'

export enum PaymentAuthStatus {
  SUCCESS = 'success',
  FAILURE = 'failure',
}

export enum PaymentAuthParams {
  PAYMENT_STATUS = 'status',
  PAYMENT_METHOD = 'payment_method',
  PAYMENT_AUTH_UUID = 'payment_authentication_uuid',
  PAYMENT_AUTH_STORAGE_KEY = 'payment_authentication_storage_key',
  PAYMENT_FLOW = 'payment_flow',
}

export enum PaymentAuthFlow {
  RESOLVE_PAYMENT_INCIDENCE = 'resolve_payment_incidence',
  RESOLVE_RESCHEDULED_PAYMENT_INCIDENCE = 'resolve_rescheduled_payment_incidence',
  UPDATE_ORDER_INCIDENCE_PAYMENT_METHOD = 'update_order_incidence_payment_method',
  UPDATE_ORDER_PAYMENT_METHOD = 'update_order_payment_method',
  UPDATE_ORDER_LINES = 'update_order_lines',
  UPDATE_CHECKOUT_PAYMENT_METHOD = 'update_checkout_payment_method',
  CHECKOUT = 'checkout',
  CHECKOUT_AUTO_CONFIRM = 'checkout_auto_confirm',
}

export const mapPaymentAuthFlows: Record<
  PaymentAuthFlow,
  PaymentAuthenticationFlow
> = {
  [PaymentAuthFlow.RESOLVE_PAYMENT_INCIDENCE]:
    PaymentAuthenticationFlow.PAYMENT_ISSUE,
  [PaymentAuthFlow.RESOLVE_RESCHEDULED_PAYMENT_INCIDENCE]:
    PaymentAuthenticationFlow.REPREPARED_PAYMENT_ISSUE,
  [PaymentAuthFlow.UPDATE_ORDER_PAYMENT_METHOD]:
    PaymentAuthenticationFlow.EDIT_ORDER,
  [PaymentAuthFlow.UPDATE_ORDER_INCIDENCE_PAYMENT_METHOD]:
    PaymentAuthenticationFlow.EDIT_ORDER,
  [PaymentAuthFlow.UPDATE_ORDER_LINES]: PaymentAuthenticationFlow.EDIT_ORDER,
  [PaymentAuthFlow.CHECKOUT]: PaymentAuthenticationFlow.CHECKOUT,
  [PaymentAuthFlow.UPDATE_CHECKOUT_PAYMENT_METHOD]:
    PaymentAuthenticationFlow.CHECKOUT,
  [PaymentAuthFlow.CHECKOUT_AUTO_CONFIRM]: PaymentAuthenticationFlow.CHECKOUT,
}
