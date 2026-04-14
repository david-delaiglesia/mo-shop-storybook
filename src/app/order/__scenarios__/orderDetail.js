import {
  productBase,
  productBaseWithUnavailableDay,
  productBaseWithUnavailableFromDate,
  productBaseWithUnavailableFromDateAndMultipleUnavailableWeekdaysDate,
  productBaseWithUnavailableFromDateAndUnavailableWeekdaysDate,
  unpublishedProduct,
  waterProduct,
} from 'app/catalog/__scenarios__/product'
import { paymentMethod } from 'app/payment/__scenarios__/payments'

const order = {
  id: 44051,
  address: {
    id: 9695,
    address: 'Carretera Zorrilla, 6',
    address_detail: '6',
    town: 'Valencia',
    comments: '',
    entered_manually: false,
    latitude: '39.44350290',
    longitude: '-0.36645870',
    permanent_address: true,
    postal_code: '46013',
  },
  changes_until: '2020-02-25T21:59:59Z',
  customer_phone: '+34644004736',
  end_date: '2020-02-26T18:00:00Z',
  final_price: false,
  order_id: 44051,
  payment_method: {
    id: 4721,
    credit_card_type: 1,
    credit_card_number: '6017',
    expires_month: '01',
    expires_year: '2023',
    default_card: true,
    expiration_status: 'valid',
    ui_content: {
      title: '**** 6017',
      subtitle: 'Expires 01/23',
      icon: {
        url: 'visa-icon.png',
        content_description: 'Visa',
      },
    },
  },
  payment_status: 0,
  phone_country_code: '34',
  phone_national_number: '644004736',
  price: '63.75',
  products_count: 1,
  slot: {
    id: '71750',
    start: '2020-02-26T17:00:00Z',
    end: '2020-02-26T18:00:00Z',
    price: '7.21',
    available: true,
    timezone: 'Europe/Madrid',
  },
  slot_size: 1,
  start_date: '2020-02-26T17:00:00Z',
  status: 2,
  status_ui: 'confirmed',
  summary: {
    products: '63.75',
    slot: '7.21',
    total: '70.96',
    taxes: '6.46',
    tax_base: '64.50',
    volume_extra_cost: {
      threshold: 70,
      cost_by_extra_liter: '0.1',
      total_extra_liters: 0.0,
      total: '0.00',
    },
  },
  service_rating_token: null,
  warehouse_code: 'vlc1',
  timezone: 'Europe/Madrid',
}

const orderWithSlotBonus = {
  ...order,
  slot: {
    id: '71750',
    start: '2020-02-26T17:00:00Z',
    end: '2020-02-26T18:00:00Z',
    price: '0.00',
    available: true,
  },
  summary: {
    products: '63.75',
    slot: '7.21',
    slot_bonus: '7.21',
    total: '70.96',
    taxes: '6.46',
    tax_base: '64.50',
    volume_extra_cost: {
      threshold: 70,
      cost_by_extra_liter: '0.1',
      total_extra_liters: 0.0,
      total: '0.00',
    },
  },
}

const orderWithIpsi = {
  ...order,
  summary: {
    products: '63.75',
    slot: '7.21',
    total: '70.96',
    taxes: '0.00',
    tax_base: '64.50',
    tax_type: 'ipsi',
    volume_extra_cost: {
      threshold: 70,
      cost_by_extra_liter: '0.1',
      total_extra_liters: 0.0,
      total: '0.00',
    },
  },
}

const orderWithIgic = {
  ...order,
  summary: {
    products: '63.75',
    slot: '7.21',
    total: '70.96',
    taxes: '2.35',
    tax_base: '64.50',
    tax_type: 'igic',
    volume_extra_cost: {
      threshold: 70,
      cost_by_extra_liter: '0.1',
      total_extra_liters: 0.0,
      total: '0.00',
    },
  },
}

