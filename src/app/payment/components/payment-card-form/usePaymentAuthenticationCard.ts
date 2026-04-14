import { useEffect, useState } from 'react'

import { useUserUUID } from 'app/authentication'
import {
  PaymentAuthenticationFlow,
  PaymentMetrics,
} from 'app/payment/PaymentMetrics'
import { PaymentClient } from 'app/payment/client'
import { useCheckoutPSD2Context } from 'app/payment/contexts/CheckoutPSD2Context'
import { useOrderPSD2Context } from 'app/payment/contexts/OrderPSD2Context'
import { useTokenAuthn } from 'app/payment/contexts/TokenAuthn'
import { PaymentAuthFlow } from 'app/payment/hooks'
import {
  PaymentAuthentication,
  PaymentAuthenticationType,
  PaymentTokenAuthnFlow,
} from 'app/payment/interfaces'
import { knownFeatureFlags, useFlag } from 'services/feature-flags'

export const usePaymentAuthenticationCard = (paymentFlow?: PaymentAuthFlow) => {
  const userUuid = useUserUUID()
  const { isTokenAuthnFlow, checkoutId } = useTokenAuthn()
  const orderPsd2Context = useOrderPSD2Context()
  const checkoutPsd2Context = useCheckoutPSD2Context()

  const flagCheckoutNewCardAlwaysAutoConfirm = useFlag(
    knownFeatureFlags.CHECKOUT_NEW_CARD_ALWAYS_AUTO_CONFIRM,
  )

  const [paymentAuthentication, setPaymentAuthentication] =
    useState<PaymentAuthentication | null>(null)

  const [callbackUrls, setCallbackUrls] = useState<{
    okUrl: string
    koUrl: string
  } | null>(null)

  const getAuthnIframe = async () => {
    const { host, protocol } = window.location
    const urlOk = `${protocol}//${host}/payment_ok.html?url=${window.location}`
    const urlKo = `${protocol}//${host}/payment_ko.html?url=${window.location}`

    try {
      const response = await PaymentClient.getIframe(urlOk, urlKo, userUuid)
      PaymentMetrics.startPsd2Flow({
        paymentMethodType: response.paymentMethodType,
        type: PaymentAuthenticationType.AUTH,
        provider: response.provider,
        paymentAuthenticationUuid: null,
        userFlow: PaymentAuthenticationFlow.ADD_PAYMENT_METHOD,
        isMIT: false,
      })

      setPaymentAuthentication(response)
    } catch {
      setPaymentAuthentication(null)
    }
  }

  const getTokenAuthnIframe = async () => {
    const { host, protocol } = window.location
    const okUrl = `${protocol}//${host}/sca_token_authn_ok.html`
    const koUrl = `${protocol}//${host}/sca_token_authn_ko.html`

    try {
      const response = await PaymentClient.getTokenAuthnIframe({
        okUrl,
        koUrl,
        userUuid,
        checkoutId,
        shouldAutoConfirm: true,
      })

      PaymentMetrics.startPsd2Flow({
        paymentMethodType: response.paymentMethodType,
        paymentAuthenticationUuid: response.authenticationUuid,
        provider: response.provider,
        type: PaymentAuthenticationType.TOKEN_AUTH,
        userFlow: PaymentAuthenticationFlow.CHECKOUT,
        isMIT: false,
      })

      setPaymentAuthentication(response)
    } catch {
      setPaymentAuthentication(null)
    }
  }

  const fetchPaymentAuthentication = async () => {
    if (paymentFlow) {
      switch (paymentFlow) {
        case PaymentAuthFlow.RESOLVE_RESCHEDULED_PAYMENT_INCIDENCE: {
          try {
            const response =
              await orderPsd2Context?.getPsd2TokenAuthnCardParams(
                PaymentTokenAuthnFlow.RESOLVE_RESCHEDULED_PAYMENT_INCIDENT,
              )

            if (!response) return

            setPaymentAuthentication(response.paymentAuthentication)
            setCallbackUrls({
              okUrl: response.okUrl,
              koUrl: response.koUrl,
            })
          } catch {
            setPaymentAuthentication(null)
          }

          return
        }

        case PaymentAuthFlow.RESOLVE_PAYMENT_INCIDENCE: {
          try {
            const response =
              await orderPsd2Context?.getPsd2TokenAuthnCardParams(
                PaymentTokenAuthnFlow.RESOLVE_PAYMENT_INCIDENT,
              )

            if (!response) return

            setPaymentAuthentication(response.paymentAuthentication)
            setCallbackUrls({
              okUrl: response.okUrl,
              koUrl: response.koUrl,
            })
          } catch {
            setPaymentAuthentication(null)
          }

          return
        }
      }
    }

    if (flagCheckoutNewCardAlwaysAutoConfirm && checkoutId) {
      try {
        const response =
          await checkoutPsd2Context?.getPsd2TokenAuthnCardParams()

        if (!response) return

        setPaymentAuthentication(response.paymentAuthentication)
        setCallbackUrls({
          okUrl: response.okUrl,
          koUrl: response.koUrl,
        })
      } catch {
        setPaymentAuthentication(null)
      }

      return
    }
    // Legacy strategy, all new flows should use paymentFlow param
    if (isTokenAuthnFlow && checkoutId) {
      getTokenAuthnIframe()
    } else {
      getAuthnIframe()
    }
  }

  useEffect(() => {
    fetchPaymentAuthentication()
  }, [isTokenAuthnFlow, checkoutId, paymentFlow])

  return {
    paymentAuthentication,
    callbackUrls,
    refetch: fetchPaymentAuthentication,
  }
}
