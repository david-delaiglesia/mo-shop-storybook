import { createContext } from 'react'

import { Order } from 'app/order/interfaces'

export interface OrderContextState {
  order: Order | null
  isLoading: boolean
  refetchOrder: () => Promise<Order | null>
}

export const fallbackOrderContextState: OrderContextState = {
  order: null,
  isLoading: false,
  refetchOrder: async () => null,
}

export const OrderContext = createContext<OrderContextState | null>(null)
