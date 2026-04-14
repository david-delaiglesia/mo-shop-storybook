import { useEffect, useState } from 'react'

import { OrderClientTS } from '../client_new'

import { useUserUUID } from 'app/authentication'
import { Order } from 'app/order/interfaces'

export const useOrderConfirmationDetails = (orderId?: Order['id'] | string) => {
  const [orderConfirmationDetails, setOrderConfirmationDetails] = useState<{
    showPaymentTimingModal: boolean
  } | null>(null)

  const userUuid = useUserUUID()

  const fetchOrderConfirmationDetails = async () => {
    if (!userUuid || !orderId) return null

    try {
      const result = await OrderClientTS.getConfirmationDetails(
        userUuid,
        orderId,
      )
      setOrderConfirmationDetails(result)
    } catch {
      setOrderConfirmationDetails(null)
    }
  }

  useEffect(() => {
    fetchOrderConfirmationDetails()
  }, [orderId, userUuid])

  return {
    orderConfirmationDetails,
  }
}
