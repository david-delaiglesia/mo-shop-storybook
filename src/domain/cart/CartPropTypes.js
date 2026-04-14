import { number, shape, string } from 'prop-types'

import { OrderLinePropTypes } from 'domain/order-line'

const Summary = shape({
  total: string,
})

export const CartPropTypes = shape({
  id: string.isRequired,
  products: shape({
    [string]: OrderLinePropTypes,
  }).isRequired,
  summary: Summary,
  products_count: number,
})
