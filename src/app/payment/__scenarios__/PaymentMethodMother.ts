import {
  CreditCardType,
  PaymentMethodExpirationStatus,
  PaymentMethodResponse,
} from 'app/payment'

export const PaymentMethodMother = {
  creditCardVisaValid(defaultCard = true): PaymentMethodResponse {
    return {
      id: 4721,
      credit_card_type: CreditCardType.VISA,
      credit_card_number: '6017',
      expires_month: '01',
      expires_year: '2023',
      default_card: defaultCard,
      expiration_status: PaymentMethodExpirationStatus.VALID,
      ui_content: {
        title: '**** 6017',
        subtitle: 'Expires 01/23',
        icon: {
          url: 'visa-icon.png',
          content_description: 'Visa',
        },
      },
    }
  },

  creditCardMastercardValid(defaultCard = true): PaymentMethodResponse {
    return {
      id: 4720,
      credit_card_type: CreditCardType.MASTERCARD,
      credit_card_number: '6023',
      expires_month: '01',
      expires_year: '2023',
      default_card: defaultCard,
      expiration_status: PaymentMethodExpirationStatus.VALID,
      ui_content: {
        title: '**** 6023',
        subtitle: 'Expires 01/23',
        icon: {
          url: 'mastercard-icon.png',
          content_description: 'Mastercard',
        },
      },
    }
  },

  bizum(defaultCard = true): PaymentMethodResponse {
    return {
      id: 4722,
      credit_card_type: CreditCardType.UNKNOWN,
      credit_card_number: '',
      expires_month: '12',
      expires_year: '2099',
      default_card: defaultCard,
      expiration_status: PaymentMethodExpirationStatus.VALID,
      ui_content: {
        title: '+34 700000000',
        subtitle: 'Bizum',
        icon: {
          url: 'bizum.png',
          content_description: 'Bizum',
        },
      },
    }
  },
}
