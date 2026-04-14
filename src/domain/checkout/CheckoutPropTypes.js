import { bool, number, object, shape, string } from 'prop-types'

/**
 * @deprecated
 */
export const CheckoutPropTypes = shape({
  id: number.isRequired,
  address: object,
  cart: object,
  customerPhone: string,
  orderId: number,
  paymentMethod: object,
  phoneCountryCode: string,
  phoneNationalNumber: string,
  price: string,
  requiresAgeCheck: bool,
  requiresAddressConfirmation: bool,
  slot: object,
  slotSize: number,
  summary: object,
})
