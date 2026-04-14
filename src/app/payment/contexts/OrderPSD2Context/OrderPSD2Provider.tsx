import { ReactNode, useState } from 'react'

import { OrderPSD2Context } from './OrderPSD2Context'

import { useUserUUID } from 'app/authentication'
import { useOrderContext } from 'app/order/contexts/OrderContext'
import { PaymentMetrics } from 'app/payment/PaymentMetrics'
import { PaymentTPV } from 'app/payment/PaymentTPV'
import { OrderPaymentClient } from 'app/payment/client_new'
import { PhoneWithoutBizumModal } from 'app/payment/components/phone-without-bizum-modal'
import { PSD2Loader } from 'app/payment/components/psd2-loader'
import {
  PaymentAuthFlow,
  PaymentAuthStatus,
  mapPaymentAuthFlows,
} from 'app/payment/hooks'
import { generateCallbackUrl } from 'app/payment/hooks/payment-authentication/generate-urls'
import {
  PaymentAuthentication,
  PaymentAuthenticationType,
  PaymentTokenAuthnFlow,
} from 'app/payment/interfaces'
import { NetworkError } from 'services/http'

export const OrderPSD2Provider = ({ children }: { children: ReactNode }) => {
  const { order } = useOrderContext()
  const customerId = useUserUUID()

  const [isPsd2Loading, setIsPsd2Loading] = useState(false)

  const [exceptionPhoneWithoutBizumModal, setExceptionPhoneWithoutBizumModal] =
    useState({ show: false, phone: { countryCode: '', nationalNumber: '' } })

  const startPsd2Auth = async (
    paymentAuthnFlow:
      | PaymentAuthFlow.RESOLVE_PAYMENT_INCIDENCE
      | PaymentAuthFlow.RESOLVE_RESCHEDULED_PAYMENT_INCIDENCE,
    paymentAuthenticationUuid: string,
  ) => {
    setIsPsd2Loading(true)

    try {
      switch (paymentAuthnFlow) {
        case PaymentAuthFlow.RESOLVE_PAYMENT_INCIDENCE:
        case PaymentAuthFlow.RESOLVE_RESCHEDULED_PAYMENT_INCIDENCE: {
          const response =
            await OrderPaymentClient.getOrderPaymentAuthenticationParams({
              customerId,
              // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
              orderId: order?.id!,
              authenticationUuid: paymentAuthenticationUuid,
              okUrl: generateCallbackUrl({
                status: PaymentAuthStatus.SUCCESS,
                paymentAuthenticationUuid,
                paymentMethodType: 'any',
                paymentFlow: paymentAuthnFlow,
              }).toString(),
              koUrl: generateCallbackUrl({
                status: PaymentAuthStatus.FAILURE,
                paymentAuthenticationUuid,
                paymentMethodType: 'any',
                paymentFlow: paymentAuthnFlow,
              }).toString(),
            })

          PaymentMetrics.startPsd2Flow({
            paymentMethodType: response.paymentMethodType,
            type: PaymentAuthenticationType.AUTH,
            provider: response.provider,
            paymentAuthenticationUuid: response.authenticationUuid,
            userFlow: mapPaymentAuthFlows[paymentAuthnFlow],
            isMIT: false,
          })

          PaymentTPV.autoRedirectToPaymentAuth(response.params)

          break
        }
      }
    } catch (error) {
      NetworkError.publish(error)
    } finally {
      setIsPsd2Loading(false)
    }
  }

  const redirectPsd2TokenAuth = async ({
    paymentAuthentication,
    paymentTokenAuthnFlow,
    paymentAuthenticationStorageKey,
  }: {
    paymentTokenAuthnFlow: PaymentTokenAuthnFlow
    paymentAuthentication: PaymentAuthentication
    paymentAuthenticationStorageKey: string
  }) => {
    setIsPsd2Loading(true)

    try {
      switch (paymentTokenAuthnFlow) {
        case PaymentTokenAuthnFlow.RESOLVE_RESCHEDULED_PAYMENT_INCIDENT: {
          localStorage.setItem(
            paymentAuthenticationStorageKey,
            paymentAuthentication.authenticationUuid,
          )

          PaymentMetrics.startPsd2Flow({
            paymentMethodType: paymentAuthentication.paymentMethodType,
            type: PaymentAuthenticationType.TOKEN_AUTH,
            provider: paymentAuthentication.provider,
            paymentAuthenticationUuid: paymentAuthentication.authenticationUuid,
            userFlow:
              mapPaymentAuthFlows[
                PaymentAuthFlow.RESOLVE_RESCHEDULED_PAYMENT_INCIDENCE
              ],
            isMIT: false,
          })

          PaymentTPV.autoRedirectToPaymentAuth(paymentAuthentication.params)

          break
        }

        case PaymentTokenAuthnFlow.RESOLVE_PAYMENT_INCIDENT: {
          localStorage.setItem(
            paymentAuthenticationStorageKey,
            paymentAuthentication.authenticationUuid,
          )

          PaymentMetrics.startPsd2Flow({
            paymentMethodType: paymentAuthentication.paymentMethodType,
            type: PaymentAuthenticationType.TOKEN_AUTH,
            provider: paymentAuthentication.provider,
            paymentAuthenticationUuid: paymentAuthentication.authenticationUuid,
            userFlow:
              mapPaymentAuthFlows[PaymentAuthFlow.RESOLVE_PAYMENT_INCIDENCE],
            isMIT: false,
          })

          PaymentTPV.autoRedirectToPaymentAuth(paymentAuthentication.params)

          break
        }
      }
    } catch (error) {
      NetworkError.publish(error)
    } finally {
      setIsPsd2Loading(false)
    }
  }

  const getPsd2TokenAuthnCardParams = async (
    paymentTokenAuthnFlow: PaymentTokenAuthnFlow,
  ): Promise<{
    paymentAuthentication: PaymentAuthentication
    okUrl: string
    koUrl: string
  }> => {
    switch (paymentTokenAuthnFlow) {
      case PaymentTokenAuthnFlow.RESOLVE_RESCHEDULED_PAYMENT_INCIDENT: {
        const paymentAuthenticationStorageKey = crypto.randomUUID()

        const paymentAuthentication =
          await OrderPaymentClient.addOrderPaymentMethodCard({
            customerId,
            // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
            orderId: order?.id!,
            okUrl: `${window.location.origin}/sca_token_authn_ok.html`,
            koUrl: `${window.location.origin}/sca_token_authn_ko.html`,
            flow: PaymentTokenAuthnFlow.RESOLVE_RESCHEDULED_PAYMENT_INCIDENT,
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
          userFlow:
            mapPaymentAuthFlows[
              PaymentAuthFlow.RESOLVE_RESCHEDULED_PAYMENT_INCIDENCE
            ],
          isMIT: false,
        })

        return {
          paymentAuthentication,
          okUrl: generateCallbackUrl({
            status: PaymentAuthStatus.SUCCESS,
            paymentAuthenticationStorageKey,
            paymentMethodType: 'any',
            paymentFlow: PaymentAuthFlow.RESOLVE_RESCHEDULED_PAYMENT_INCIDENCE,
          }).toString(),
          koUrl: generateCallbackUrl({
            status: PaymentAuthStatus.FAILURE,
            paymentAuthenticationStorageKey,
            paymentMethodType: 'any',
            paymentFlow: PaymentAuthFlow.RESOLVE_RESCHEDULED_PAYMENT_INCIDENCE,
          }).toString(),
        }
      }

      case PaymentTokenAuthnFlow.RESOLVE_PAYMENT_INCIDENT: {
        const paymentAuthenticationStorageKey = crypto.randomUUID()

        const paymentAuthentication =
          await OrderPaymentClient.addOrderPaymentMethodCard({
            customerId,
            // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
            orderId: order?.id!,
            okUrl: `${window.location.origin}/sca_token_authn_ok.html`,
            koUrl: `${window.location.origin}/sca_token_authn_ko.html`,
            flow: PaymentTokenAuthnFlow.RESOLVE_PAYMENT_INCIDENT,
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
          userFlow:
            mapPaymentAuthFlows[PaymentAuthFlow.RESOLVE_PAYMENT_INCIDENCE],
          isMIT: false,
        })

        return {
          paymentAuthentication,
          okUrl: generateCallbackUrl({
            status: PaymentAuthStatus.SUCCESS,
            paymentAuthenticationStorageKey,
            paymentMethodType: 'any',
            paymentFlow: PaymentAuthFlow.RESOLVE_PAYMENT_INCIDENCE,
          }).toString(),
          koUrl: generateCallbackUrl({
            status: PaymentAuthStatus.FAILURE,
            paymentAuthenticationStorageKey,
            paymentMethodType: 'any',
            paymentFlow: PaymentAuthFlow.RESOLVE_PAYMENT_INCIDENCE,
          }).toString(),
        }
      }
    }
  }

  return (
    <OrderPSD2Context.Provider
      value={{
        startPsd2Auth,
        redirectPsd2TokenAuth,
        getPsd2TokenAuthnCardParams,
      }}
    >
      {children}

      {isPsd2Loading && <PSD2Loader />}

      {exceptionPhoneWithoutBizumModal.show && (
        <PhoneWithoutBizumModal
          phone={exceptionPhoneWithoutBizumModal.phone}
          onClick={() =>
            setExceptionPhoneWithoutBizumModal({
              show: false,
              phone: { countryCode: '', nationalNumber: '' },
            })
          }
        />
      )}
    </OrderPSD2Context.Provider>
  )
}