const orderWithCustomSlotDate = (date) => ({
  id: 44051,
  address: {
    id: 9695,
    address: 'Carretera Zorrilla, 6',
    address_detail: '6',
    town: 'Valencia',
    comments: '',
    entered_manually: false,
    latitude: '39.44350290',
    longitude: '-0.36645870',
    permanent_address: true,
    postal_code: '46013',
  },
  changes_until: '2020-02-25T21:59:59Z',
  customer_phone: '+34644004736',
  end_date: '2020-02-26T18:00:00Z',
  final_price: false,
  order_id: 44051,
  payment_method: {
    id: 4721,
    credit_card_type: 1,
    credit_card_number: '6017',
    expires_month: '01',
    expires_year: '2023',
    default_card: true,
    expiration_status: 'valid',
  },
  payment_status: 0,
  phone_country_code: '34',
  phone_national_number: '644004736',
  price: '63.75',
  products_count: 1,
  slot: {
    id: '71750',
    start: `${date}T17:00:00Z`,
    end: `${date}T18:00:00Z`,
    price: '7.21',
    available: true,
  },
  slot_size: 1,
  start_date: `${date}T17:00:00Z`,
  status: 2,
  status_ui: 'confirmed',
  summary: {
    products: '63.75',
    slot: '7.21',
    total: '70.96',
    taxes: '6.46',
    tax_base: '64.50',
    volume_extra_cost: {
      threshold: 70,
      cost_by_extra_liter: '0.1',
      total_extra_liters: 0.0,
      total: '0.00',
    },
  },
  service_rating_token: null,
  warehouse_code: 'vlc1',
})

const orderDisruptedPayment = {
  ...order,
  payment_status: 2,
}

const preparingOrder = {
  ...order,
  id: 23523,
  order_id: 23523,
  status_ui: 'preparing',
}

const preparedOrder = {
  ...order,
  id: 21523,
  order_id: 21523,
  status_ui: 'prepared',
}

const deliveringOrder = {
  ...order,
  id: 25523,
  order_id: 25523,
  status_ui: 'delivering',
}

const deliveredOrder = {
  ...order,
  id: 26523,
  order_id: 26523,
  status_ui: 'delivered',
  service_rating_token: '12345',
}

const cancelledByUserOrder = {
  ...order,
  id: 27523,
  order_id: 27523,
  status_ui: 'cancelled-by-customer',
}

const cancelledByEditOrder = {
  ...order,
  id: 28523,
  order_id: 28523,
  status_ui: 'cancelled-by-system',
}

const disruptedByUserOrder = {
  ...order,
  id: 29523,
  order_id: 29523,
  status_ui: 'user-unreachable',
}

const disruptedByEditOrder = {
  ...order,
  id: 20523,
  order_id: 20523,
  status_ui: 'delayed',
}

const disruptedPaymentOrder = {
  ...order,
  id: 32523,
  payment_status: 2,
  status: 10,
}

const orderWithTwoProducts = {
  ...order,
  products_count: 2,
}

const preparedLines = {
  next_page: null,
  results: [
    {
      product: productBase,
      ordered_quantity: 5.0,
      prepared_quantity: null,
      preparation_result: 'pending',
      product_id: '58280',
      original_price_instructions: productBase.price_instructions,
    },
  ],
}

const preparedLinesWithBlinkingProduct = {
  next_page: null,
  results: [
    {
      product: productBaseWithUnavailableDay(0),
      ordered_quantity: 5.0,
      prepared_quantity: null,
      preparation_result: 'pending',
      product_id: '58280',
      original_price_instructions: productBase.price_instructions,
    },
  ],
}

const preparedLinesWithUnavailableFromAndUnavailableWeekdaysBlinkingProduct = (
  unavailableFrom,
  unavailableWeekday,
) => ({
  next_page: null,
  results: [
    {
      product: productBaseWithUnavailableFromDateAndUnavailableWeekdaysDate(
        unavailableFrom,
        unavailableWeekday,
      ),
      ordered_quantity: 5.0,
      prepared_quantity: null,
      preparation_result: 'pending',
      product_id: '58280',
      original_price_instructions: productBase.price_instructions,
    },
  ],
})

