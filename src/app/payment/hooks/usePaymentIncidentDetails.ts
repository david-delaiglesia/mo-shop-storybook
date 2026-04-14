import { useEffect, useState } from 'react'

import { OrderPaymentClient } from '../client_new'
import { PaymentIncidentDetails } from '../interfaces'

import { useUserUUID } from 'app/authentication'
import { useOrderContext } from 'app/order/contexts/OrderContext'

interface UsePaymentIncidentDetailsResult {
  details: PaymentIncidentDetails | null
  isLoading: boolean
  refetch: () => Promise<void>
}

export const usePaymentIncidentDetails =
  (): UsePaymentIncidentDetailsResult => {
    const { order } = useOrderContext()
    const [details, setDetails] = useState<PaymentIncidentDetails | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const orderId = order?.id

    const customerId = useUserUUID()

    useEffect(() => {
      fetchPaymentIncidentDetails()
    }, [customerId, orderId])

    const fetchPaymentIncidentDetails = async () => {
      if (!orderId) return

      setIsLoading(true)

      try {
        const response = await OrderPaymentClient.getPaymentIncidentDetails({
          customerId,
          orderId,
        })

        setDetails(response)
      } catch {
        setDetails(null)
      } finally {
        setIsLoading(false)
      }
    }

    return {
      details,
      isLoading,
      refetch: fetchPaymentIncidentDetails,
    }
  }
