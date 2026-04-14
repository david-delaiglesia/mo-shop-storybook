import { useEffect, useMemo, useState } from 'react'

import { AddressClient } from '../client'

import { useUserUUID } from 'app/authentication'

export const useAddresses = () => {
  const [addresses, setAddresses] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const customerId = useUserUUID()

  const fetchAddresses = async () => {
    setIsLoading(true)

    try {
      const response = await AddressClient.getListByUserId(customerId)

      if (response) {
        setAddresses(response)
      }
    } catch {
      setAddresses([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (customerId) {
      fetchAddresses()
    }
  }, [customerId])

  const hasAddresses = useMemo(() => addresses.length > 0, [addresses])

  return {
    addresses,
    hasAddresses,
    isLoading,
    refetchAddresses: fetchAddresses,
  }
}
