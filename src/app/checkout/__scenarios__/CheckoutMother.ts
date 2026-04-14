import { CartMother } from 'app/cart/__scenarios__/CartMother'
import {
  CheckoutAuthenticationType,
  CheckoutResponse,
} from 'app/checkout/interfaces'
import { OrderMother } from 'app/order/__scenarios__/OrderMother'
import { PaymentMethodMother } from 'app/payment/__scenarios__/PaymentMethodMother'
import { TaxType } from 'app/shared/summary'

const baseCheckout: CheckoutResponse = {
  id: 5,
  order_id: null,
  address: {
    id: 1,
    address: 'Calle Arquitecto Mora, 10',
    address_detail: 'Piso 8 Puerta 14',
    postal_code: '46010',
    latitude: '39.47318090',
    longitude: '-0.36310200',
    comments: 'Comments',
    permanent_address: true,
    entered_manually: true,
    town: 'València',
  },
  cart: CartMother.simple(),
  customer_phone: '+34672185007',
  payment_method: PaymentMethodMother.creditCardVisaValid(),
  phone_country_code: '34',
  phone_national_number: '645 78 59 24',
  price: '45.5',
  slot: null,
  slot_size: 0,
  summary: {
    products: '68.25',
    slot: '7.21',
    slot_bonus: null,
    total: '75.46',
    taxes: '13.10',
    tax_base: '75.46',
    tax_type: TaxType.IVA,
    volume_extra_cost: {
      threshold: 70,
      cost_by_extra_liter: '0.1',
      total_extra_liters: 0,
      total: '0.00',
    },
  },
  requires_address_confirmation: false,
  requires_age_check: false,
  timezone: 'Europe/Madrid',
}

export const CheckoutMother = {
  default: (): CheckoutResponse => baseCheckout,

  filled: (): CheckoutResponse => ({
    ...baseCheckout,
    slot: {
      id: '1',
      start: '2017-11-10T07:00:00Z',
      end: '2017-11-10T08:00:00Z',
      price: '8.20',
      available: true,
      open: true,
      cutoff_time: '2017-11-09T19:59:59Z',
      timezone: 'Europe/Madrid',
    },
    slot_size: 1,
  }),

  withoutPaymentMethod: (): CheckoutResponse => ({
    ...CheckoutMother.filled(),
    payment_method: null,
  }),

  withBizum: (): CheckoutResponse => ({
    ...CheckoutMother.filled(),
    payment_method: PaymentMethodMother.bizum(),
  }),

  withMastercard: (): CheckoutResponse => ({
    ...CheckoutMother.filled(),
    payment_method: PaymentMethodMother.creditCardMastercardValid(),
  }),

  confirmed: (): CheckoutResponse => ({
    ...CheckoutMother.filled(),
    order_id: OrderMother.DEFAULT_ORDER_ID,
  }),

  confirmedWithBizum: (): CheckoutResponse => ({
    ...CheckoutMother.withBizum(),
    order_id: OrderMother.DEFAULT_ORDER_ID,
  }),

  empty: (): CheckoutResponse => ({
    ...CheckoutMother.default(),
    address: null,
    payment_method: null,
    slot: null,
    customer_phone: null,
    phone_country_code: null,
    phone_national_number: null,
  }),

  withoutSlot: (): CheckoutResponse => ({
    ...CheckoutMother.filled(),
    slot: null,
  }),

  withoutDeliveryInfo: (): CheckoutResponse => ({
    ...CheckoutMother.filled(),
    address: null,
    slot: null,
  }),

  withoutContactInfo: (): CheckoutResponse => ({
    ...CheckoutMother.filled(),
    customer_phone: null,
    phone_country_code: null,
    phone_national_number: null,
  }),

  withFreeSlot: (): CheckoutResponse => {
    const checkout = CheckoutMother.filled()

    return {
      ...checkout,
      summary: {
        ...checkout.summary,
        slot_bonus: '7.21',
      },
    }
  },

  withIpsi: (): CheckoutResponse => {
    const checkout = CheckoutMother.default()

    return {
      ...checkout,
      summary: {
        ...checkout.summary,
        tax_type: TaxType.IPSI,
      },
    }
  },

  withIgic: (): CheckoutResponse => {
    const checkout = CheckoutMother.default()

    return {
      ...checkout,
      summary: {
        ...checkout.summary,
        tax_type: TaxType.IGIC,
      },
    }
  },

  withSCA: (): CheckoutResponse => {
    const checkout = CheckoutMother.filled()

    return {
      ...checkout,
      authentication_type: CheckoutAuthenticationType.SCA,
    }
  },
}
