import type { OrderLine, OrderLineResponse } from './OrderLine'

// WIP interface for Cart backend response
export interface CartResponse {
  id: string
  lines: OrderLineResponse[]
  open_order_id?: number
  version?: number
  origin?: string
}

// WIP interface for Cart frontend usage
export interface Cart {
  id: string
  products: OrderLine[]
  openOrderId?: number
  version?: number
  origin?: string
}
