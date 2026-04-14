import { AddressClient } from '../client'

import { useUserUUID } from 'app/authentication'

export const useAddressReverse = () => {
  const customerId = useUserUUID()

  const getAddressReverse = (params: {
    latitude: number
    longitude: number
    userFlow: string
    flowId: string
  }) => AddressClient.getAddressReverse(customerId, params)

  return {
    getAddressReverse,
  }
}
