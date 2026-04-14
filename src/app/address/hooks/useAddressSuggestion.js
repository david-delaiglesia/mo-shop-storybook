import { AddressClient } from '../client'

import { useUserUUID } from 'app/authentication'

export const useAddressSuggestion = () => {
  const customerId = useUserUUID()

  const getAddressSuggestion = (suggestionId) =>
    AddressClient.getSuggestion(customerId, suggestionId)

  return {
    getAddressSuggestion,
  }
}
