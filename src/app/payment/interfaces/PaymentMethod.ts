export enum PaymentMethodExpirationStatus {
  VALID = 'valid',
  EXPIRES_SOON = 'expires_soon',
  EXPIRED = 'expired',
}

export enum CreditCardType {
  UNKNOWN = 0,
  VISA = 1,
  MASTERCARD = 2,
  // DISCOVER = 3,
  // AMEX = 4,
  // DINERS = 5,
  // UNIONPAY = 6,
  // JCB = 7,
  MAESTRO = 8,
}

export enum PaymentMethodType {
  CREDIT_CARD = 'card',
  BIZUM = 'bizum',
}

export interface PaymentMethodResponse {
  id: number
  credit_card_type: CreditCardType
  credit_card_number: string
  expires_month: string
  expires_year: string
  default_card: boolean
  expiration_status: PaymentMethodExpirationStatus
  ui_content: {
    title: string
    subtitle: string
    icon: {
      url: string
      content_description: string
    }
  }
}

export interface PaymentMethod {
  id: number
  creditCardType: CreditCardType
  creditCardNumber: string
  expiresMonth: string
  expiresYear: string
  defaultCard: boolean
  expirationStatus: PaymentMethodExpirationStatus
  uiContent: {
    title: string
    subtitle: string
    icon: {
      url: string
      contentDescription: string
    }
  }
}
