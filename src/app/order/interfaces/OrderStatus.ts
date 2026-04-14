export enum OrderStatus {
  CHECKOUT = 0,
  CONFIRMED = 2,
  PREPARING = 3,
  PREPARED = 4,
  DELIVERING = 5,
  DELIVERED = 6,
  CANCELLED_BY_CUSTOMER = 7,
  CANCELLED_BY_SYSTEM = 8,
  USER_UNREACHABLE = 9,
  DELAYED = 10,
}

export enum OrderStatusUI {
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  PREPARED = 'prepared',
  DELIVERING = 'delivering',
  NEXT_TO_DELIVERY = 'next-to-delivery',
  DELIVERED = 'delivered',
  CANCELLED_BY_USER = 'cancelled-by-customer',
  CANCELLED_BY_SYSTEM = 'cancelled-by-system',
  DISRUPTED_BY_CUSTOMER = 'user-unreachable',
  DISRUPTED_BY_SYSTEM = 'delayed',
}
