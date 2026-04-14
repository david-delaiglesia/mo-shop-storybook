import { useEffect, useState } from 'react'

import { useUserUUID } from 'app/authentication'
import { useOrderContext } from 'app/order/contexts/OrderContext'
import { OrderPaymentClient } from 'app/payment/client_new'
import {
  Psd2AuthenticatingModal,
  Psd2AuthenticatingModalProps,
} from 'app/payment/components/psd2-authenticating-modal'

interface OrderAuthenticatingModalProps {
  flow: Psd2AuthenticatingModalProps['flow']
  onClose: () => void
}

const useAuthenticationDetails = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [details, setDetails] = useState<{
    totalAmount: string
    remainingTime: number
  } | null>(null)

  const customerId = useUserUUID()
  const { order } = useOrderContext()

  useEffect(() => {
    if (!order?.id || !customerId) {
      return
    }

    OrderPaymentClient.getAuthenticationDetails({
      customerId,
      orderId: order.id,
    })
      .then(setDetails)
      .finally(() => {
        setIsLoading(false)
      })
  }, [customerId, order?.id])

  return {
    isLoading,
    details,
  }
}

export const OrderAuthenticatingModal = ({
  flow,
  onClose,
}: OrderAuthenticatingModalProps) => {
  const { details, isLoading } = useAuthenticationDetails()

  return (
    <Psd2AuthenticatingModal
      flow={flow}
      onClose={onClose}
      isLoading={isLoading}
      remainingTime={details?.remainingTime ?? 0}
      estimatedAmount={details?.totalAmount ?? ''}
      totalAmount={details?.totalAmount ?? ''}
      hasVariableWeight={false}
    />
  )
}
