import { serializeCheckout } from '../serializer'

import { address } from 'app/address/__scenarios__/address'

const mockedCheckout = {
  id: 5,
  address,
  cart: {
    id: '1234abcd',
    lines: [
      {
        product: {
          id: '28745',
          display_name: 'Ron dominicano añejo superior Brugal',
        },
        product_id: '28745',
        quantity: 5,
      },
    ],
  },
  customer_phone: '+34672185007',
  payment_method: {
    id: 4687,
    credit_card_number: '6007',
    credit_card_type: 2,
    default_card: true,
    expiration_status: 'valid',
    expires_month: '01',
    expires_year: '2023',
    ui_content: {
      title: '**** 6007',
      subtitle: 'Expires 01/23',
      icon: {
        url: 'mastercard-icon.png',
        content_description: 'Mastercard',
      },
    },
  },
  phone_country_code: '34',
  phone_national_number: '645 78 59 24',
  price: '45.5',
  requires_age_check: true,
  slot: {
    id: '1',
    start: '2017-11-10T07:00:00Z',
    end: '2017-11-10T08:00:00Z',
    price: '7.21',
    available: true,
    open: true,
    cutoff_time: '2017-11-09T19:59:59Z',
    timezone: 'Europe/Madrid',
  },
  slot_size: 0,
  summary: {
    products: '68.25',
    slot: '7.21',
    total: '75.46',
    taxes: '13.10',
    tax_base: '75.46',
    tax_type: 'iva',
    volume_extra_cost: {
      threshold: 70,
      cost_by_extra_liter: '0.1',
      total_extra_liters: 0,
      total: '0.00',
      required: null,
    },
  },
  timezone: 'Europe/Madrid',
}

const mockedCheckoutWithSlotBonus = {
  ...mockedCheckout,
  slot: {
    id: '1',
    start: '2017-11-10T07:00:00Z',
    end: '2017-11-10T08:00:00Z',
    price: '0.00',
    available: true,
    open: true,
    cutoff_time: '2017-11-09T19:59:59Z',
  },
  summary: {
    products: '68.25',
    slot: '0.00',
    slot_bonus: '7.21',
    total: '75.46',
    taxes: '13.10',
    tax_base: '75.46',
    volume_extra_cost: {
      threshold: 70,
      cost_by_extra_liter: '0.1',
      total_extra_liters: 0,
      total: '0.00',
      required: null,
    },
  },
}

const mockedCheckoutWithIpsi = {
  ...mockedCheckout,
  summary: {
    products: '68.25',
    slot: '7.21',
    total: '75.46',
    taxes: '0.00',
    tax_base: '75.46',
    tax_type: 'ipsi',
    volume_extra_cost: {
      threshold: 70,
      cost_by_extra_liter: '0.1',
      total_extra_liters: 0,
      total: '0.00',
      required: null,
    },
  },
}

const mockedCheckoutWithIgic = {
  ...mockedCheckout,
  summary: {
    products: '68.25',
    slot: '7.21',
    total: '75.46',
    taxes: '2.35',
    tax_base: '75.46',
    tax_type: 'igic',
    volume_extra_cost: {
      threshold: 70,
      cost_by_extra_liter: '0.1',
      total_extra_liters: 0,
      total: '0.00',
      required: null,
    },
  },
}

/** @deprecated use CheckoutMother */
const checkout = {
  ...mockedCheckout,
  requires_address_confirmation: false,
  requires_age_check: false,
}

const checkoutWithSCA = {
  ...mockedCheckout,
  requires_address_confirmation: false,
  requires_age_check: false,
  authentication_type: 'sca',
}

const checkoutWithSCAWithoutSlot = {
  ...mockedCheckout,
  requires_address_confirmation: false,
  requires_age_check: false,
  authentication_type: 'sca',
  slot: null,
}

const checkoutWithAgeConfirmationRequired = {
  ...mockedCheckout,
  requires_age_check: true,
}

const checkoutWithAddressConfirmationRequired = {
  ...mockedCheckout,
  requires_address_confirmation: true,
  slot: null,
}

const checkoutWithoutPaymentMethod = {
  ...mockedCheckout,
  payment_method: null,
}

const checkoutWithoutContactInfo = {
  ...mockedCheckout,
  customer_phone: null,
  phone_national_number: null,
}

const checkoutWithExpiredPaymentMethod = {
  ...mockedCheckout,
  payment_method: {
    ...mockedCheckout.payment_method,
    expiration_status: 'expired',
    credit_card_number: '0001',
    expires_year: '2019',
  },
}

const checkoutWithExpiredPaymentMethodOnSlotDelivery = {
  ...mockedCheckout,
  payment_method: {
    ...mockedCheckout.payment_method,
    default_cart: true,
    expiration_status: 'valid',
    credit_card_number: '6007',
    expires_year: '2021',
  },
  slot: {
    ...mockedCheckout.slot,
    start: '2022-11-10T07:00:00Z',
    end: '2022-11-10T08:00:00Z',
  },
}

const checkoutWithoutAddress = {
  ...checkout,
  address: null,
}

const checkoutWithoutSlot = {
  ...checkout,
  slot: null,
}

const checkoutWithoutSlotWithBlinkingProduct = (date) => ({
  ...checkoutWithoutSlot,
  summary: {
    ...checkout.summary,
    total: '60.00',
  },
  cart: {
    ...checkout.cart,
    lines: [
      {
        ...checkout.cart.lines[0],
        product: {
          ...checkout.cart.lines[0].product,
          unavailable_weekdays: [date.getDay()],
          thumbnail: 'product-image',
        },
      },
    ],
  },
})

