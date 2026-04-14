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
  unit_selector: boolean
  bunch_selector: boolean
  drained_weight: null | number
  selling_method: number
  tax_percentage: string
  price_decreased: boolean
  reference_price: string
  min_bunch_amount: number
  reference_format: string
  previous_unit_price: null | string
  increment_bunch_amount: number
}

export interface Suggestion {
  id: string
  displayName: string
  thumbnail: string
  priceInstructions: PriceInstructions
  order: number
}
