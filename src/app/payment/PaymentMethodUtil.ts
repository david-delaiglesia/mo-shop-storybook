import type { PaymentMethod } from 'app/payment'

export const PaymentMethodUtil = {
  getAriaLabel(paymentMethod: PaymentMethod): string {
    return [
      paymentMethod.uiContent.icon.contentDescription,
      paymentMethod.uiContent.title,
      paymentMethod.uiContent.subtitle,
    ]
      .filter(Boolean)
      .join(', ')
  },
}
