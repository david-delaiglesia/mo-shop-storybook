import { useEffect, useState } from 'react'

import { OrderClient } from '../client'

import { useUserUUID } from 'app/authentication'
import { Order } from 'app/order/interfaces'

export const useOrderEarlierCutoff = (orderId?: Order['id']) => {
  const [isEarlierCutoff, setIsEarlierCutoff] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState(true)

  const userUuid = useUserUUID()

  const fetchOrderEarlierCutoff = async () => {
    setIsLoading(true)

    if (!userUuid || !orderId) return null

    try {
      const result = await OrderClient.getEarlierCutoff(userUuid, orderId)
      setIsEarlierCutoff(result.earlierCutoff)
    } catch {
      setIsEarlierCutoff(false)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchOrderEarlierCutoff()
  }, [orderId, userUuid])

  return {
    isEarlierCutoff,
    isLoading,
  }
}
