import { useEffect, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'

import { PaymentAuthenticationFlow, PaymentMetrics } from '../../PaymentMetrics'
import { TokenAuthnContext } from './context'
import { bool, func, node } from 'prop-types'

import { Loader } from '@mercadona/mo.library.shop-ui/loader'

import { useCheckoutPaymentsContext } from 'app/checkout/contexts/CheckoutPaymentsContext'
import { AddPaymentMethodModal } from 'app/payment/components/add-payment-method-modal'
import { PaymentFailedModal } from 'app/payment/components/payment-failed-modal'
import { PhoneWithoutBizumModal } from 'app/payment/components/phone-without-bizum-modal'
import { PAYMENT_SEARCH_PARAMS } from 'app/payment/constants'
import { PhoneWithoutBizumException } from 'app/payment/exceptions'
import {
  PaymentAuthFlow,
  useUpdateCheckoutPaymentMethodWithBizum,
} from 'app/payment/hooks'
import { PaymentMethodType } from 'app/payment/interfaces'
import {
  FLOWS,
  sendMITTermAcceptClickMetrics,
  sendMITTermCloseClickMetrics,
  sendMITTermViewMetrics,
  sendTokenAuthnFormClosedByUserMetrics,
} from 'app/payment/metrics'
import { hideAlert, showAlert } from 'app/shared/alert/actions'
import { ALERT_SIZES } from 'app/shared/alert/components/alert'
import { handleManagedError } from 'app/shared/exceptions'
import { useModalContext } from 'app/shared/modal'
import { CheckoutPropTypes } from 'domain/checkout'
import { useSearchParam } from 'hooks/useSearchParam'
import { knownFeatureFlags, useFlag } from 'services/feature-flags'
import { Storage } from 'services/storage'
import alertImage from 'system-ui/assets/img/default-alert@2x.png'
import paymentImage from 'system-ui/assets/img/payment.png'
import { TAB_INDEX } from 'utils/constants'

export function TokenAuthnProvider({
  children,
  checkout,
  onSuccess,
  shouldAutoConfirm = false,
}) {
  const [showAddNewPaymentMethodModal, setShowAddNewPaymentMethodModal] =
    useState(false)

  const [
    showAddNewPaymentMethodModalParam,
    ,
    clearAddNewPaymentMethodModalParam,
  ] = useSearchParam(PAYMENT_SEARCH_PARAMS.SHOW_RESOLVE_PAYMENT_INCIDENT)

  const { t } = useTranslation()
  const dispatch = useDispatch()
  const ModalService = useModalContext()
  const checkoutPaymentsContext = useCheckoutPaymentsContext()

  const flagCheckoutBizumTokenAuthnRestStrategy = useFlag(
    knownFeatureFlags.CHECKOUT_BIZUM_TOKEN_AUTHN_REST_STRATEGY,
  )

  useEffect(() => {
    if (showAddNewPaymentMethodModalParam === 'false') {
      setShowAddNewPaymentMethodModal(false)
      clearAddNewPaymentMethodModalParam()
    }
  }, [showAddNewPaymentMethodModalParam, clearAddNewPaymentMethodModalParam])

  const isTokenAuthnFlow = !!checkout && !checkout?.paymentMethod

  const [bizumPhone, setBizumPhone] = useState({
    countryCode: '',
    nationalNumber: '',
  })
  const [showPhoneWithoutBizumModal, setShowPhoneWithoutBizumModal] =
    useState(false)
  const [showGenericFailedModal, setShowGenericFailedModal] = useState(false)

  const [paramShowAddNewPaymentMethodModal, , clearAddNewPaymentMethodModal] =
    useSearchParam(PAYMENT_SEARCH_PARAMS.SHOW_ADD_NEW_PAYMENT_METHOD_MODAL)

  useEffect(() => {
    if (paramShowAddNewPaymentMethodModal === 'true') {
      setShowAddNewPaymentMethodModal(true)
      clearAddNewPaymentMethodModal()
    }
  }, [clearAddNewPaymentMethodModal, paramShowAddNewPaymentMethodModal])

  const { updateCheckoutPaymentMethodWithBizum } =
    useUpdateCheckoutPaymentMethodWithBizum({
      checkoutId: checkout?.id,
      paymentFlow: shouldAutoConfirm
        ? PaymentAuthFlow.CHECKOUT_AUTO_CONFIRM
        : PaymentAuthFlow.UPDATE_CHECKOUT_PAYMENT_METHOD,
      onAuthFailure() {},
      clearAllSearchParams: false,
    })

  const showMitTermsModal = () => {
    sendMITTermViewMetrics({ flow: FLOWS.CHECKOUT_TOKEN_AUTHN })

    const mitExplanation = (
      <p
        className="ui-medium-modal__description body1-r"
        tabIndex={TAB_INDEX.ENABLED}
      >
        <Trans>{'mit_term_explanation'}</Trans>
      </p>
    )
    const showAlertWithMitParams = showAlert({
      size: ALERT_SIZES.MEDIUM,
      imageSrc: paymentImage,
      title: t('token_authn_mit_term_title'),
      confirmButtonText: t('token_authn_mit_term_continue_button'),
      confirmButtonAction: confirmMitTermsModal,
      secondaryActionText: t('token_authn_mit_term_cancel_button'),
      secondaryAction: closeMitTermsModal,
      children: mitExplanation,
    })
    dispatch(showAlertWithMitParams)
  }

  const confirmMitTermsModal = () => {
    sendMITTermAcceptClickMetrics()
    dispatch(hideAlert())

    setShowAddNewPaymentMethodModal(true)
  }

  const closeMitTermsModal = () => {
    sendMITTermCloseClickMetrics()
    dispatch(hideAlert())
  }

  const showClosedByUserModal = () => {
    setShowAddNewPaymentMethodModal(false)
    sendTokenAuthnFormClosedByUserMetrics()

    const showAlertWithClosedByUserParams = showAlert({
      size: ALERT_SIZES.MEDIUM,
      imageSrc: alertImage,
      title: t('token_authn_not_confirmed_alert_title'),
      description: t('token_authn_not_confirmed_alert_explanation'),
      confirmButtonText: t('token_authn_not_confirmed_alert_continue_button'),
      confirmButtonAction: () => dispatch(hideAlert()),
    })
    dispatch(showAlertWithClosedByUserParams)
  }

  const showErrorModal = () => {
    setShowAddNewPaymentMethodModal(false)

    PaymentMetrics.endPsd2Flow({
      status: 'failed',
      userFlow: PaymentAuthenticationFlow.CHECKOUT,
      paymentAuthenticationUuid: Storage.getAndRemovePsd2AuthenticationUuid(),
    })

    const showAlertWithErrorParams = showAlert({
      size: ALERT_SIZES.MEDIUM,
      imageSrc: alertImage,
      title: t('checkout_failed_authentication_alert_title'),
      description: t('checkout_failed_authentication_alert_explanation'),
      confirmButtonText: t('checkout_failed_authentication_alert_retry_button'),
      confirmButtonAction: confirmErrorModal,
      secondaryActionText: t(
        'checkout_failed_authentication_alert_close_button',
      ),
      secondaryAction: closeErrorModal,
    })
    dispatch(showAlertWithErrorParams)
  }

  const confirmErrorModal = () => {
    dispatch(hideAlert())

    setShowAddNewPaymentMethodModal(true)
  }

  const closeErrorModal = () => {
    dispatch(hideAlert())
  }

  const openTokenAuthn = () => {
    showMitTermsModal()
  }

  const completeTokenAuthn = async () => {
    ModalService.showSmallModalLegacy({
      title: t('confirm_checkout_loader_title'),
      description: t('confirm_checkout_loader_exaplanation'),
      children: <Loader className="confirm-checkout-loader" />,
    })

    await onSuccess()

    ModalService.hideModal()
  }

  /**
   * @param {{countryCode: string, nationalNumber: string}} payload
   */
  const handleAddPaymentMethodBizum = (payload) => {
    setBizumPhone({
      countryCode: payload.countryCode,
      nationalNumber: payload.nationalNumber,
    })

    if (checkout) {
      updateCheckoutPaymentMethodWithBizum(
        {
          phoneCountryCode: payload.countryCode,
          phoneNationalNumber: payload.nationalNumber,
          autoConfirm: isTokenAuthnFlow,
        },
        {
          async onError(error) {
            await handleManagedError(error)
              .on(PhoneWithoutBizumException, () =>
                setShowPhoneWithoutBizumModal(true),
              )
              .run()
          },
        },
      )
      return
    }
  }

  return (
    <>
      <TokenAuthnContext.Provider
        value={{
          isTokenAuthnFlow: !!checkout && !checkout?.paymentMethod,
          startTokenAuthnFlow: openTokenAuthn,
          checkoutId: checkout?.id,
        }}
      >
        {children}

        {showAddNewPaymentMethodModal && (
          <AddPaymentMethodModal
            onAddNewPaymentMethod={(data) => {
              if (data.paymentMethodType === PaymentMethodType.CREDIT_CARD) {
                setShowAddNewPaymentMethodModal(false)

                PaymentMetrics.endPsd2Flow({
                  status: 'success',
                  userFlow: PaymentAuthenticationFlow.CHECKOUT,
                  paymentAuthenticationUuid: data.payload.authenticationUuid,
                })
                completeTokenAuthn()
              }

              if (data.paymentMethodType === PaymentMethodType.BIZUM) {
                if (flagCheckoutBizumTokenAuthnRestStrategy) {
                  checkoutPaymentsContext?.updatePaymentMethodWithBizum({
                    phoneCountryCode: data.payload.countryCode,
                    phoneNationalNumber: data.payload.nationalNumber,
                  })
                  return
                }
                handleAddPaymentMethodBizum(data.payload)
              }
            }}
            onError={showErrorModal}
            onClose={
              shouldAutoConfirm
                ? showClosedByUserModal
                : () => setShowAddNewPaymentMethodModal(false)
            }
          />
        )}
      </TokenAuthnContext.Provider>

      {showPhoneWithoutBizumModal && (
        <PhoneWithoutBizumModal
          phone={bizumPhone}
          onClick={() => setShowPhoneWithoutBizumModal(false)}
        />
      )}

      {showGenericFailedModal && (
        <PaymentFailedModal
          onClose={() => setShowGenericFailedModal(false)}
          onRetry={() => {
            setShowGenericFailedModal(false)
            setShowAddNewPaymentMethodModal(true)
          }}
        />
      )}
    </>
  )
}

TokenAuthnProvider.propTypes = {
  children: node.isRequired,
  checkout: CheckoutPropTypes,
  onSuccess: func.isRequired,
  shouldAutoConfirm: bool,
}
