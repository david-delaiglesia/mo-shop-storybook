import { ReactNode } from 'react'

import { CheckoutPSD2Context } from './CheckoutPSD2Context'

import { useUserUUID } from 'app/authentication'
import { useCheckoutContext } from 'app/checkout'
import {
  PaymentAuthenticationFlow,
  PaymentMetrics,
} from 'app/payment/PaymentMetrics'
import { PaymentClient } from 'app/payment/client'
import { PaymentAuthFlow, PaymentAuthStatus } from 'app/payment/hooks'
import { generateCallbackUrl } from 'app/payment/hooks/payment-authentication/generate-urls'
import {
  PaymentAuthentication,
  PaymentAuthenticationType,
} from 'app/payment/interfaces'

export const CheckoutPSD2Provider = ({ children }: { children: ReactNode }) => {
  const { checkoutId } = useCheckoutContext<true>()
  const customerId = useUserUUID()

  const getPsd2TokenAuthnCardParams = async (): Promise<{
    paymentAuthentication: PaymentAuthentication
    okUrl: string
    koUrl: string
  }> => {
    const paymentAuthenticationStorageKey = crypto.randomUUID()

    const paymentAuthentication = await PaymentClient.getTokenAuthnIframe({
      userUuid: customerId,
      checkoutId,
      okUrl: `${window.location.origin}/sca_token_authn_ok.html`,
      koUrl: `${window.location.origin}/sca_token_authn_ko.html`,
      shouldAutoConfirm: true,
    })

    localStorage.setItem(
      paymentAuthenticationStorageKey,
      paymentAuthentication.authenticationUuid,
    )

    PaymentMetrics.startPsd2Flow({
      paymentMethodType: paymentAuthentication.paymentMethodType,
      type: PaymentAuthenticationType.TOKEN_AUTH,
      provider: paymentAuthentication.provider,
      paymentAuthenticationUuid: paymentAuthentication.authenticationUuid,
      userFlow: PaymentAuthenticationFlow.CHECKOUT,
      isMIT: false,
    })

    return {
      paymentAuthentication,
      okUrl: generateCallbackUrl({
        status: PaymentAuthStatus.SUCCESS,
        paymentAuthenticationStorageKey,
        paymentMethodType: paymentAuthentication.paymentMethodType,
        paymentFlow: PaymentAuthFlow.CHECKOUT_AUTO_CONFIRM,
      }).toString(),
      koUrl: generateCallbackUrl({
        status: PaymentAuthStatus.FAILURE,
        paymentAuthenticationStorageKey,
        paymentMethodType: paymentAuthentication.paymentMethodType,
        paymentFlow: PaymentAuthFlow.CHECKOUT_AUTO_CONFIRM,
      }).toString(),
    }
  }

  return (
    <CheckoutPSD2Context.Provider
      value={{
        getPsd2TokenAuthnCardParams,
      }}
    >
      {children}
    </CheckoutPSD2Context.Provider>
  )
}
