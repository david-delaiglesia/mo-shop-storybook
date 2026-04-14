import { AddressClient } from '../client'

import { useUserUUID } from 'app/authentication'

export const useAddressValidation = () => {
  const customerId = useUserUUID()

  const getAddressValidation = ({ latitude, longitude, postalCode }) =>
    AddressClient.getAddressValidation(customerId, {
      latitude,
      longitude,
      postalCode,
    })

  return {
    getAddressValidation,
  }
}
