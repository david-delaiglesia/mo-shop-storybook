// WIP interface for Product, could be incomplete or subject to change

export interface ProductCategory {
  id: number
  name: string
  level: number
  order: number
  categories?: ProductCategory[]
}

export enum SellingMethod {
  UNIT = 0,
  BUNCH = 1,
}

export interface PriceInstructions {
  iva: number
  is_new: boolean
  is_pack: boolean
  pack_size: null | number
  unit_name: null | string
  unit_size: number
  bulk_price: string
  unit_price: string
  approx_size: boolean
  size_format: string
  total_units: null | number
  drained_weight: null | number
  price_decreased: boolean
  reference_price: string
  min_bunch_amount: number
  reference_format: string
  increment_bunch_amount: number
  selling_method: SellingMethod
}

export interface ProductResponse {
  id: string
  slug: string
  limit: number
  badges: {
    is_water: boolean
    requires_age_check: boolean
  }
  published: boolean
  packaging: string
  thumbnail: string
  display_name: string
  categories: ProductCategory[]
  price_instructions: PriceInstructions
}

/**
 * WIP interface for Product, could be incomplete
 */
export interface Product {
  id: string
  limit: number
  thumbnail: string
  display_name: string
  price_instructions: PriceInstructions
  recommendedQuantity?: number
  is_new_arrival: boolean
}