const checkoutWithoutSlotWithUnavailableFromBlinkingProduct = (date) => ({
  ...checkoutWithoutSlot,
  summary: {
    ...checkout.summary,
    total: '60.00',
  },
  cart: {
    ...checkout.cart,
    lines: [
      {
        ...checkout.cart.lines[0],
        product: {
          ...checkout.cart.lines[0].product,
          unavailable_from: date,
          unavailable_weekdays: [],
          thumbnail: 'product-image',
        },
      },
    ],
  },
})

const checkoutWithoutSlotWithoutUnavailableFromBlinkingProduct = {
  ...checkoutWithoutSlot,
  summary: {
    ...checkout.summary,
    total: '60.00',
  },
  cart: {
    ...checkout.cart,
    lines: [
      {
        ...checkout.cart.lines[0],
        product: {
          ...checkout.cart.lines[0].product,
          unavailable_weekdays: [],
          thumbnail: 'product-image',
        },
      },
    ],
  },
}

const checkoutWithoutSlotWithUnavailableFromAndUnavailableWeekdaysBlinkingProduct =
  (unavailableFromDay, unavailableWeekDay) => ({
    ...checkoutWithoutSlot,
    summary: {
      ...checkout.summary,
      total: '60.00',
    },
    cart: {
      ...checkout.cart,
      lines: [
        {
          ...checkout.cart.lines[0],
          product: {
            ...checkout.cart.lines[0].product,
            unavailable_from: unavailableFromDay,
            unavailable_weekdays: [unavailableWeekDay.getDay()],
            thumbnail: 'product-image',
          },
        },
      ],
    },
  })

const checkoutWithoutSlotWithUnavailableFromAndMultipleUnavailableWeekdaysBlinkingProduct =
  (unavailableFromDay, unavailableWeekDays) => ({
    ...checkoutWithoutSlot,
    summary: {
      ...checkout.summary,
      total: '60.00',
    },
    cart: {
      ...checkout.cart,
      lines: [
        {
          ...checkout.cart.lines[0],
          product: {
            ...checkout.cart.lines[0].product,
            unavailable_from: unavailableFromDay,
            unavailable_weekdays: unavailableWeekDays.map((day) =>
              day.getDay(),
            ),
            thumbnail: 'product-image',
          },
        },
      ],
    },
  })

const checkoutWithoutSlotWithStaticBlinkingProduct = (days) => {
  return {
    ...checkoutWithoutSlot,
    summary: {
      ...checkout.summary,
      total: '60.00',
    },
    cart: {
      ...checkout.cart,
      lines: [
        {
          ...checkout.cart.lines[0],
          product: {
            ...checkout.cart.lines[0].product,
            unavailable_weekdays: days,
            thumbnail: 'product-image',
          },
        },
      ],
    },
  }
}

const checkoutWithoutDeliveryInfo = {
  ...checkout,
  slot: null,
  address: null,
}

const serializedMockedCheckout = {
  ...serializeCheckout(mockedCheckout),
}

const mockedCheckoutWithoutAddress = {
  ...serializedMockedCheckout,
  address: null,
}

const mockedCheckoutWithoutSlot = {
  ...serializedMockedCheckout,
  slot: null,
}

const disabledCheckout = {
  ...mockedCheckout,
  address: null,
  payment_method: null,
  slot: null,
}

const checkoutWithoutPhoneNumber = {
  ...mockedCheckout,
  customer_phone: null,
  phone_country_code: null,
  phone_national_number: null,
}

const newCheckout = {
  ...checkout,
  slot: null,
  address: null,
  customer_phone: null,
  payment_method: null,
  phone_country_code: null,
  phone_national_number: null,
}

const confirmedCheckout = {
  ...checkout,
  order_id: 5,
}

export {
  checkout,
  mockedCheckoutWithSlotBonus,
  mockedCheckoutWithIpsi,
  mockedCheckoutWithIgic,
  newCheckout,
  checkoutWithoutAddress,
  checkoutWithoutSlot,
  checkoutWithoutSlotWithBlinkingProduct,
  checkoutWithoutSlotWithStaticBlinkingProduct,
  checkoutWithoutDeliveryInfo,
  checkoutWithoutPaymentMethod,
  checkoutWithExpiredPaymentMethod,
  checkoutWithExpiredPaymentMethodOnSlotDelivery,
  checkoutWithoutContactInfo,
  checkoutWithAgeConfirmationRequired,
  checkoutWithAddressConfirmationRequired,
  serializedMockedCheckout,
  mockedCheckoutWithoutAddress,
  mockedCheckoutWithoutSlot,
  disabledCheckout,
  checkoutWithoutPhoneNumber,
  checkoutWithSCA,
  checkoutWithSCAWithoutSlot,
  confirmedCheckout,
  checkoutWithoutSlotWithUnavailableFromBlinkingProduct,
  checkoutWithoutSlotWithoutUnavailableFromBlinkingProduct,
  checkoutWithoutSlotWithUnavailableFromAndUnavailableWeekdaysBlinkingProduct,
  checkoutWithoutSlotWithUnavailableFromAndMultipleUnavailableWeekdaysBlinkingProduct,
}
