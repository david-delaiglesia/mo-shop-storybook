import { getDay } from 'utils/dates'

export const mockedOrder = {
  id: 5,
  address: {
    id: 1,
    address: 'Calle Plaza America, 2',
    address_detail: 'Piso 6',
    town: 'Massarrojos',
    comments: '',
    entered_manually: false,
    latitude: 39.473994,
    longitude: -0.374906,
    permanent_address: true,
    postal_code: '46010',
  },
  changes_until: '2019-01-30T10:47:25Z',
  customer_phone: 'string',
  end_date: '2019-01-30T10:47:25Z',
  final_price: true,
  order_id: 5,
  payment_method: {
    id: 1,
    credit_card_number: '1234',
    credit_card_type: 1,
    default_card: false,
    expiration_status: 'valid',
    expires_month: '08',
    expires_year: '2023',
    ui_content: {
      title: '**** 1234',
      subtitle: 'Expires 08/23',
      icon: {
        url: 'visa-icon.png',
        content_description: 'Visa',
      },
    },
  },
  payment_status: 0,
  phone_country_code: '34',
  phone_national_number: '645785924',
  price: '45.5',
  products_count: 1,
  slot: {
    id: '1',
    start: '2017-11-10T07:00:00Z',
    end: '2017-11-10T08:00:00Z',
    price: '7.21',
    available: true,
    open: true,
    timezone: 'Europe/Madrid',
  },
  slot_size: 0,
  start_date: '2017-10-28T07:00:00Z',
  status: 2,
  status_ui: 'confirmed',
  summary: {
    products: '45.50',
    slot: '7.21',
    total: '52.71',
    taxes: '9.15',
    tax_base: '43.56',
    volume_extra_cost: {
      threshold: 70,
      cost_by_extra_liter: '0.1',
      total_extra_liters: 0,
      total: '0.00',
      required: null,
    },
    required: null,
  },
  warehouse_code: 'vlc1',
  timezone: 'Europe/Madrid',
}

export const mockedOrderWithSlotBonus = {
  ...mockedOrder,
  summary: {
    products: '45.50',
    slot: '7.21',
    slot_bonus: '7.21',
    total: '52.71',
    taxes: '9.15',
    tax_base: '43.56',
    volume_extra_cost: {
      threshold: 70,
      cost_by_extra_liter: '0.1',
      total_extra_liters: 0,
      total: '0.00',
      required: null,
    },
    required: null,
  },
}

export const dynamicMockedOrder = (slotDay, editDate) => ({
  id: 5,
  address: {
    id: 1,
    address: 'Calle Plaza America, 2',
    address_detail: 'Piso 6',
    town: 'Massarrojos',
    comments: '',
    entered_manually: false,
    latitude: 39.473994,
    longitude: -0.374906,
    permanent_address: true,
    postal_code: '46010',
  },
  changes_until: `${getDay(editDate)}T10:47:25Z`,
  customer_phone: 'string',
  end_date: `${getDay(editDate)}T10:47:25Z`,
  final_price: true,
  order_id: 5,
  payment_method: {
    id: 1,
    credit_card_number: '1234',
    credit_card_type: 1,
    default_card: false,
    expiration_status: 'valid',
    expires_month: '08',
    expires_year: '2023',
    ui_content: {
      title: '**** 1234',
      subtitle: 'Expires 08/23',
      icon: {
        url: 'visa-icon.png',
        content_description: 'Visa',
      },
    },
  },
  payment_status: 0,
  phone_country_code: '34',
  phone_national_number: '645785924',
  price: '45.5',
  products_count: 1,
  slot: {
    id: '1',
    start: `${getDay(slotDay)}T07:00:00Z`,
    end: `${getDay(slotDay)}T08:00:00Z`,
    price: '7.21',
    available: true,
    open: true,
  },
  slot_size: 0,
  start_date: `${getDay(slotDay)}T07:00:00Z`,
  status: 2,
  status_ui: 'confirmed',
  summary: {
    products: '45.50',
    slot: '7.21',
    total: '52.71',
    taxes: '9.15',
    tax_base: '43.56',
    volume_extra_cost: {
      threshold: 70,
      cost_by_extra_liter: '0.1',
      total_extra_liters: 0,
      total: '0.00',
      required: null,
    },
    required: null,
  },
  warehouse_code: 'vlc1',
})

export const ongoingOrder = {
  ...mockedOrder,
  status: 'confirmed',
  payment_status: 0,
}

export const preparingOrder = { ...mockedOrder, status: 'preparing' }

export const preparedOrder = { ...mockedOrder, status: 'prepared' }

export const deliveredOrder = {
  ...mockedOrder,
  status_ui: 'delivered',
  payment_status: 2,
}

export const cancelledByUserOrder = {
  ...mockedOrder,
  status: 'cancelled-by-customer',
}

export const pdfBlob = {
  size: 3141,
  type: 'application/pdf',
}
