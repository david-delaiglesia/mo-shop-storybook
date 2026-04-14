import { AddressClient } from '../client'

import { useUserUUID } from 'app/authentication'

export const useAddressAccuracy = () => {
  const customerId = useUserUUID()

  const getAddressAccuracy = ({ flowId, street, number, postalCode, town }) =>
    AddressClient.getAccuracy(customerId, {
      flowId,
      street,
      number,
      postalCode,
      town,
    })

  return {
    getAddressAccuracy,
  }
}
