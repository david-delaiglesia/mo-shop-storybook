import { useEffect, useState } from 'react'

import { monitoring } from 'monitoring'

import { useUserUUID } from 'app/authentication'
import { CheckoutClient } from 'app/checkout/client'
import { CheckoutAuthState } from 'app/checkout/interfaces'
import { PaymentAuthenticationType } from 'app/payment'
import { usePolling } from 'hooks/usePolling'
import { knownFeatureFlags, useFlag } from 'services/feature-flags'

const POLLING_INTERVAL = 1000 // 1 second

interface UseCheckoutRestPaymentProps {
  checkoutId: number
  onSuccess: () => void
  onError: (reason: 'unknown' | 'authentication_failed') => void
  onFallbackRequired: (
    authenticationUuid: string,
    authenticationType: PaymentAuthenticationType,
  ) => void
  onMitRequired: (authenticationUuid: string) => void
}

interface UseCheckoutRestPaymentReturn {
  isLoading: boolean
  isAuthenticating?: boolean
  startPolling: (authenticationType: PaymentAuthenticationType) => void
  cancelAuthentication: () => Promise<void>
  startLoading: () => void
}

export const useCheckoutRestPayment = ({
  checkoutId,
  onSuccess,
  onError,
  onFallbackRequired,
  onMitRequired,
}: UseCheckoutRestPaymentProps): UseCheckoutRestPaymentReturn => {
  const flagCheckoutNewConfirmStrategy = useFlag(
    knownFeatureFlags.CHECKOUT_NEW_CONFIRM_STRATEGY,
  )

  const customerId = useUserUUID()

  const [pollingEnabled, setPollingEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [fallbackAuthenticationType, setFallbackAuthenticationType] = useState(
    PaymentAuthenticationType.AUTH,
  )

  const { data: pollingData } = usePolling(
    () =>
      CheckoutClient.getAuthenticationStatus(customerId, checkoutId).catch(
        () => null,
      ),
    {
      interval: POLLING_INTERVAL,
      enabled: pollingEnabled,
    },
  )

  // Initial check for payment status
  useEffect(() => {
    if (!flagCheckoutNewConfirmStrategy) return

    CheckoutClient.getAuthenticationStatus(customerId, checkoutId).then(
      (response) => {
        if (!response) return

        if (response.state === CheckoutAuthState.PROCESSING_AUTHENTICATION) {
          setPollingEnabled(true)
          setIsLoading(true)
          setIsAuthenticating(false)
          return
        }

        if (response.state === CheckoutAuthState.AUTHENTICATING) {
          setPollingEnabled(true)
          setIsLoading(false)
          setIsAuthenticating(true)
        }

        if (response.state === CheckoutAuthState.FALLBACK_REQUIRED) {
          setIsLoading(true)
          onFallbackRequired(
            response.authentication_uuid,
            PaymentAuthenticationType.AUTH,
          )
        }

        if (response.state === CheckoutAuthState.MIT_REQUIRED) {
          onMitRequired(response.authentication_uuid)
        }
      },
    )
  }, [customerId, checkoutId])

  useEffect(() => {
    if (!pollingEnabled || !pollingData) {
      return
    }

    switch (pollingData.state) {
      case CheckoutAuthState.PROCESSING_AUTHENTICATION: {
        setIsLoading(true)
        setIsAuthenticating(false)
        return
      }

      case CheckoutAuthState.AUTHENTICATING: {
        setIsLoading(false)
        setIsAuthenticating(true)
        return
      }

      case CheckoutAuthState.CONFIRMED: {
        setPollingEnabled(false)
        setIsLoading(false)
        setIsAuthenticating(false)
        onSuccess()
        return
      }

      case CheckoutAuthState.NOT_CONFIRMED: {
        setPollingEnabled(false)
        setIsLoading(false)
        setIsAuthenticating(false)
        onError('unknown')
        return
      }

      case CheckoutAuthState.AUTHENTICATION_FAILED: {
        setPollingEnabled(false)
        setIsLoading(false)
        setIsAuthenticating(false)
        onError('authentication_failed')
        return
      }

      case CheckoutAuthState.FALLBACK_REQUIRED: {
        setPollingEnabled(false)
        setIsAuthenticating(false)
        setIsLoading(true)
        onFallbackRequired(
          pollingData.authentication_uuid,
          fallbackAuthenticationType,
        )
        return
      }

      case CheckoutAuthState.MIT_REQUIRED: {
        setPollingEnabled(false)
        setIsLoading(false)
        setIsAuthenticating(false)
        onMitRequired(pollingData.authentication_uuid)
        return
      }
    }

    monitoring.sendMessage('Unknown checkout authentication REST state', {
      state: (pollingData as unknown as { state: string }).state,
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pollingData])

  const startLoading = () => {
    setIsLoading(true)
  }

  const startPolling = (authenticationType: PaymentAuthenticationType) => {
    setFallbackAuthenticationType(authenticationType)
    setPollingEnabled(true)
    setIsLoading(true)
  }

  const cancelAuthentication = async () => {
    setPollingEnabled(false)
    setIsAuthenticating(false)
    setIsLoading(true)

    try {
      await CheckoutClient.cancelAuthentication({
        customerId,
        checkoutId,
      })
    } finally {
      setIsLoading(false)
      onError('authentication_failed')
    }
  }

  return {
    isLoading,
    isAuthenticating,
    startPolling,
    cancelAuthentication,
    startLoading,
  }
}
