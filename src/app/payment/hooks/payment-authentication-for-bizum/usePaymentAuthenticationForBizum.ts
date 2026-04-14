import { useEffect, useState } from 'react'

import { PaymentAuthenticationFlow, PaymentMetrics } from '../../PaymentMetrics'
import { PaymentTPV } from '../../PaymentTPV'
import { OrderPaymentClient } from '../../client_new'
import { PaymentAuthFlow } from '../payment-authentication/parameters'
import { AuthUuidStorage } from './AuthUuidStorage'

import { useUserUUID } from 'app/authentication'
import { PaymentAuthenticationType } from 'app/payment/interfaces'
import { useSearchParams } from 'hooks/useSearchParams'

enum PaymentAuthStatus {
  SUCCESS = 'success',
  FAILURE = 'failure',
}
enum PaymentAuthParams {
  PAYMENT_FLOW = 'payment_flow',
  PAYMENT_AUTH = 'payment_auth',
  PAYMENT_METHOD = 'payment_method',
  PHONE_COUNTRY_CODE = 'phone_country_code',
  PHONE_NATIONAL_NUMBER = 'phone_national_number',
}
const PAYMENT_METHOD = 'bizum'

const generateOkUrl = (phone: {
  phoneCountryCode: string
  phoneNationalNumber: string
}) => {
  return new URL(
    `?${new URLSearchParams({
      [PaymentAuthParams.PAYMENT_FLOW]:
        PaymentAuthFlow.RESOLVE_PAYMENT_INCIDENCE,
      [PaymentAuthParams.PAYMENT_METHOD]: PAYMENT_METHOD,
      [PaymentAuthParams.PAYMENT_AUTH]: PaymentAuthStatus.SUCCESS,
      [PaymentAuthParams.PHONE_COUNTRY_CODE]: phone.phoneCountryCode,
      [PaymentAuthParams.PHONE_NATIONAL_NUMBER]: phone.phoneNationalNumber,
    })}`,
    window.location.href,
  )
}

const generateKoUrl = (phone: {
  phoneCountryCode: string
  phoneNationalNumber: string
}) => {
  return new URL(
    `?${new URLSearchParams({
      [PaymentAuthParams.PAYMENT_FLOW]:
        PaymentAuthFlow.RESOLVE_PAYMENT_INCIDENCE,
      [PaymentAuthParams.PAYMENT_METHOD]: PAYMENT_METHOD,
      [PaymentAuthParams.PAYMENT_AUTH]: PaymentAuthStatus.FAILURE,
      [PaymentAuthParams.PHONE_COUNTRY_CODE]: phone.phoneCountryCode,
      [PaymentAuthParams.PHONE_NATIONAL_NUMBER]: phone.phoneNationalNumber,
    })}`,
    window.location.href,
  )
}

export const usePaymentAuthenticationForBizum = ({
  orderId,
  onAuthFailure,
  onAuthSuccess,
}: {
  orderId: number | string
  onAuthFailure: () => void
  onAuthSuccess: (phone: {
    phoneCountryCode: string
    phoneNationalNumber: string
  }) => void
}) => {
  const customerId = useUserUUID()
  const [isMutating, setIsMutating] = useState(false)

  const { searchParams, clearAllSearchParams } = useSearchParams()

  const handleAuthResult = () => {
    if (
      searchParams.get(PaymentAuthParams.PAYMENT_METHOD) !== PAYMENT_METHOD ||
      searchParams.get(PaymentAuthParams.PAYMENT_FLOW) !==
        PaymentAuthFlow.RESOLVE_PAYMENT_INCIDENCE
    ) {
      return
    }

    if (
      searchParams.get(PaymentAuthParams.PAYMENT_AUTH) ===
      PaymentAuthStatus.FAILURE
    ) {
      PaymentMetrics.endPsd2Flow({
        status: 'failed',
        paymentAuthenticationUuid: AuthUuidStorage.get()!,
        userFlow: PaymentAuthenticationFlow.PAYMENT_ISSUE,
      })
      onAuthFailure()
    }
    if (
      searchParams.get(PaymentAuthParams.PAYMENT_AUTH) ===
      PaymentAuthStatus.SUCCESS
    ) {
      PaymentMetrics.endPsd2Flow({
        status: 'success',
        paymentAuthenticationUuid: AuthUuidStorage.get()!,
        userFlow: PaymentAuthenticationFlow.PAYMENT_ISSUE,
      })
      onAuthSuccess({
        phoneCountryCode:
          searchParams.get(PaymentAuthParams.PHONE_COUNTRY_CODE) ?? '',
        phoneNationalNumber:
          searchParams.get(PaymentAuthParams.PHONE_NATIONAL_NUMBER) ?? '',
      })
    }
    clearAllSearchParams()
    AuthUuidStorage.remove()
  }

  useEffect(() => {
    handleAuthResult()
  }, [searchParams])

  const getPaymentAuthenticationForBizum = async (
    phone: {
      phoneCountryCode: string
      phoneNationalNumber: string
    },
    callbacks?: {
      onSuccess: () => void
      onError: (error: unknown) => void
    },
  ) => {
    setIsMutating(true)
    try {
      const response =
        await OrderPaymentClient.getPaymentAuthenticationForBizum({
          customerId,
          orderId,
          phone,
          okUrl: generateOkUrl(phone).toString(),
          koUrl: generateKoUrl(phone).toString(),
        })

      PaymentMetrics.startPsd2Flow({
        paymentMethodType: response.paymentMethodType,
        type: PaymentAuthenticationType.AUTH,
        provider: response.provider,
        paymentAuthenticationUuid: response.authenticationUuid,
        userFlow: PaymentAuthenticationFlow.PAYMENT_ISSUE,
        isMIT: false,
      })

      AuthUuidStorage.set(response.authenticationUuid)

      PaymentTPV.autoRedirectToPaymentAuth(response.params)
      callbacks?.onSuccess()
    } catch (error) {
      callbacks?.onError(error)
      setIsMutating(false)
    }
  }

  return {
    getPaymentAuthenticationForBizum,
    isMutating,
  }
}
