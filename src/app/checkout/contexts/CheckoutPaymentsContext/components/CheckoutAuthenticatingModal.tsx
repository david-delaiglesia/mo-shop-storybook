import { useEffect, useState } from 'react'

import { useUserUUID } from 'app/authentication'
import { CheckoutClient } from 'app/checkout/client'
import { useCheckoutContext } from 'app/checkout/contexts/CheckoutContext'
import { CheckoutAuthenticationDetail } from 'app/checkout/interfaces'
import { Psd2AuthenticatingModal } from 'app/payment'

interface CheckoutAuthenticatingModalProps {
  onClose: () => void
}

const useAuthenticationDetails = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [details, setDetails] = useState<CheckoutAuthenticationDetail | null>(
    null,
  )

  const customerId = useUserUUID()
  const { checkoutId } = useCheckoutContext()

  useEffect(() => {
    if (!checkoutId || !customerId) {
      return
    }

    CheckoutClient.getAuthenticationDetails(customerId, checkoutId)
      .then(setDetails)
      .finally(() => {
        setIsLoading(false)
      })
  }, [customerId, checkoutId])

  return {
    isLoading,
    details,
  }
}

export const CheckoutAuthenticatingModal = ({
  onClose,
}: CheckoutAuthenticatingModalProps) => {
  const { details, isLoading } = useAuthenticationDetails()

  return (
    <Psd2AuthenticatingModal
      flow="authorization"
      onClose={onClose}
      isLoading={isLoading}
      {...details!}
    />
  )
}
