import { useEffect, useState } from 'react'

import { OrderPaymentClient } from '../client_new'
import { useOrderPSD2Context } from '../contexts/OrderPSD2Context'
import {
  PaymentIncidentReason,
  PaymentIncidentState,
  PaymentIncidentStatus,
  PaymentTokenAuthnFlow,
} from '../interfaces'
import { PaymentAuthFlow, PaymentAuthStatus } from './payment-authentication'
import { generateCallbackUrl } from './payment-authentication/generate-urls'
import { monitoring } from 'monitoring'

import { useUserUUID } from 'app/authentication'
import { OrderPaymentStatus } from 'app/order'
import { usePolling } from 'hooks/usePolling'
import { knownFeatureFlags, useFlag } from 'services/feature-flags'

const POLLING_INTERVAL = 1000 // 1 second

interface UseResolveOrderPaymentIncidentProps {
  orderId: number | string
  orderPaymentStatus: OrderPaymentStatus
  onSuccess: () => void
  onError: (
    paymentIncidentReason:
      | PaymentIncidentReason
      | null
      | 'authentication_failed',
  ) => void
  onFallbackRequired: (authenticationUuid: string) => void
}

interface UseResolveOrderPaymentIncidentReturn {
  resolveOrderPaymentIncident: (
    paymentMethodId: number,
    callbacks: {
      onError: (error: unknown) => void
    },
  ) => Promise<void>
  resolveOrderPaymentIncidentNewBizum: (
    paymentMethod: { countryCode: string; nationalNumber: string },
    paymentTokenAuthnFlow:
      | PaymentTokenAuthnFlow.RESOLVE_PAYMENT_INCIDENT
      | PaymentTokenAuthnFlow.RESOLVE_RESCHEDULED_PAYMENT_INCIDENT,
    callbacks: {
      onError: (error: unknown) => void
    },
  ) => Promise<void>
  isLoading: boolean
  isAuthenticating?: boolean
  startPolling: () => void
  cancelAuthentication: () => void
}

