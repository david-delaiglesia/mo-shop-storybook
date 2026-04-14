import { bool, shape, string } from 'prop-types'

import { PriceInstructionsPropTypes } from 'domain/price-instructions'

const BadgesPropTypes = shape({
  is_water: bool.isRequired,
})

export const ProductPropTypes = shape({
  id: string.isRequired,
  display_name: string.isRequired,
  thumbnail: string.isRequired,
  packaging: string,
  price_instructions: PriceInstructionsPropTypes.isRequired,
  badges: BadgesPropTypes.isRequired,
})

export const ProductListPropTypes = shape({
  [string]: ProductPropTypes,
})
