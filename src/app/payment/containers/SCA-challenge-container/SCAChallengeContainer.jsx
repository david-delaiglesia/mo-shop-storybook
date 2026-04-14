import { Fragment, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useHistory, useLocation } from 'react-router'
import { matchPath } from 'react-router-dom'

import { MITModalContent } from './MITModalContent'
import { SCAPaymentSelector } from './SCAPaymentSelector'
import { any, bool, func, number, object, oneOf, string } from 'prop-types'

import { Loader } from '@mercadona/mo.library.shop-ui/loader'
import { ModalSize } from '@mercadona/mo.library.shop-ui/modal'

import { useUserUUID } from 'app/authentication'
import { OrderClient } from 'app/order/client'
import paymentImage from 'app/order/containers/edit-products-container/assets/payment.png'
import {
  AddPaymentMethodModal,
  AddPaymentMethodModalCustomMode,
  PAYMENT_SEARCH_PARAMS,
  PaymentAuthFlow,
  PaymentAuthenticationFailedModal,
  PaymentAuthenticationFlow,
  PaymentAuthenticationType,
  PaymentMethodType,
  PaymentMetrics,
  PhoneWithoutBizumException,
  PhoneWithoutBizumModal,
  SCA_SOURCES,
  SCA_STATUS,
  usePaymentAuthentication,
  usePaymentAuthenticationCallbacks,
  useUpdateCheckoutPaymentMethodWithBizum,
  useUpdateOrderPaymentMethodWithBizum,
} from 'app/payment'
import { PaymentClient } from 'app/payment/client'
import { OrderPaymentClient } from 'app/payment/client_new'
import { SCAChallenge } from 'app/payment/components/SCA-challenge'
import { SCACheckoutModalInfo } from 'app/payment/components/SCA-checkout-modal-info'
import {
  FLOWS,
  sendAuthenticationRequiredAlertCloseClickMetrics,
  sendAuthenticationRequiredAlertContinueClickMetrics,
  sendAuthenticationRequiredAlertViewMetrics,
  sendFailedAuthenticationAlertCloseClickMetrics,
  sendFailedAuthenticationAlertRetryClickMetrics,
  sendMITTermAcceptClickMetrics,
  sendMITTermCloseClickMetrics,
  sendMITTermViewMetrics,
} from 'app/payment/metrics'
import { handleManagedError } from 'app/shared/exceptions'
import { useModalContext } from 'app/shared/modal'
import { useSearchParam } from 'hooks/useSearchParam'
import { PATHS } from 'pages/paths'
import { knownFeatureFlags, useFlag } from 'services/feature-flags'
import { Storage } from 'services/storage'
import { STORAGE_KEYS } from 'services/storage/constants'
import { Support } from 'services/support'
import { SystemAlert } from 'services/system-alert'
import alertImage from 'system-ui/assets/img/default-alert@2x.png'

import './SCAChallengeContainer.css'

const SCA_CHALLENGE_ERROR_COPIES = {
  [FLOWS.CHECKOUT]: {
    TITLE: 'checkout_failed_authentication_alert_title',
    DESCRIPTION: 'checkout_failed_authentication_alert_explanation',
    PRIMARY_ACTION: 'checkout_failed_authentication_alert_retry_button',
    SECONDARY_ACTION: 'checkout_failed_authentication_alert_close_button',
  },
  [FLOWS.EDIT_ORDER]: {
    TITLE: 'failed_authentication_alert_title',
    DESCRIPTION: 'failed_authentication_alert_explanation',
    PRIMARY_ACTION: 'failed_authentication_alert_retry_button',
    SECONDARY_ACTION: 'failed_authentication_alert_close_button',
  },
  [FLOWS.EDIT_PAYMENT_METHOD]: {
    TITLE: 'failed_authentication_alert_title',
    DESCRIPTION: 'failed_authentication_alert_explanation',
    PRIMARY_ACTION: 'failed_authentication_alert_retry_button',
    SECONDARY_ACTION: 'failed_authentication_alert_close_button',
  },
}

