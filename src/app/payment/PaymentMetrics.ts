import { CreditCardName } from './constants'
import {
  PaymentAuthenticationType,
  PaymentMethod,
  PaymentMethodType,
  PaymentProvider,
} from './interfaces'

import { camelCaseToSnakeCase } from '@mercadona/mo.library.dashtil'

import { Tracker } from 'services/tracker'

export enum PaymentAuthenticationFlow {
  CHECKOUT = 'checkout',
  EDIT_ORDER = 'edit_order',
  ADD_PAYMENT_METHOD = 'add_payment_method',
  PAYMENT_ISSUE = 'payment_issue',
  REPREPARED_PAYMENT_ISSUE = 'reprepared_payment_issue',
}

export const PaymentMetrics = {
  payWithBizumClick() {
    Tracker.sendInteraction('pay_with_bizum_click')
  },

  bizumRequirementsModal() {
    Tracker.sendInteraction('bizum_requirements_modal')
  },

  bizumAddPhoneClick(payload: { countryCode: string; phoneNumber: string }) {
    Tracker.sendInteraction(
      'bizum_add_phone_click',
      camelCaseToSnakeCase(payload),
    )
  },

  phoneWithoutBizumAlertView() {
    Tracker.sendInteraction('phone_without_bizum_alert_view')
  },

  startPsd2Flow({
    isMIT,
    ...payload
  }: {
    paymentMethodType: PaymentMethodType
    type: PaymentAuthenticationType
    provider: PaymentProvider
    paymentAuthenticationUuid: string | null
    userFlow: PaymentAuthenticationFlow
    isMIT: boolean
  }) {
    Tracker.sendInteraction('start_psd2_flow', {
      ...camelCaseToSnakeCase(payload),
      is_MIT: isMIT,
    })
  },

  endPsd2Flow(payload: {
    status: 'success' | 'failed'
    userFlow: PaymentAuthenticationFlow
    paymentAuthenticationUuid: string
  }) {
    Tracker.waitForSession(() =>
      Tracker.sendInteraction('end_psd2_flow', camelCaseToSnakeCase(payload)),
    )
  },

  psd2ModalView(payload: {
    timeLeft: number
    hasExtraToAuthenticate: boolean
  }) {
    Tracker.sendInteraction('psd2_modal_view', camelCaseToSnakeCase(payload))
  },

  psd2CancelClick() {
    Tracker.sendInteraction('psd2_cancel_click')
  },

  deletePaymentMethodClick({
    id,
    uiContent,
  }: Pick<PaymentMethod, 'id' | 'uiContent'>) {
    Tracker.sendInteraction('delete_payment_method_click', {
      payment_method_id: id,
      payment_method: uiContent.title,
    })
  },

  makeDefaultPaymentClick({
    id,
    creditCardNumber,
    creditCardType,
  }: Pick<PaymentMethod, 'id' | 'creditCardNumber' | 'creditCardType'>) {
    Tracker.sendInteraction('make_default_payment_click', {
      payment_id: id,
      payment_digits: creditCardNumber,
      payment_type: CreditCardName[creditCardType],
    })
  },

  selectPaymentMethodTypeClick(payload: {
    paymentMethodType: PaymentMethodType
    orderId?: string | number
  }) {
    Tracker.sendInteraction(
      'select_payment_method_type_click',
      camelCaseToSnakeCase(payload),
    )
  },

  selectPaymentMethodClick(payload: {
    orderId?: string | number
    paymentMethodId: number
    paymentMethod: string
  }) {
    Tracker.sendInteraction(
      'select_payment_method_click',
      camelCaseToSnakeCase(payload),
    )
  },

  addPaymentMethodClick(payload: {
    orderId?: string | number
    checkoutId?: string | number
  }) {
    Tracker.sendInteraction(
      'add_payment_method_click',
      camelCaseToSnakeCase(payload),
    )
  },

  paymentErrorView(payload: {
    orderId?: string | number
    checkoutId?: string | number
    errorType: string
    errorHeaderDisplayed?: string
    errorDescriptionDisplayed?: string
  }) {
    Tracker.sendInteraction('payment_error_view', camelCaseToSnakeCase(payload))
  },

  paymentSuccessView(payload: { orderId?: string | number }) {
    Tracker.sendInteraction(
      'payment_success_view',
      camelCaseToSnakeCase(payload),
    )
  },

  paymentMethodsModalView(payload: {
    orderId?: number
    paymentMethodIds: number[]
  }) {
    Tracker.sendInteraction(
      'payment_methods_modal_view',
      camelCaseToSnakeCase(payload),
    )
  },

  paymentMethodModalClose() {
    Tracker.sendInteraction('payment_method_modal_close')
  },

  paymentRetryClick(payload: { orderId?: string | number }) {
    Tracker.sendInteraction(
      'payment_retry_click',
      camelCaseToSnakeCase(payload),
    )
  },

  authenticationFailedAlertView() {
    Tracker.sendInteraction('authentication_failed_alert_view')
  },

  authenticationFailedAlertRetryClick() {
    Tracker.sendInteraction('authentication_failed_alert_retry_click')
  },

  authenticationFailedAlertDismiss() {
    Tracker.sendInteraction('authentication_failed_alert_dismiss')
  },

  mitTermView() {
    Tracker.sendInteraction('mit_term_view')
  },

  mitTermAcceptClick() {
    Tracker.sendInteraction('mit_term_accept_button_click')
  },

  mitTermCancelClick() {
    Tracker.sendInteraction('mit_term_cancel_button_click')
  },
}
