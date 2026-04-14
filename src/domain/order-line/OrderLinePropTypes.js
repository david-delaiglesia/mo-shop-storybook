import { bool, number, shape, string } from 'prop-types'

import { PriceInstructionsPropTypes } from 'domain/price-instructions'
import { ProductPropTypes } from 'domain/product'

export const OrderLinePropTypes = shape({
  quantity: number,
  total: number,
  order: number,
  is_water: bool,
  requires_age_check: bool,
  id: string,
  product: ProductPropTypes,
  priceInstructions: PriceInstructionsPropTypes,
  published: bool,
})
