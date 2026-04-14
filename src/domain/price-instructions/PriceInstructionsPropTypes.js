import { bool, number, shape, string } from 'prop-types'

export const PriceInstructionsPropTypes = shape({
  selling_method: number,
  size_format: string,
  bulk_price: string,
  is_pack: bool,
  approx_size: bool,
  reference_format: string,
  reference_price: string,
  unit_price: string,
  min_bunch_amount: number,
  increment_bunch_amount: number,
  unit_name: string,
  pack_size: number,
  price_decreased: bool,
  total_units: number,
  drained_weight: number,
  unit_size: number,
})
