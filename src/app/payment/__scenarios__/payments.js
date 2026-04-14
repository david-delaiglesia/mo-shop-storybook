import { PaymentAuthenticationMother } from './PaymentAuthenticationMother'

const defaultPaymentMethod = {
  credit_card_number: '6007',
  credit_card_type: 2,
  default_card: true,
  expiration_status: 'valid',
  expires_month: '01',
  expires_year: '2023',
  id: 4687,
}

const paymentMethod = {
  credit_card_number: '6023',
  credit_card_type: 2,
  default_card: false,
  expiration_status: 'valid',
  expires_month: '01',
  expires_year: '2023',
  id: 4720,
}

export const expiredPaymentMethod = {
  credit_card_number: '0001',
  credit_card_type: 2,
  default_card: false,
  expiration_status: 'expired',
  expires_month: '01',
  expires_year: '2019',
  id: 4685,
}

export const expiresSoonPaymentMethod = {
  credit_card_number: '0002',
  credit_card_type: 2,
  default_card: false,
  expiration_status: 'expires_soon',
  expires_month: '01',
  expires_year: '2019',
  id: 4686,
}

const withoutPaymentMethods = {
  results: [],
}

const payments = {
  results: [defaultPaymentMethod, paymentMethod],
}

const paymentMethodsWithExpired = {
  results: [expiredPaymentMethod],
}

const cecaIframe = {
  provider: 'ceca',
  params: {
    URL_Base: 'https://tpv.ceca.es/estpvweb/tpv/registroTarjeta.action?',
    param: 'value',
  },
}

const redsysIframe = {
  provider: 'redsys',
  params: { URL_Base: 'https://sis-i.redsys.es:25443/sis/realizarPago' },
}

const paymentAuthenticationRequired = {
  errors: [
    {
      code: 'psd2_authentication_required',
      detail: 'sca_id',
    },
  ],
}

const paymentAuthenticationRequiredForNewCard = {
  errors: [
    {
      code: 'psd2_authentication_required',
      detail: 'new_card_sca_id',
    },
  ],
}

const redsysPsd2Parameters = PaymentAuthenticationMother.redsysCard()

export {
  withoutPaymentMethods,
  paymentMethod,
  payments,
  paymentMethodsWithExpired,
  cecaIframe,
  redsysIframe,
  paymentAuthenticationRequired,
  paymentAuthenticationRequiredForNewCard,
  redsysPsd2Parameters,
}
