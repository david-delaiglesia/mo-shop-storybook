import { useEffect, useState } from 'react'

import { OrderClient } from '../client'
import { Order } from '../interfaces'

import { useUserUUID } from 'app/authentication'

export const useOrderById = (orderId: number | string) => {
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const userUuid = useUserUUID()

  const fetchOrder = async (): Promise<Order | null> => {
    setIsLoading(true)

    if (!userUuid) return null

    try {
      const result = await OrderClient.getById(userUuid, orderId)
      setOrder(result)
      return result
    } catch {
      setOrder(null)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchOrder()
  }, [orderId, userUuid])

  return {
    order,
    isLoading,
    refetchOrder: fetchOrder,
  }
}