const SCA = {
  reset: () => {
    window.history.replaceState(null, null)
  },
  isActive: () => {
    const { source } = window.history.state || {}
    return (
      source === SCA_SOURCES.SCA_CONFIRM ||
      source === SCA_SOURCES.SCA_ADDED_PAYMENT ||
      source === SCA_SOURCES.SCA_UPDATE_PAYMENT
    )
  },
  hasToRetryConfirm: () => {
    const { source, status } = window.history.state || {}
    return source === SCA_SOURCES.SCA_CONFIRM && status === SCA_STATUS.SUCCESS
  },
  hasToRetryUpdatePayment: () => {
    const { source, status } = window.history.state || {}
    return (
      source === SCA_SOURCES.SCA_UPDATE_PAYMENT && status === SCA_STATUS.SUCCESS
    )
  },
  hasAddedNewPaymentMethod: () => {
    const { source, status } = window.history.state || {}
    return (
      source === SCA_SOURCES.SCA_ADDED_PAYMENT && status === SCA_STATUS.SUCCESS
    )
  },
  hasError: () => {
    const { status } = window.history.state || {}
    return status === SCA_STATUS.ERROR
  },
  getCallbackUrls: (source) => {
    const FILES = {
      [SCA_SOURCES.SCA_CONFIRM]: {
        ok: 'sca_confirm_ok.html',
        ko: 'sca_confirm_ko.html',
      },
      [SCA_SOURCES.SCA_UPDATE_PAYMENT]: {
        ok: 'sca_update_payment_ok.html',
        ko: 'sca_update_payment_ko.html',
      },
    }
    const { host, protocol } = window.location
    const urlOk = `${protocol}//${host}/${FILES[source].ok}?url=${window.location.origin}${window.location.pathname}`
    const urlKo = `${protocol}//${host}/${FILES[source].ko}?url=${window.location.origin}${window.location.pathname}`
    return {
      ok: urlOk,
      ko: urlKo,
    }
  },
}

/**
 * @deprecated This component is deprecated and will be removed in future releases.
 * Use the new OrderPSD2Provider instead.
 */
