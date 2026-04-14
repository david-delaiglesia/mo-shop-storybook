import { CreditCardType } from './interfaces'

import { HTTP_STATUS } from 'services/http'

export const SCA_STATUS = {
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
} as const

export const SCA_SOURCES = {
  SCA_UPDATE_PAYMENT: 'SCA_UPDATE_PAYMENT',
  SCA_ADDED_PAYMENT: 'SCA_ADDED_PAYMENT',
  SCA_CONFIRM: 'SCA_CONFIRM',

  SCA_RESOLVE_RESCHEDULED_PAYMENT_INCIDENT:
    'SCA_RESOLVE_RESCHEDULED_PAYMENT_INCIDENT',
} as const

export const CreditCardName: Record<CreditCardType, string> = {
  [CreditCardType.UNKNOWN]: 'unknown',
  [CreditCardType.VISA]: 'visa',
  [CreditCardType.MASTERCARD]: 'mastercard',
  [CreditCardType.MAESTRO]: 'maestro',
}

export const PAYMENT_SEARCH_PARAMS = {
  SHOW_RESOLVE_PAYMENT_INCIDENT: 'resolvePaymentIncident',
  SHOW_ADD_NEW_PAYMENT_METHOD_MODAL: 'showAddNewPaymentMethodModal',
  SHOW_PAYMENT_CARD_LIST: 'showPaymentCardList',
} as const

export const SCA_STATUS_CODES = [
  HTTP_STATUS.AUTHENTICATION_REQUIRED,
  HTTP_STATUS.MIT,
] as number[]
