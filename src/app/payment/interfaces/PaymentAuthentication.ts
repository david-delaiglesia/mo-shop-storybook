import { PaymentMethodType } from './PaymentMethod'
import { PaymentProvider } from './PaymentProvider'

export interface PaymentAuthenticationResponse {
  authentication_uuid: string
  provider: PaymentProvider
  payment_method_type: PaymentMethodType
  params: {
    URL_Base: string
    [key: string]: string
  }
}

export interface PaymentAuthentication {
  authenticationUuid: string
  provider: PaymentProvider
  paymentMethodType: PaymentMethodType
  params: PaymentAuthenticationResponse['params']
}

export enum PaymentAuthenticationType {
  TOKEN_AUTH = 'tokenization_authentication',
  TOKEN = 'tokenization',
  AUTH = 'authentication',
}