const SCAChallengeContainer = ({
  children,
  confirm,
  flow,
  paymentFlow,
  id,
  isMIT,
  isBizum,
  onMounted = () => null,
  orderId,
  checkoutId,
  paymentMethod,
  shouldRedirectToHome,
  source,
  stopOrderConfirmLoading = () => null,
  updatePaymentMethod,
}) => {
  const { t } = useTranslation()
  const flagUnifyPaymentAuthenticationError = useFlag(
    knownFeatureFlags.UNIFY_PAYMENT_AUTHENTICATION_ERROR,
  )
  const [
    showPaymentAuthenticationFailedModal,
    setShowPaymentAuthenticationFailedModal,
  ] = useState(false)

  const customerId = useUserUUID()

  const { launchPaymentAuthentication } = usePaymentAuthentication({
    entityId: orderId ?? checkoutId,
  })

  const [paymentParams, setPaymentParams] = useState(null)
  const [isPaymentChallengeVisible, setPaymentChallengeVisibility] =
    useState(false)
  const [isPaymentMethodModalVisible, setPaymentMethodModalVisibility] =
    useState(false)
  const ModalService = useModalContext()
  const session = useSelector(({ session }) => session)
  const { push } = useHistory()
  const { pathname } = useLocation()
  const waitingForConfirm = useMemo(() => SCA.hasToRetryConfirm(), [])
  const hasAddedNewPaymentMethod = useMemo(
    () => SCA.hasAddedNewPaymentMethod(),
    [],
  )

  const [, setShowPaymentCardListParam] = useSearchParam(
    PAYMENT_SEARCH_PARAMS.SHOW_PAYMENT_CARD_LIST,
  )

  const [bizumPhone, setBizumPhone] = useState({
    countryCode: '',
    nationalNumber: '',
  })
  const [showPhoneWithoutBizumModal, setShowPhoneWithoutBizumModal] =
    useState(false)

  usePaymentAuthenticationCallbacks({
    flow: PaymentAuthFlow.UPDATE_ORDER_LINES,
    paymentMethodType: PaymentMethodType.BIZUM,
    onAuthSuccess: () => {
      const storedInfo = Storage.getItem(STORAGE_KEYS.SCA_CONFIRM)
      confirm(storedInfo)
    },
    onAuthFailure: () => {
      onSCAChallengeError(false)
      onMounted({ isSCAActive: true })
    },
  })

  usePaymentAuthenticationCallbacks({
    flow: PaymentAuthFlow.CHECKOUT,
    paymentMethodType: PaymentMethodType.BIZUM,
    onAuthSuccess: () => {
      confirm()
    },
    onAuthFailure: () => {
      onSCAChallengeError(false)
      onMounted({ isSCAActive: true })
    },
  })

  const { updateOrderPaymentMethodWithBizum } =
    useUpdateOrderPaymentMethodWithBizum({
      orderId,
      paymentFlow: PaymentAuthFlow.UPDATE_ORDER_PAYMENT_METHOD,
      async onAuthSuccess() {
        const order = await OrderClient.getById(customerId, orderId)
        confirmSelectPaymentMethod(order?.paymentMethod)
      },
      onAuthFailure() {
        onSCAChallengeError(false)
        onMounted({ isSCAActive: true })
      },
    })

  const { updateCheckoutPaymentMethodWithBizum } =
    useUpdateCheckoutPaymentMethodWithBizum({
      checkoutId,
      paymentFlow: PaymentAuthFlow.UPDATE_CHECKOUT_PAYMENT_METHOD,
      onAuthFailure() {},
    })

  useEffect(() => {
    initializeSCA()
  }, [id])

  useEffect(() => {
    afterChallenge()
  }, [])

  const afterChallenge = () => {
    if (!SCA.isActive()) {
      onMounted({ isSCAActive: false })
      return
    }

    if (!SCA.hasError()) {
      Storage.setFailedAuthPaymentModal()
      PaymentMetrics.endPsd2Flow({
        status: 'success',
        userFlow:
          flow === FLOWS.EDIT_PAYMENT_METHOD
            ? PaymentAuthenticationFlow.EDIT_ORDER
            : flow,
        paymentAuthenticationUuid: Storage.getAndRemovePsd2AuthenticationUuid(),
      })
    }

    if (SCA.hasToRetryConfirm()) {
      const storedInfo = Storage.getItem(STORAGE_KEYS.SCA_CONFIRM)
      confirm(storedInfo)
      return
    }

    if (SCA.hasToRetryUpdatePayment()) {
      const storedConfirmInfo = Storage.getItem(STORAGE_KEYS.SCA_CONFIRM)
      const storedPayment = Storage.getItem(STORAGE_KEYS.SCA_UPDATE_PAYMENT)
      updatePaymentMethod(storedPayment, storedConfirmInfo)
    }

    if (SCA.hasAddedNewPaymentMethod()) {
      setPaymentMethodModalVisibility(true)
    }

    if (SCA.hasError()) {
      onSCAChallengeError()
      onMounted({ isSCAActive: true })
    }

    SCA.reset()
  }

  const initializeSCA = () => {
    if (!id) return

    if (isMIT) {
      Support.showButton(window.location.pathname)
      openMITModal()
      return
    }

    if (source === SCA_SOURCES.SCA_UPDATE_PAYMENT) {
      openLoader()
      openSCAChallengeLegacy()
    }

    if (source === SCA_SOURCES.SCA_CONFIRM) {
      Support.showButton(window.location.pathname)
      openAuthorizationModal()
    }
  }

  const openAuthorizationModal = () => {
    const isCheckoutFlow = flow === FLOWS.CHECKOUT

    if (isCheckoutFlow) {
      openCheckoutAuthorizationModal()

      return
    }

    openSCAChallengeLegacy()
  }

  const openMITModal = () => {
    ModalService.showModal({
      imageSrc: paymentImage,
      size: ModalSize.MEDIUM,
      title: t('mit_term_title'),
      primaryActionText: t('mit_term_accept_button'),
      onPrimaryAction: openSCAChallengeMIT,
      secondaryActionText: t('mit_term_cancel_button'),
      onSecondaryAction: closeMITCheckoutModal,
      children: <MITModalContent />,
    })
    sendMITTermViewMetrics({ flow })
  }

  /**
   * @deprecated This function is deprecated and will be removed in future releases.
   * Use `startPsd2Loader` instead.
   */
  const openLoader = () => {
    const isEditPaymentMethodFlow = flow === FLOWS.EDIT_PAYMENT_METHOD

    if (isEditPaymentMethodFlow) {
      startPsd2Loader()
    }
  }

  const startPsd2Loader = () => {
    ModalService.showSmallModalLegacy({
      title: t('psd2_global_loader_title'),
      description: t('psd2_global_loader_explanation'),
      children: <Loader className="sca-loader" />,
    })
  }

  const openSCAChallengeMIT = () => {
    Storage.removeItem(STORAGE_KEYS.FAILED_AUTH_PAYMENT_MODAL)

    sendMITTermAcceptClickMetrics()
    openSCAChallengeLegacy()
  }

  const openCheckoutAuthorizationModal = () => {
    const hasAlreadySeen = Storage.isCheckoutSCAModalSeen()

    if (hasAlreadySeen) {
      openSCAChallengeLegacy()
      return
    }

    ModalService.showModalLegacy({
      title: t('checkout_payment_changes_alert_title'),
      onClose: closeCheckoutModal,
      primaryActionText: t(
        'checkout_payment_changes_alert_explanation_continue_button',
      ),
      primaryAction: () => {
        Storage.setFailedAuthPaymentModal()
        Storage.setCheckoutSCAModalAsSeen()

        sendAuthenticationRequiredAlertContinueClickMetrics({ flow })
        openSCAChallengeLegacy()
      },
      children: <SCACheckoutModalInfo />,
      secondaryActionText: t(
        'checkout_payment_changes_alert_explanation_back_button',
      ),
      secondaryAction: closeCheckoutModal,
    })
    sendAuthenticationRequiredAlertViewMetrics({ flow })
  }

  const openSCAChallengeLegacy = async () => {
    if (isBizum) {
      launchPaymentAuthentication({
        paymentAuthenticationUuid: id,
        paymentMethodType: PaymentMethodType.BIZUM,
        paymentFlow,
        paymentAuthenticationType: PaymentAuthenticationType.AUTH,
      })
      return
    }

    const response = await OrderPaymentClient.getAuthenticationParameters({
      id,
      userUuid: session.uuid,
      source,
    })

    PaymentMetrics.startPsd2Flow({
      paymentMethodType:
        response.paymentMethodType ?? PaymentMethodType.CREDIT_CARD,
      type: PaymentAuthenticationType.AUTH,
      provider: response.provider,
      paymentAuthenticationUuid: id,
      userFlow:
        flow === FLOWS.EDIT_PAYMENT_METHOD
          ? PaymentAuthenticationFlow.EDIT_ORDER
          : flow,
      isMIT,
    })
    Storage.setPsd2AuthenticationUuid(id)

    SystemAlert.deactivate()
    setPaymentParams(response.params)
    setPaymentChallengeVisibility(true)
    window.history.replaceState(
      window.history.state,
      document.title,
      SCA.getCallbackUrls(source).ko.replace(window.location.origin, ''),
    )
  }

  const onSCAChallengeError = (sendMetric = true) => {
    if (flow === FLOWS.EDIT_ORDER) {
      Storage.setFailedAuthPaymentModal()
    }

    if (sendMetric) {
      PaymentMetrics.endPsd2Flow({
        status: 'failed',
        userFlow:
          flow === FLOWS.EDIT_PAYMENT_METHOD
            ? PaymentAuthenticationFlow.EDIT_ORDER
            : flow,
        paymentAuthenticationUuid: Storage.getAndRemovePsd2AuthenticationUuid(),
      })
    }

    Support.showButton(window.location.pathname)

    if (flagUnifyPaymentAuthenticationError) {
      setShowPaymentAuthenticationFailedModal(true)
      return
    }

    ModalService.showModal({
      size: ModalSize.MEDIUM,
      imageSrc: alertImage,
      title: t(SCA_CHALLENGE_ERROR_COPIES[flow].TITLE),
      description: t(SCA_CHALLENGE_ERROR_COPIES[flow].DESCRIPTION),
      primaryActionText: t(SCA_CHALLENGE_ERROR_COPIES[flow].PRIMARY_ACTION),
      onPrimaryAction: () => {
        sendFailedAuthenticationAlertRetryClickMetrics({ flow })
        openPaymentMethodList()
      },
      secondaryActionText: t(SCA_CHALLENGE_ERROR_COPIES[flow].SECONDARY_ACTION),
      onSecondaryAction: cancelAfterSCAChallengeError,
    })
  }

  const cancelAfterSCAChallengeError = () => {
    handleDeleteDraft()
    sendFailedAuthenticationAlertCloseClickMetrics({ flow })
    ModalService.hideModal()
    Storage.removeItem(STORAGE_KEYS.SCA_CONFIRM)
    Storage.removeItem(STORAGE_KEYS.FAILED_AUTH_PAYMENT_MODAL)
    shouldRedirectToHome && push(PATHS.HOME)
  }

  const openPaymentMethodList = () => {
    ModalService.hideModal()
    Storage.removeItem(STORAGE_KEYS.FAILED_AUTH_PAYMENT_MODAL)

    if (flow === FLOWS.CHECKOUT) {
      setShowPaymentCardListParam('true', { replace: true })
      return
    }

    setPaymentMethodModalVisibility(true)
  }

  const confirmSelectPaymentMethod = async (selectedPaymentMethod) => {
    const storedConfirmInfo = Storage.getItem(STORAGE_KEYS.SCA_CONFIRM)
    const response = await updatePaymentMethod(
      { id: selectedPaymentMethod.id },
      storedConfirmInfo,
    )
    const isLoadingSCA = response?.ok === false || flow === FLOWS.CHECKOUT
    if (isLoadingSCA) return
    setPaymentMethodModalVisibility(false)
  }

  const goBackToSCAChallengeError = () => {
    setPaymentMethodModalVisibility(false)
    onSCAChallengeError()
  }

  const closeCheckoutModal = () => {
    sendAuthenticationRequiredAlertCloseClickMetrics({ flow })
    ModalService.hideModal()
    stopOrderConfirmLoading()
  }

  const handleDeleteDraft = async () => {
    if (!orderId) return
    try {
      await OrderClient.removeDraft(session.uuid, orderId)
    } catch {
      return
    }
  }

  const closeMITCheckoutModal = () => {
    Storage.removeItem(STORAGE_KEYS.FAILED_AUTH_PAYMENT_MODAL)
    handleDeleteDraft()
    sendMITTermCloseClickMetrics()
    ModalService.hideModal()
    stopOrderConfirmLoading()
  }

  const handleAddPaymentMethodBizum = (payload) => {
    setBizumPhone({
      countryCode: payload.countryCode,
      nationalNumber: payload.nationalNumber,
    })

    if (flow === FLOWS.CHECKOUT) {
      updateCheckoutPaymentMethodWithBizum(
        {
          phoneCountryCode: payload.countryCode,
          phoneNationalNumber: payload.nationalNumber,
          autoConfirm: false,
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

    updateOrderPaymentMethodWithBizum(
      {
        phoneCountryCode: payload.countryCode,
        phoneNationalNumber: payload.nationalNumber,
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
  }

  const handleAddNewPaymentMethod = async (data) => {
    if (data.paymentMethodType === PaymentMethodType.BIZUM) {
      handleAddPaymentMethodBizum(data.payload)
    }

    if (data.paymentMethodType === PaymentMethodType.CREDIT_CARD) {
      const paymentMethods = await PaymentClient.getListByUserId(customerId)
      const defaultSelected = paymentMethods?.find(
        (paymentMethod) => paymentMethod?.defaultCard,
      )

      defaultSelected && confirmSelectPaymentMethod(defaultSelected)
    }
  }

  const isOrderDetail = matchPath(pathname, { path: PATHS.USER_AREA_ORDERS_ID })

  const shouldShowNewPaymentForm = useMemo(() => {
    if (
      paymentFlow === PaymentAuthFlow.UPDATE_ORDER_LINES ||
      paymentFlow === PaymentAuthFlow.UPDATE_ORDER_PAYMENT_METHOD
    ) {
      return true
    }

    if (paymentFlow === PaymentAuthFlow.CHECKOUT) {
      return true
    }

    return false
  }, [paymentFlow])

  if (waitingForConfirm && !isOrderDetail) return null

  return (
    <Fragment>
      {children}
      {isPaymentChallengeVisible && (
        <SCAChallenge paymentParams={paymentParams} />
      )}
      {isPaymentMethodModalVisible && !shouldShowNewPaymentForm && (
        <SCAPaymentSelector
          onCancel={goBackToSCAChallengeError}
          onConfirm={confirmSelectPaymentMethod}
          paymentMethod={paymentMethod}
          hasNewPaymentMethod={hasAddedNewPaymentMethod}
        />
      )}

      {shouldShowNewPaymentForm && isPaymentMethodModalVisible && (
        <AddPaymentMethodModal
          title={t('change_card_title')}
          initialMode={AddPaymentMethodModalCustomMode.CURRENT_PAYMENT_METHODS}
          currentPaymentMethod={paymentMethod}
          onChangePaymentMethod={confirmSelectPaymentMethod}
          onAddNewPaymentMethod={handleAddNewPaymentMethod}
          onError={goBackToSCAChallengeError}
          onClose={() => setPaymentMethodModalVisibility(false)}
        />
      )}

      {showPhoneWithoutBizumModal && (
        <PhoneWithoutBizumModal
          phone={bizumPhone}
          onClick={() => setShowPhoneWithoutBizumModal(false)}
        />
      )}

      {showPaymentAuthenticationFailedModal && (
        <PaymentAuthenticationFailedModal
          onClose={() => {
            setShowPaymentAuthenticationFailedModal(false)
            cancelAfterSCAChallengeError()
          }}
          onRetry={() => {
            setShowPaymentAuthenticationFailedModal(false)
            openPaymentMethodList()
          }}
        />
      )}
    </Fragment>
  )
}

SCAChallengeContainer.propTypes = {
  children: any,
  confirm: func.isRequired,
  flow: oneOf([FLOWS.CHECKOUT, FLOWS.EDIT_ORDER, FLOWS.EDIT_PAYMENT_METHOD])
    .isRequired,
  id: string,
  isMIT: bool,
  isBizum: bool,
  onMounted: func,
  orderId: string,
  checkoutId: number,
  paymentFlow: oneOf(Object.values(PaymentAuthFlow)),
  paymentMethod: object,
  shouldRedirectToHome: bool,
  source: string,
  stopOrderConfirmLoading: func,
  updatePaymentMethod: func.isRequired,
}

export { SCAChallengeContainer }
