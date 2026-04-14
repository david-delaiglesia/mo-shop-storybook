import type { Address, AddressResponse } from 'app/address'
import type { Cart, CartResponse } from 'app/cart'
import type { PaymentMethod, PaymentMethodResponse } from 'app/payment'
import type { Slot, SlotResponse } from 'app/shared/slot'
import type { Summary, SummaryResponse } from 'app/shared/summary'

export enum CheckoutAuthenticationType {
  SCA = 'sca',
}

export interface CheckoutResponse {
  id: number
  order_id: number | null
  address?: AddressResponse | null
  payment_method?: PaymentMethodResponse | null
  cart: CartResponse
  authentication_type?: CheckoutAuthenticationType
  customer_phone?: string | null
  phone_country_code?: string | null
  phone_national_number?: string | null
  price: string
  requires_age_check: boolean
  requires_address_confirmation: boolean
  slot: SlotResponse | null
  slot_size: number
  summary: SummaryResponse
  timezone: string
}

/**
 * WIP
 */
export interface Checkout {
  id: number
  /** Only presents when the order has been created and the checkout is confirmed */
  orderId?: number
  address?: Address
  paymentMethod?: PaymentMethod
  cart: Cart
  authenticationType?: CheckoutAuthenticationType
  customerPhone?: string
  phoneCountryCode?: string
  phoneNationalNumber?: string
  price: string
  requiresAgeCheck: boolean
  requiresAddressConfirmation: boolean
  slot: Slot | null
  slotSize: number
  summary: Summary
  timezone: string
}

export interface CheckoutConfirmed extends Checkout {
  orderId: number
}