export const useResolveOrderPaymentIncident = ({
  orderId,
  orderPaymentStatus,
  onSuccess,
  onError,
  onFallbackRequired,
}: UseResolveOrderPaymentIncidentProps): UseResolveOrderPaymentIncidentReturn => {
  const flagBizumRestResolvePaymentIncident = useFlag(
    knownFeatureFlags.BIZUM_REST_RESOLVE_PAYMENT_INCIDENT,
  )

  const customerId = useUserUUID()
  const orderPsd2Context = useOrderPSD2Context()

  const [pollingEnabled, setPollingEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticating, setIsAuthenticating] = useState(false)

  const { data: pollingData } = usePolling(
    () =>
      OrderPaymentClient.getPaymentIncidentStatus({
        customerId,
        orderId,
      }),
    {
      interval: POLLING_INTERVAL,
      enabled: pollingEnabled,
    },
  )

  const resolveOrderPaymentIncident = async (
    paymentMethodId: number,
    callbacks: {
      onError: (error: unknown) => void
    },
  ) => {
    setIsLoading(true)

    try {
      const result = await OrderPaymentClient.resolvePaymentIncident({
        customerId,
        orderId,
        paymentMethodId,
      })

      setPollingEnabled(true)

      if (!flagBizumRestResolvePaymentIncident) {
        return
      }

      if (result?.code === 'processing_payment') {
        setIsLoading(true)
      }

      if (result?.code === 'authentication_required') {
        setIsAuthenticating(true)
      }
    } catch (error) {
      setIsLoading(false)
      callbacks.onError(error)
    }
  }

  const resolveOrderPaymentIncidentNewBizum = async (
    paymentMethod: { countryCode: string; nationalNumber: string },
    paymentTokenAuthnFlow:
      | PaymentTokenAuthnFlow.RESOLVE_PAYMENT_INCIDENT
      | PaymentTokenAuthnFlow.RESOLVE_RESCHEDULED_PAYMENT_INCIDENT,
    callbacks: {
      onError: (error: unknown) => void
    },
  ) => {
    setIsLoading(true)
    const paymentAuthenticationStorageKey = crypto.randomUUID()

    const paymentFlowsMap: Record<PaymentTokenAuthnFlow, PaymentAuthFlow> = {
      [PaymentTokenAuthnFlow.RESOLVE_PAYMENT_INCIDENT]:
        PaymentAuthFlow.RESOLVE_PAYMENT_INCIDENCE,
      [PaymentTokenAuthnFlow.RESOLVE_RESCHEDULED_PAYMENT_INCIDENT]:
        PaymentAuthFlow.RESOLVE_RESCHEDULED_PAYMENT_INCIDENCE,
    }

    try {
      const response = await OrderPaymentClient.addOrderPaymentMethodBizum({
        customerId,
        orderId,
        phone: {
          phoneCountryCode: paymentMethod.countryCode,
          phoneNationalNumber: paymentMethod.nationalNumber,
        },
        okUrl: generateCallbackUrl({
          status: PaymentAuthStatus.SUCCESS,
          paymentAuthenticationStorageKey,
          paymentMethodType: 'any',
          paymentFlow: paymentFlowsMap[paymentTokenAuthnFlow],
        }).toString(),
        koUrl: generateCallbackUrl({
          status: PaymentAuthStatus.FAILURE,
          paymentAuthenticationStorageKey,
          paymentMethodType: 'any',
          paymentFlow: paymentFlowsMap[paymentTokenAuthnFlow],
        }).toString(),
        flow: paymentTokenAuthnFlow,
      })

      if (response.authenticationMode === 'rest') {
        setPollingEnabled(true)

        return
      }

      orderPsd2Context?.redirectPsd2TokenAuth({
        paymentTokenAuthnFlow,
        paymentAuthentication: response.payload,
        paymentAuthenticationStorageKey,
      })
    } catch (error) {
      callbacks.onError(error)
      setIsLoading(false)
    } finally {
      setIsLoading(false)
    }
  }

  // Initial check for payment incident status
  useEffect(() => {
    const hasPaymentIncident = [
      OrderPaymentStatus.FAILED,
      OrderPaymentStatus.REPREPARED_WITH_PENDING_PAYMENT,
    ].includes(orderPaymentStatus)

    if (!hasPaymentIncident) return

    OrderPaymentClient.getPaymentIncidentStatus({
      customerId,
      orderId,
    }).then((response) => {
      if (!flagBizumRestResolvePaymentIncident) {
        if (response?.status === PaymentIncidentStatus.PENDING) {
          setIsLoading(true)
          setPollingEnabled(true)
        }

        return
      }

      if (
        response.state === PaymentIncidentState.PROCESSING_AUTHENTICATION ||
        response.state === PaymentIncidentState.PROCESSING_PAYMENT
      ) {
        setIsLoading(true)
        setPollingEnabled(true)
      }

      if (response.state === PaymentIncidentState.AUTHENTICATING) {
        setIsAuthenticating(true)
        setPollingEnabled(true)
      }

      if (response.state === PaymentIncidentState.FALLBACK_REQUIRED) {
        setIsLoading(true)
        onFallbackRequired(response.authentication_uuid)
        return
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    orderId,
    customerId,
    orderPaymentStatus,
    flagBizumRestResolvePaymentIncident,
  ])

  /**
   * Legacy polling strategy before BIZUM_REST_RESOLVE_PAYMENT_INCIDENT flag
   */
  useEffect(() => {
    if (flagBizumRestResolvePaymentIncident) {
      return
    }

    if (pollingData?.status === PaymentIncidentStatus.PENDING) {
      return
    }

    if (pollingData?.status === PaymentIncidentStatus.SUCCEEDED) {
      onSuccess()
    }

    if (pollingData?.status === PaymentIncidentStatus.FAILED) {
      onError(pollingData?.reason ?? null)
    }

    setPollingEnabled(false)
    setIsLoading(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pollingData, flagBizumRestResolvePaymentIncident])

  /**
   * New polling strategy under BIZUM_REST_RESOLVE_PAYMENT_INCIDENT flag
   */
  useEffect(() => {
    if (!flagBizumRestResolvePaymentIncident || !pollingEnabled) {
      return
    }

    switch (pollingData?.state) {
      case PaymentIncidentState.PROCESSING_AUTHENTICATION:
      case PaymentIncidentState.PROCESSING_PAYMENT: {
        setIsLoading(true)
        setIsAuthenticating(false)
        return
      }

      case PaymentIncidentState.AUTHENTICATING: {
        setIsLoading(false)
        setIsAuthenticating(true)
        return
      }

      case PaymentIncidentState.PAYMENT_SUCCEEDED: {
        setPollingEnabled(false)
        setIsLoading(false)
        setIsAuthenticating(false)

        onSuccess()
        return
      }

      case PaymentIncidentState.PAYMENT_FAILED: {
        setPollingEnabled(false)
        setIsLoading(false)
        setIsAuthenticating(false)

        onError(pollingData?.reason ?? null)
        return
      }

      case PaymentIncidentState.AUTHENTICATION_FAILED: {
        setPollingEnabled(false)
        setIsLoading(false)
        setIsAuthenticating(false)

        onError('authentication_failed')
        return
      }

      case PaymentIncidentState.FALLBACK_REQUIRED: {
        setPollingEnabled(false)
        setIsLoading(true)
        setIsAuthenticating(false)

        onFallbackRequired(pollingData.authentication_uuid)
        return
      }
    }

    monitoring.sendMessage('Unknown order authentication REST state', {
      state: (pollingData as unknown as { state: string }).state,
      orderId,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pollingData, flagBizumRestResolvePaymentIncident])

  const startPolling = () => {
    setPollingEnabled(true)
    setIsLoading(true)
  }

  const cancelAuthentication = async () => {
    setPollingEnabled(false)
    setIsAuthenticating(false)
    setIsLoading(true)

    try {
      await OrderPaymentClient.cancelAuthentication({
        customerId,
        orderId,
      })
    } finally {
      setIsLoading(false)
      onError('authentication_failed')
    }
  }

  return {
    resolveOrderPaymentIncident,
    resolveOrderPaymentIncidentNewBizum,
    isLoading,
    isAuthenticating,
    startPolling,
    cancelAuthentication,
  }
}
