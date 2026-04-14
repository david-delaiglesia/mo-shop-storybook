import type { PriceInstructions, ProductResponse } from 'app/products'

// WIP interface for OrderLine backend response
export interface OrderLineResponse {
  id?: number
  quantity?: number
  recommended_quantity?: number
  product_id?: string
  product: ProductResponse
  original_price_instructions?: PriceInstructions
  sources?: string[]
  version?: number
  source?: string
  source_code?: string
}

// WIP interface for OrderLine frontend usage
export interface OrderLine {
  orderLineId?: number
  quantity?: number
  product: ProductResponse
  priceInstructions?: PriceInstructions
  sources?: string[]
  version?: number
}
