import { Fragment, ReactNode, useState } from 'react'
import { generatePath, useHistory } from 'react-router'

import { useCheckoutContext } from '../CheckoutContext'
import { useCheckoutSlotResetContext } from '../CheckoutSlotResetContext'
import { CheckoutPaymentsContext } from './CheckoutPaymentsContext'
import { CheckoutAuthenticatingModal } from './components/CheckoutAuthenticatingModal'
import { CheckoutAuthorizationModal } from './components/CheckoutAuthorizationModal'
import { useCheckoutRestPayment } from './useCheckoutRestPayment'

import { useUserUUID } from 'app/authentication'
import { clearCartAndUpdate } from 'app/cart/commands'
import {
  CheckoutAlreadyConfirmedException,
  CheckoutConfirmationStatus,
  CheckoutSlotNotAvailableModal,
  SlotNotBookedException,
  SlotTakenException,
} from 'app/checkout'
import { CheckoutClient } from 'app/checkout/client'
import {
  AuthenticationExemption,
  AuthenticationMode,
  MITTermsModal,
  PAYMENT_SEARCH_PARAMS,
  PSD2Loader,
  PaymentAuthFlow,
  PaymentAuthenticationFailedModal,
  PaymentAuthenticationRequiredException,
  PaymentAuthenticationType,
  PaymentMethod,
  PaymentMetrics,
  PhoneWithoutBizumException,
  PhoneWithoutBizumModal,
  SCA_SOURCES,
  SCA_STATUS_CODES,
  usePaymentAuthentication,
  usePaymentAuthenticationCallbacks,
} from 'app/payment'
import { SCAChallengeContainer } from 'app/payment/containers/SCA-challenge-container'
import { FLOWS } from 'app/payment/metrics'
import { useAppDispatch, useAppStore } from 'app/redux'
import { handleManagedError } from 'app/shared/exceptions'
import { useSearchParam } from 'hooks/useSearchParam'
import { cancelCheckout } from 'pages/create-checkout/actions'
import { PATHS } from 'pages/paths'
import { knownFeatureFlags, useFlag } from 'services/feature-flags'
import { HTTP_STATUS } from 'services/http'
import { Storage } from 'services/storage'
import { clearPendingAction } from 'wrappers/feedback/actions'

interface CheckoutPaymentsProviderProps {
  children: ReactNode
}

interface LegacySCAState {
  SCAId: null | string
  SCASource: null | string
  isMIT: boolean
  isBizum: boolean
}

