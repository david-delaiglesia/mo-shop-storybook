import { useState } from 'react'

import { OrderPaymentClient } from '../client_new'

import { useUserUUID } from 'app/authentication'

export const useRetryOrderPaymentWithBizum = ({
  orderId,
}: {
  orderId: number | string
}) => {
  const customerId = useUserUUID()
  const [isMutating, setIsMutating] = useState(false)

  const retryOrderPaymentWithBizum = async (
    phone: {
      phoneCountryCode: string
      phoneNationalNumber: string
    },
    callbacks?: {
      onSuccess: () => void
      onError: (error: unknown) => void
      onSettled: () => void
    },
  ) => {
    setIsMutating(true)
    try {
      await OrderPaymentClient.retryOrderPaymentWithBizum({
        customerId,
        orderId,
        phone,
      })
      callbacks?.onSuccess()
    } catch (error) {
      callbacks?.onError(error)
    } finally {
      setIsMutating(false)
      callbacks?.onSettled()
    }
  }

  return {
    retryOrderPaymentWithBizum,
    isMutating,
  }
}
