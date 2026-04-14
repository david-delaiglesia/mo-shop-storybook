import { bool, shape, string } from 'prop-types'

export const AddressPropTypes = shape({
  permanent: bool,
  address: string.isRequired,
  detail: string,
  postalCode: string.isRequired,
  town: string.isRequired,
})