export const CheckoutPaymentsProvider = ({
  children,
}: CheckoutPaymentsProviderProps) => {
  const customerId = useUserUUID()
  const { checkout, checkoutId, refetchCheckout } = useCheckoutContext<true>()
  const { requestSlotReset } = useCheckoutSlotResetContext()
  const flagCheckoutNewConfirmStrategy = useFlag(
    knownFeatureFlags.CHECKOUT_NEW_CONFIRM_STRATEGY,
  )
  const flagCheckoutSlotNotAvailable = useFlag(
    knownFeatureFlags.CHECKOUT_SLOT_NOT_AVAILABLE,
  )

  const history = useHistory()
  const dispatch = useAppDispatch()
  const store = useAppStore()

  const [isConfirming, setIsConfirming] = useState(false)
  const [authorizationModal, setAuthorizationModal] = useState<{
    isOpen: boolean
    paymentAuthenticationUuid: string
  } | null>(null)

  const [mitTermsModal, setMitTermsModal] = useState<{
    isOpen: boolean
    paymentAuthenticationUuid: string
    isRestFlow: boolean
  } | null>(null)

  const [phoneWithoutBizumModal, setPhoneWithoutBizumModal] = useState<{
    isOpen: boolean
    phone: {
      countryCode: string
      nationalNumber: string
    }
  } | null>(null)
  const [
    showPaymentAuthenticationFailedModal,
    setShowPaymentAuthenticationFailedModal,
  ] = useState(false)

  const [showSlotNotAvailableModal, setShowSlotNotAvailableModal] =
    useState(false)

  const [, setShowPaymentCardListParam] = useSearchParam(
    PAYMENT_SEARCH_PARAMS.SHOW_PAYMENT_CARD_LIST,
  )
  const [, setShowAddNewPaymentMethodModal] = useSearchParam(
    PAYMENT_SEARCH_PARAMS.SHOW_ADD_NEW_PAYMENT_METHOD_MODAL,
  )
  const [, setShowAddNewPaymentMethodModal2] = useSearchParam(
    PAYMENT_SEARCH_PARAMS.SHOW_RESOLVE_PAYMENT_INCIDENT,
  )

  const [legacySCAState, setLegacySCAState] = useState<LegacySCAState>({
    SCAId: null,
    SCASource: null,
    isMIT: false,
    isBizum: false,
  })

  const { launchPaymentAuthentication } = usePaymentAuthentication({
    entityId: checkoutId,
  })

  const goToOrderConfirmationPage = (orderId: number) => {
    history.replace(
      generatePath(PATHS.PURCHASE_CONFIRMATION, {
        id: orderId,
      }),
    )
  }

  const confirmCheckout = async () => {
    if (flagCheckoutNewConfirmStrategy) {
      return confirmCheckoutNew()
    } else {
      return confirmCheckoutLegacy()
    }
  }

  const confirmCheckoutLegacy = async () => {
    setIsConfirming(true)

    try {
      const response = await CheckoutClient.confirmLegacy(
        customerId,
        checkoutId,
      )

      if (!response?.orderId) {
        return
      }

      // TODO: Pending to migrate
      clearCartAndUpdate(store)
      dispatch(cancelCheckout())
      dispatch(clearPendingAction())

      goToOrderConfirmationPage(response.orderId)
    } catch (error) {
      const errorResponse = error as Response
      const isSCARequired = SCA_STATUS_CODES.includes(errorResponse.status)
      const isMITRequired = errorResponse.status === HTTP_STATUS.MIT

      if (isSCARequired) {
        const errorDetail = await errorResponse.json()
        setLegacySCAState({
          SCAId: errorDetail.errors[0].detail,
          SCASource: SCA_SOURCES.SCA_CONFIRM,
          isMIT: isMITRequired,
          isBizum: false,
        })
        return error
      }

      await handleManagedError(error)
        .on(PaymentAuthenticationRequiredException, (exception) => {
          setLegacySCAState({
            SCAId: exception.authentication_uuid,
            SCASource: SCA_SOURCES.SCA_CONFIRM,
            isBizum: true,
            isMIT: false,
          })
        })
        .onUnhandled((unhandled) => {
          const errorType =
            unhandled.type === 'managed' ? unhandled.exception.code : 'unknown'
          PaymentMetrics.paymentErrorView({
            checkoutId,
            errorType,
            errorDescriptionDisplayed:
              unhandled.type === 'managed'
                ? unhandled.exception.detail
                : undefined,
          })
          setIsConfirming(false)
        })
        .run()
    }
  }

  const {
    startPolling,
    cancelAuthentication,
    startLoading,
    isLoading,
    isAuthenticating,
  } = useCheckoutRestPayment({
    checkoutId,
    onSuccess: confirmCheckout,
    onError: (reason) => {
      if (reason === 'authentication_failed') {
        setIsConfirming(false)
        setShowPaymentAuthenticationFailedModal(true)
        return
      }

      confirmCheckout()
    },
    onFallbackRequired: (authenticationUuid, authenticationType) => {
      redirectPaymentAuthentication(authenticationUuid, authenticationType)
    },
    onMitRequired: (authenticationUuid) => {
      setMitTermsModal({
        isOpen: true,
        paymentAuthenticationUuid: authenticationUuid,
        isRestFlow: true,
      })
    },
  })

  const redirectPaymentAuthentication = async (
    paymentAuthenticationUuid: string,
    paymentAuthenticationType: PaymentAuthenticationType,
    isMIT = false,
  ) => {
    await launchPaymentAuthentication({
      paymentAuthenticationUuid,
      paymentMethodType: 'any',
      paymentFlow: PaymentAuthFlow.CHECKOUT,
      paymentAuthenticationType,
      isMIT,
    })
  }

  const confirmCheckoutNew = async () => {
    setIsConfirming(true)

    try {
      const { status, payload } = await CheckoutClient.confirm(
        customerId,
        checkoutId,
      )

      if (status === CheckoutConfirmationStatus.CREATED) {
        // TODO: Pending to migrate
        clearCartAndUpdate(store)
        dispatch(cancelCheckout())
        dispatch(clearPendingAction())

        goToOrderConfirmationPage(payload.orderId)
      }

      if (
        status === CheckoutConfirmationStatus.ACCEPTED &&
        payload.authenticationMode === 'redirection'
      ) {
        if (payload.exemption === AuthenticationExemption.MIT) {
          setMitTermsModal({
            isOpen: true,
            paymentAuthenticationUuid: payload.authenticationUuid,
            isRestFlow: false,
          })
          return
        }

        const hasAlreadySeen = Storage.isCheckoutSCAModalSeen()

        if (hasAlreadySeen) {
          await redirectPaymentAuthentication(
            payload.authenticationUuid,
            PaymentAuthenticationType.AUTH,
          )
          return
        }

        setAuthorizationModal({
          isOpen: true,
          paymentAuthenticationUuid: payload.authenticationUuid,
        })
      }

      if (
        status === CheckoutConfirmationStatus.ACCEPTED &&
        payload.authenticationMode === 'rest'
      ) {
        startPolling(PaymentAuthenticationType.AUTH)
        return
      }
    } catch (error) {
      setIsConfirming(false)

      const errorHandler = handleManagedError(error)

      if (flagCheckoutSlotNotAvailable) {
        errorHandler
          .on(SlotNotBookedException, () => setShowSlotNotAvailableModal(true))
          .on(SlotTakenException, () => setShowSlotNotAvailableModal(true))
      }

      await errorHandler
        .onUnhandled((unhandled) => {
          const errorType =
            unhandled.type === 'managed' ? unhandled.exception.code : 'unknown'
          PaymentMetrics.paymentErrorView({
            checkoutId,
            errorType,
            errorDescriptionDisplayed:
              unhandled.type === 'managed'
                ? unhandled.exception.detail
                : undefined,
          })
        })
        .run()
    }
  }

  const updatePaymentInfo = async (
    selectedPaymentInfo: Pick<PaymentMethod, 'id'>,
  ) => {
    await CheckoutClient.updatePaymentInfo(
      customerId,
      checkoutId,
      selectedPaymentInfo,
    )

    await refetchCheckout()

    confirmCheckout()
  }

  const updatePaymentMethodWithBizum = async (phone: {
    phoneCountryCode: string
    phoneNationalNumber: string
  }) => {
    try {
      const response = await CheckoutClient.updatePaymentMethodWithBizum({
        customerId,
        checkoutId,
        phone,
      })

      if (response.authenticationMode === AuthenticationMode.REDIRECTION) {
        const hasAlreadySeen = Storage.isCheckoutSCAModalSeen()

        if (hasAlreadySeen) {
          await redirectPaymentAuthentication(
            response.authenticationUuid,
            PaymentAuthenticationType.TOKEN_AUTH,
          )
          return
        }

        setAuthorizationModal({
          isOpen: true,
          paymentAuthenticationUuid: response.authenticationUuid,
        })
      }

      if (response.authenticationMode === AuthenticationMode.REST) {
        setShowAddNewPaymentMethodModal2('false')

        startPolling(PaymentAuthenticationType.TOKEN_AUTH)
      }
    } catch (error) {
      await handleManagedError(error)
        .on(PhoneWithoutBizumException, () =>
          setPhoneWithoutBizumModal({
            isOpen: true,
            phone: {
              countryCode: phone.phoneCountryCode,
              nationalNumber: phone.phoneNationalNumber,
            },
          }),
        )
        .on(CheckoutAlreadyConfirmedException, () => {
          refetchCheckout()
        })
        .run()
    }
  }

  usePaymentAuthenticationCallbacks({
    flow: PaymentAuthFlow.CHECKOUT,
    paymentMethodType: 'any',
    onAuthSuccess: confirmCheckout,
    onAuthFailure: () => {
      setShowPaymentAuthenticationFailedModal(true)
    },
  })

  const handleCancelAuthentication = async () => {
    await cancelAuthentication()
    setIsConfirming(false)
  }

  return (
    <>
      <CheckoutPaymentsContext.Provider
        value={{
          isConfirming,
          confirmCheckout,
          updatePaymentMethodWithBizum,
        }}
      >
        {checkout.paymentMethod ? (
          <SCAChallengeContainer
            confirm={confirmCheckout}
            flow={FLOWS.CHECKOUT}
            id={legacySCAState.SCAId}
            isMIT={legacySCAState.isMIT}
            paymentMethod={checkout.paymentMethod}
            stopOrderConfirmLoading={() => {
              setIsConfirming(false)
              return null
            }}
            source={legacySCAState.SCASource}
            updatePaymentMethod={updatePaymentInfo}
            orderId={checkout.orderId?.toString()}
            checkoutId={checkoutId}
            isBizum={legacySCAState.isBizum}
            paymentFlow={PaymentAuthFlow.CHECKOUT}
          >
            {children}
          </SCAChallengeContainer>
        ) : (
          <Fragment>{children}</Fragment>
        )}
      </CheckoutPaymentsContext.Provider>

      {mitTermsModal?.isOpen && (
        <MITTermsModal
          onConfirm={() => {
            startLoading()
            redirectPaymentAuthentication(
              mitTermsModal.paymentAuthenticationUuid,
              PaymentAuthenticationType.AUTH,
              true,
            )
            setMitTermsModal(null)
          }}
          onClose={() => {
            setMitTermsModal(null)
            if (mitTermsModal.isRestFlow) {
              handleCancelAuthentication()
            } else {
              setIsConfirming(false)
            }
          }}
        />
      )}

      {authorizationModal?.isOpen && (
        <CheckoutAuthorizationModal
          onClose={() => {
            setAuthorizationModal(null)
            setIsConfirming(false)
          }}
          onConfirm={() => {
            redirectPaymentAuthentication(
              authorizationModal.paymentAuthenticationUuid,
              PaymentAuthenticationType.AUTH,
            )
            setAuthorizationModal(null)
          }}
        />
      )}

      {phoneWithoutBizumModal?.isOpen && (
        <PhoneWithoutBizumModal
          phone={phoneWithoutBizumModal.phone}
          onClick={() => setPhoneWithoutBizumModal(null)}
        />
      )}

      {showPaymentAuthenticationFailedModal && (
        <PaymentAuthenticationFailedModal
          onClose={() => setShowPaymentAuthenticationFailedModal(false)}
          onRetry={() => {
            setShowPaymentAuthenticationFailedModal(false)

            if (checkout.paymentMethod) {
              setShowPaymentCardListParam('true')
              return
            }
            setShowAddNewPaymentMethodModal('true')
          }}
        />
      )}

      {showSlotNotAvailableModal && (
        <CheckoutSlotNotAvailableModal
          checkoutId={checkoutId}
          onClose={() => setShowSlotNotAvailableModal(false)}
          onAction={() => {
            setShowSlotNotAvailableModal(false)
            requestSlotReset()
          }}
        />
      )}

      {isLoading && <PSD2Loader />}

      {isAuthenticating && (
        <CheckoutAuthenticatingModal onClose={handleCancelAuthentication} />
      )}
    </>
  )
}
