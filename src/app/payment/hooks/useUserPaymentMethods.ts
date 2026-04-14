import { useEffect, useState } from 'react'

import { PaymentClient } from '../client'
import { PaymentMethod } from '../interfaces'

import { useUserUUID } from 'app/authentication'

interface UseUserPaymentMethodsResult {
  paymentMethods: PaymentMethod[]
  defaultPaymentMethod: PaymentMethod | null
  nonDefaultPaymentMethods: PaymentMethod[]
  isLoading: boolean
  refetch: () => Promise<void>
}

export const useUserPaymentMethods = (): UseUserPaymentMethodsResult => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const userUuid = useUserUUID()

  const fetchUserPaymentMethods = async () => {
    setIsLoading(true)

    try {
      const response = await PaymentClient.getListByUserId(userUuid)
      if (response) {
        setPaymentMethods(response)
        return response
      }
    } catch {
      setPaymentMethods([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (userUuid) fetchUserPaymentMethods()
  }, [userUuid])

  return {
    paymentMethods,
    defaultPaymentMethod: paymentMethods.find((pm) => pm.defaultCard) ?? null,
    nonDefaultPaymentMethods: paymentMethods.filter((pm) => !pm.defaultCard),
    isLoading,
    refetch: fetchUserPaymentMethods,
  }
}
