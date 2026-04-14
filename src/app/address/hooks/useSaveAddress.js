import { AddressClient } from '../client'

import { useUserUUID } from 'app/authentication'

export const useSaveAddress = () => {
  const customerId = useUserUUID()

  const saveAddress = async (address, { onSuccess, onError }) => {
    try {
      const response = await AddressClient.save(customerId, address)

      onSuccess?.(response)
    } catch (error) {
      onError?.(error)
    }
  }

  return {
    saveAddress,
  }
}
