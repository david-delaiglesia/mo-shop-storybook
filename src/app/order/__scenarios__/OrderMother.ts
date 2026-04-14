import { AddressMother } from 'app/address/__scenarios__/AddressMother'
import {
  OrderPaymentStatus,
  OrderResponse,
  OrderStatus,
  OrderStatusUI,
} from 'app/order'
import { PaymentMethodMother } from 'app/payment/__scenarios__/PaymentMethodMother'

const baseOrder: OrderResponse = {
  id: 44051,
  address: AddressMother.arquitectoMora(),
  changes_until: '2020-02-25T21:59:59Z',
  customer_phone: '+34644004736',
  end_date: '2020-02-26T18:00:00Z',
  final_price: false,
  order_id: 44051,
  payment_method: PaymentMethodMother.creditCardVisaValid(),
  payment_status: OrderPaymentStatus.PENDING,
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
    cutoff_time: '2017-11-09T19:59:59Z',
    timezone: 'Europe/Madrid',
  },
  slot_size: 1,
  start_date: '2020-02-26T17:00:00Z',
  status: OrderStatus.CONFIRMED,
  status_ui: OrderStatusUI.CONFIRMED,
  rescheduled_order: null,
  summary: {
    products: '63.75',
    slot: '7.21',
    total: '70.96',
    taxes: '6.46',
    tax_base: '64.50',
    slot_bonus: null,
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

export const OrderMother = {
  DEFAULT_ORDER_ID: 44051 as const,

  confirmed(): OrderResponse {
    return {
      ...baseOrder,
      status: OrderStatus.CONFIRMED,
      status_ui: OrderStatusUI.CONFIRMED,
    }
  },

  confirmedWithCutoffMorning(): OrderResponse {
    return {
      ...this.confirmed(),
      changes_until: '2020-02-25T00:59:59Z',
    }
  },

  confirmedWithBizum(): OrderResponse {
    return {
      ...this.confirmed(),
      payment_method: PaymentMethodMother.bizum(),
    }
  },

  confirmedWithMastercard(): OrderResponse {
    return {
      ...this.confirmed(),
      payment_method: PaymentMethodMother.creditCardMastercardValid(),
    }
  },

  cancelledByUser(): OrderResponse {
    return {
      ...baseOrder,
      status: OrderStatus.CANCELLED_BY_CUSTOMER,
      status_ui: OrderStatusUI.CANCELLED_BY_USER,
    }
  },

  cancelledBySystem(): OrderResponse {
    return {
      ...baseOrder,
      status: OrderStatus.CANCELLED_BY_SYSTEM,
      status_ui: OrderStatusUI.CANCELLED_BY_SYSTEM,
    }
  },

  preparing(): OrderResponse {
    return {
      ...baseOrder,
      status: OrderStatus.PREPARING,
      status_ui: OrderStatusUI.PREPARING,
    }
  },

  preparedPendingPayment(): OrderResponse {
    return {
      ...baseOrder,
      status: OrderStatus.PREPARED,
      status_ui: OrderStatusUI.PREPARED,
      payment_status: OrderPaymentStatus.PENDING,
      rescheduled_order: { adjustment_amount: '5.25' },
    }
  },

  preparedPaid(): OrderResponse {
    return {
      ...baseOrder,
      status: OrderStatus.PREPARED,
      status_ui: OrderStatusUI.PREPARED,
      payment_status: OrderPaymentStatus.DONE,
    }
  },

  delivering() {
    return {
      ...baseOrder,
      status: OrderStatus.DELIVERING,
      status_ui: OrderStatusUI.DELIVERING,
    }
  },

  nextToDelivery(): OrderResponse {
    return {
      ...baseOrder,
      status: OrderStatus.DELIVERING,
      status_ui: OrderStatusUI.NEXT_TO_DELIVERY,
    }
  },

  delivered(): OrderResponse {
    return {
      ...baseOrder,
      status: OrderStatus.DELIVERED,
      status_ui: OrderStatusUI.DELIVERED,
    }
  },

  paymentFailed(): OrderResponse {
    return {
      ...baseOrder,
      status: OrderStatus.CONFIRMED,
      status_ui: OrderStatusUI.CONFIRMED,
      payment_status: OrderPaymentStatus.FAILED,
    }
  },

  repreparedPaymentPending(): OrderResponse {
    return {
      ...baseOrder,
      status: OrderStatus.CONFIRMED,
      status_ui: OrderStatusUI.CONFIRMED,
      payment_status: OrderPaymentStatus.REPREPARED_WITH_PENDING_PAYMENT,
      rescheduled_order: { adjustment_amount: '5.25' },
    }
  },

  userUnreachable(): OrderResponse {
    return {
      ...baseOrder,
      status: OrderStatus.USER_UNREACHABLE,
      status_ui: OrderStatusUI.DISRUPTED_BY_CUSTOMER,
      payment_status: OrderPaymentStatus.DONE,
    }
  },

  delayed(): OrderResponse {
    return {
      ...baseOrder,
      status: OrderStatus.DELAYED,
      status_ui: OrderStatusUI.DISRUPTED_BY_SYSTEM,
      payment_status: OrderPaymentStatus.DONE,
    }
  },
}
