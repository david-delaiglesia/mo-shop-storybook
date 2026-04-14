import { AddressClient } from '../client'

import { useUserUUID } from 'app/authentication'

export const useAddressForward = () => {
  const customerId = useUserUUID()

  const getAddressForward = ({ postalCode }) =>
    AddressClient.getAddressForward(customerId, {
      postalCode,
    })

  return {
    getAddressForward,
  }
}
