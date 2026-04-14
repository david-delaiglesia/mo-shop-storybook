import {
  Checkout,
  CheckoutAuthenticationType,
  CheckoutConfirmed,
} from './interfaces'

export const CheckoutUtils = {
  hasDelivery(checkout: Checkout) {
    return checkout.summary.slot !== '0.00'
  },

  slotBonus(checkout: Checkout) {
    return checkout.summary.slot_bonus
  },

  isConfirmed(checkout: Checkout): checkout is CheckoutConfirmed {
    return !!checkout.orderId
  },

  isSCA(checkout: Checkout) {
    return checkout.authenticationType === CheckoutAuthenticationType.SCA
  },

  isPaymentDisabled(checkout?: Checkout): boolean {
    if (!checkout) return false
    const { address, slot, customerPhone } = checkout
    return !address || !slot || !customerPhone
  },
}
