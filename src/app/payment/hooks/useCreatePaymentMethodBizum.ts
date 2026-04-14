import { useState } from 'react'

import { OrderPaymentClient } from '../client_new'

import { useUserUUID } from 'app/authentication'

interface UseCreatePaymentMethodBizumPayload {
  phoneCountryCode: string
  phoneNationalNumber: string
}

export const useCreatePaymentMethodBizum = (callbacks?: {
  onSuccess?: (data: UseCreatePaymentMethodBizumPayload) => void
  onError?: (error: unknown, data: UseCreatePaymentMethodBizumPayload) => void
  onSettled?: (data: UseCreatePaymentMethodBizumPayload) => void
}) => {
  const customerId = useUserUUID()
  const [isMutating, setIsMutating] = useState(false)

  const createPaymentMethodBizum = async (
    payload: UseCreatePaymentMethodBizumPayload,
  ) => {
    setIsMutating(true)
    try {
      await OrderPaymentClient.createPaymentMethodBizum({
        customerId,
        payload,
      })
      callbacks?.onSuccess?.(payload)
    } catch (error) {
      callbacks?.onError?.(error, payload)
    } finally {
      setIsMutating(false)
      callbacks?.onSettled?.(payload)
    }
  }

  return {
    createPaymentMethodBizum,
    isMutating,
  }
}
