import { bool, number, shape, string } from 'prop-types'

export const CardPropTypes = shape({
  id: number,
  creditCardNumber: string.isRequired,
  creditCardType: number.isRequired,
  defaultCard: bool,
  expirationStatus: string.isRequired,
  expiresMonth: string.isRequired,
  expiresYear: string.isRequired,
})
