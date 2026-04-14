import type { OrderPaymentStatus } from '../interfaces'
import type { OrderStatus, OrderStatusUI } from './OrderStatus'

import type { Address, AddressResponse } from 'app/address'
import type { PaymentMethod, PaymentMethodResponse } from 'app/payment'
import type { Slot, SlotResponse } from 'app/shared/slot'
import type { SummaryResponse } from 'app/shared/summary'

export interface OrderResponse {
  id: number
  order_id: number
  payment_method: PaymentMethodResponse
  payment_status: OrderPaymentStatus
  status: OrderStatus
  status_ui: OrderStatusUI
  address: AddressResponse
  changes_until?: string
  customer_phone: string
  end_date: string
  final_price: boolean
  phone_country_code: string
  phone_national_number: string
  price: string
  products_count: number
  slot: SlotResponse
  slot_size: number
  start_date: string
  summary: SummaryResponse
  service_rating_token: string | null
  warehouse_code: string
  timezone: string
  rescheduled_order: { adjustment_amount: string } | null
}

// ... TODO: this interface is not fully typed, only that is needed at this moment
export interface Order {
  id: number
  orderId: number
  paymentMethod: PaymentMethod
  paymentStatus: OrderPaymentStatus
  status: OrderStatusUI
  rescheduledOrder: { adjustmentAmount: string } | null
  productsCount: number
  address: Address
  changesUntil?: string
  timezone: string

  // TODO: pending to migrate to camel case in serializer
  summary: SummaryResponse
  slot: Slot
}
