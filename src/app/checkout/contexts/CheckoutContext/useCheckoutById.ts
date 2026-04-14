import { useEffect, useState } from 'react'

import { useUserUUID } from 'app/authentication'
import { CheckoutClient } from 'app/checkout/client'
import { Checkout } from 'app/checkout/interfaces'

export const useCheckoutById = (checkoutId: Checkout['id']) => {
  const [checkout, setCheckout] = useState<Checkout | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)

  const userUuid = useUserUUID()

  const fetchCheckout = async (): Promise<Checkout | undefined> => {
    setIsLoading(true)

    if (!userUuid) return undefined

    try {
      const result = await CheckoutClient.getById(userUuid, checkoutId)
      setCheckout(result ?? undefined)
      return result ?? undefined
    } catch {
      setCheckout(undefined)
      return undefined
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCheckout()
  }, [checkoutId, userUuid])

  return {
    checkout,
    isLoading,
    refetchCheckout: fetchCheckout,
  }
}