const preparedLinesWithUnavailableFromAndMultipleUnavailableWeekdaysBlinkingProduct =
  (unavailableFrom, unavailableWeekdays) => ({
    next_page: null,
    results: [
      {
        product:
          productBaseWithUnavailableFromDateAndMultipleUnavailableWeekdaysDate(
            unavailableFrom,
            unavailableWeekdays,
          ),
        ordered_quantity: 5.0,
        prepared_quantity: null,
        preparation_result: 'pending',
        product_id: '58280',
        original_price_instructions: productBase.price_instructions,
      },
    ],
  })

const preparedLinesWithUnavailableFromBlinkingProduct = (date) => ({
  next_page: null,
  results: [
    {
      product: productBaseWithUnavailableFromDate(date),
      ordered_quantity: 5.0,
      prepared_quantity: null,
      preparation_result: 'pending',
      product_id: '58280',
      original_price_instructions: productBase.price_instructions,
    },
  ],
})

const preparedLinesWithSaturdayBlinkingProduct = {
  next_page: null,
  results: [
    {
      product: productBaseWithUnavailableDay(6),
      ordered_quantity: 5.0,
      prepared_quantity: null,
      preparation_result: 'pending',
      product_id: '58280',
      original_price_instructions: productBase.price_instructions,
    },
  ],
}

const preparedLinesWithUnpublishedProduct = {
  next_page: null,
  results: [
    {
      product: { ...unpublishedProduct, published: true },
      ordered_quantity: 5.0,
      prepared_quantity: null,
      preparation_result: 'pending',
      product_id: unpublishedProduct.id,
      original_price_instructions: unpublishedProduct.price_instructions,
    },
    {
      product: waterProduct,
      ordered_quantity: 5.0,
      prepared_quantity: null,
      preparation_result: 'pending',
      product_id: waterProduct.id,
      original_price_instructions: waterProduct.price_instructions,
    },
  ],
}

const completedPreparedLines = {
  next_page: null,
  results: [
    {
      product: productBase,
      ordered_quantity: 10,
      prepared_quantity: 10,
      preparation_result: 'completed',
      product_id: '8731',
      total_prepared_price: '4.00',
      original_price_instructions: productBase.price_instructions,
    },
  ],
}

const preparedLinesPriceChanged = {
  next_page: null,
  results: [
    {
      product: productBase,
      ordered_quantity: 5.0,
      prepared_quantity: null,
      preparation_result: 'pending',
      original_price_instructions: {
        ...productBase.price_instructions,
        unit_price: '1.50',
      },
      product_id: '58280',
    },
  ],
}

const preparedLinesWithTwoProducts = {
  next_page: null,
  results: [
    {
      product: productBase,
      ordered_quantity: 5.0,
      prepared_quantity: null,
      preparation_result: 'pending',
      product_id: '58280',
    },
    {
      product: waterProduct,
      ordered_quantity: 5.0,
      prepared_quantity: null,
      preparation_result: 'pending',
      product_id: '7788',
    },
  ],
}

const orderWithPaymentMethodUpdated = {
  ...order,
  payment_method: paymentMethod,
}

export {
  order,
  orderWithSlotBonus,
  orderWithTwoProducts,
  orderWithIpsi,
  orderWithIgic,
  preparedLines,
  preparedLinesWithUnpublishedProduct,
  preparedLinesPriceChanged,
  preparedLinesWithTwoProducts,
  preparedLinesWithBlinkingProduct,
  orderDisruptedPayment,
  preparingOrder,
  preparedOrder,
  deliveringOrder,
  deliveredOrder,
  cancelledByUserOrder,
  cancelledByEditOrder,
  disruptedByUserOrder,
  disruptedByEditOrder,
  disruptedPaymentOrder,
  completedPreparedLines,
  orderWithPaymentMethodUpdated,
  preparedLinesWithSaturdayBlinkingProduct,
  preparedLinesWithUnavailableFromBlinkingProduct,
  orderWithCustomSlotDate,
  preparedLinesWithUnavailableFromAndUnavailableWeekdaysBlinkingProduct,
  preparedLinesWithUnavailableFromAndMultipleUnavailableWeekdaysBlinkingProduct,
}
