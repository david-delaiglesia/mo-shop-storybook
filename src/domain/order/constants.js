import { OrderStatusUI } from 'app/order'

export const PRINTABLE_STATUSES = [
  OrderStatusUI.PREPARED,
  OrderStatusUI.DELIVERING,
  OrderStatusUI.DELIVERED,
  OrderStatusUI.DISRUPTED_BY_CUSTOMER,
  OrderStatusUI.DISRUPTED_BY_SYSTEM,
]

export const STATUSES_WITH_ESTIMATED_PRICE = [
  OrderStatusUI.CONFIRMED,
  OrderStatusUI.PREPARING,
  OrderStatusUI.CANCELLED_BY_USER,
  OrderStatusUI.CANCELLED_BY_SYSTEM,
]

export const EDITABLE_STATUSES = [OrderStatusUI.CONFIRMED]

export const CANCELABLE_STATUSES = [OrderStatusUI.CONFIRMED]

export const CANCELLED_STATUSES = [
  OrderStatusUI.CANCELLED_BY_USER,
  OrderStatusUI.CANCELLED_BY_SYSTEM,
]

export const REPEATABLE_STATUSES = [
  OrderStatusUI.DELIVERED,
  OrderStatusUI.CANCELLED_BY_USER,
  OrderStatusUI.CANCELLED_BY_SYSTEM,
]

export const FINAL_STATUSES = [
  OrderStatusUI.DELIVERED,
  OrderStatusUI.CANCELLED_BY_USER,
  OrderStatusUI.CANCELLED_BY_SYSTEM,
]

export const DISRUPTED_STATUSES = [
  OrderStatusUI.DISRUPTED_BY_CUSTOMER,
  OrderStatusUI.DISRUPTED_BY_SYSTEM,
]
