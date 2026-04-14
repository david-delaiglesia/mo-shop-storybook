import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@mercadona/mo.library.shop-ui/button'
import { Notifier } from '@mercadona/mo.library.shop-ui/notifier'

import { FocusedElementWithInitialFocus } from 'app/accessibility'
import { CheckoutUtils, useCheckoutContext } from 'app/checkout'
import { useCheckoutPaymentsContext } from 'app/checkout/contexts/CheckoutPaymentsContext'
import { OrderPaymentStatus } from 'app/order'
import { OrderDetailCard } from 'app/order/components/order-detail-card'
import { OrderPaymentList } from 'app/order/components/order-payment-list'
import { useOrderContext } from 'app/order/contexts/OrderContext'
import {
  AddNewPaymentMethodCardData,
  AddPaymentMethodModal,
  AddPaymentMethodModalCustomMode,
  HandleAddNewPaymentMethodData,
  OrderPaymentMethodUpdatedModal,
  PAYMENT_SEARCH_PARAMS,
  PaymentAuthFlow,
  PaymentAuthenticationRequiredException,
  PaymentConfirmedModal,
  PaymentFailedException,
  PaymentFailedModal,
  PaymentMethod,
  PaymentMethodSummary,
  PaymentMethodType,
  PaymentMetrics,
  PaymentTokenAuthnFlow,
  PhoneWithoutBizumException,
  PhoneWithoutBizumModal,
  usePaymentAuthenticationForBizum,
  useRetryOrderPaymentWithBizum,
  useUpdateOrderPaymentMethodWithBizum,
} from 'app/payment'
import { useOrderPaymentsContext } from 'app/payment/contexts/OrderPaymentsContext'
import { useUpdateCheckoutPaymentMethodWithBizum } from 'app/payment/hooks/useUpdateCheckoutPaymentMethodWithBizum'
import {
  sendChangePaymentMethodClickMetrics,
  sendChangePaymentMethodFinishedMetrics,
  sendExpiredCardAlertViewMetrics,
} from 'app/payment/metrics'
import { handleManagedError } from 'app/shared/exceptions'
import { usePrevious } from 'hooks/usePrevious'
import { useSearchParam } from 'hooks/useSearchParam'
import { knownFeatureFlags, useFlag } from 'services/feature-flags'
import { PageLoader } from 'system-ui/page-loader'
import { TAB_INDEX } from 'utils/constants'

import './OrderPayment.css'

enum OrderPaymentContent {
  HIDDEN = 'hidden',
  SUMMARY = 'summary',
  CARD_LIST = 'card_list',
}

const cardStatusByContent: Record<OrderPaymentContent, string> = {
  [OrderPaymentContent.HIDDEN]: OrderDetailCard.STATUSES.INACTIVE,
  [OrderPaymentContent.SUMMARY]: OrderDetailCard.STATUSES.ENABLED,
  [OrderPaymentContent.CARD_LIST]: OrderDetailCard.STATUSES.ACTIVE,
}

interface OrderPaymentProps {
  payment?: PaymentMethod
  selectedPaymentId?: number
  confirmAddPayment: () => void
  editPayment: () => void
  confirmSelectPayment: (paymentMethodId: number) => void
  editMode: boolean
  showEditButton: boolean
  forceOpenList: boolean
  checkoutId: number
  orderId: number
  showExpirationDisclaimer?: boolean
}

export const OrderPayment = ({
  payment,
  editPayment,
  forceOpenList,
  confirmSelectPayment,
  confirmAddPayment,
  checkoutId,
  orderId,
  showEditButton,
  editMode,
  showExpirationDisclaimer,
  selectedPaymentId,
}: OrderPaymentProps) => {
  const flagCheckoutBizumTokenAuthnRestStrategy = useFlag(
    knownFeatureFlags.CHECKOUT_BIZUM_TOKEN_AUTHN_REST_STRATEGY,
  )

  const [showAddPaymentMethodModalParam, , clearAddPaymentMethodModalParam] =
    useSearchParam(PAYMENT_SEARCH_PARAMS.SHOW_RESOLVE_PAYMENT_INCIDENT)

  const [showPaymentCardListParam, , clearShowPaymentCardListParam] =
    useSearchParam(PAYMENT_SEARCH_PARAMS.SHOW_PAYMENT_CARD_LIST)

  const orderPaymentsContext = useOrderPaymentsContext()

  useEffect(() => {
    if (showExpirationDisclaimer) {
      sendExpiredCardAlertViewMetrics()
    }
  }, [showExpirationDisclaimer])

  const { t } = useTranslation()

  const { checkout } = useCheckoutContext()
  const checkoutPaymentsContext = useCheckoutPaymentsContext()

  const { order, refetchOrder } = useOrderContext()

  const [showList, setShowList] = useState(false)
  const [showPageLoader, setShowPageLoader] = useState(false)

  const [showAddNewPaymentMethodModal, setShowAddNewPaymentMethodModal] =
    useState(false)

  const [bizumPhone, setBizumPhone] = useState({
    countryCode: '',
    nationalNumber: '',
  })
  const [showPhoneWithoutBizumModal, setShowPhoneWithoutBizumModal] =
    useState(false)
  const [showPaymentFailedModal, setShowPaymentFailedModal] = useState(false)
  const [showPaymentConfirmedModal, setShowPaymentConfirmedModal] =
    useState(false)
  const [
    showOrderPaymentMethodUpdatedModal,
    setShowOrderPaymentMethodUpdatedModal,
  ] = useState(false)

  const { retryOrderPaymentWithBizum } = useRetryOrderPaymentWithBizum({
    orderId,
  })

  const { updateOrderPaymentMethodWithBizum } =
    useUpdateOrderPaymentMethodWithBizum({
      orderId,
      paymentFlow: forceOpenList
        ? PaymentAuthFlow.UPDATE_ORDER_INCIDENCE_PAYMENT_METHOD
        : PaymentAuthFlow.UPDATE_ORDER_PAYMENT_METHOD,
      async onAuthSuccess() {
        const order = await refetchOrder()

        if (order && forceOpenList) {
          confirmSelectPayment(order.paymentMethod.id)
          return
        }

        setShowOrderPaymentMethodUpdatedModal(true)
      },
      onAuthFailure() {},
    })

  const { updateCheckoutPaymentMethodWithBizum } =
    useUpdateCheckoutPaymentMethodWithBizum({
      checkoutId,
      paymentFlow: PaymentAuthFlow.UPDATE_CHECKOUT_PAYMENT_METHOD,
      onAuthFailure() {},
    })

  const { getPaymentAuthenticationForBizum } = usePaymentAuthenticationForBizum(
    {
      orderId,
      onAuthFailure: () => {
        setShowPaymentFailedModal(true)
      },
      onAuthSuccess: ({ phoneCountryCode, phoneNationalNumber }) => {
        setShowPageLoader(true)
        handleConfirmAddBizumPayment({
          countryCode: phoneCountryCode,
          nationalNumber: phoneNationalNumber,
        })
      },
    },
  )

  useEffect(() => {
    if (showAddPaymentMethodModalParam === 'true') {
      setShowAddNewPaymentMethodModal(true)
      clearAddPaymentMethodModalParam()
    }

    if (showAddPaymentMethodModalParam === 'false') {
      editPayment()
      setShowList(false)
      setShowAddNewPaymentMethodModal(false)
      clearAddPaymentMethodModalParam()
    }
  }, [showAddPaymentMethodModalParam])

  const previousForceOpenList = usePrevious(forceOpenList)
  useEffect(() => {
    if (previousForceOpenList && !forceOpenList) {
      editPayment()
      setShowList(false)
    }
  }, [previousForceOpenList, forceOpenList])

  const handleAddNewPaymentMethod = () => {
    PaymentMetrics.addPaymentMethodClick({
      orderId: orderId,
      checkoutId: checkout?.id,
    })
    setShowAddNewPaymentMethodModal(true)
  }

  const handleConfirmSelectPayment = (paymentMethodSelected: PaymentMethod) => {
    sendChangePaymentMethodFinishedMetrics(paymentMethodSelected)
    confirmSelectPayment(paymentMethodSelected.id)
    setShowAddNewPaymentMethodModal(false)
  }

  const handleAddBizumPayment = ({
    countryCode,
    nationalNumber,
  }: {
    countryCode: string
    nationalNumber: string
  }) => {
    setBizumPhone({
      countryCode,
      nationalNumber,
    })

    retryOrderPaymentWithBizum(
      {
        phoneCountryCode: countryCode,
        phoneNationalNumber: nationalNumber,
      },
      {
        async onError(error) {
          await handleManagedError(error)
            .on(PhoneWithoutBizumException, () =>
              setShowPhoneWithoutBizumModal(true),
            )
            .on(PaymentFailedException, () => {
              PaymentMetrics.paymentErrorView({
                orderId,
                errorType: 'payment_failed',
                errorHeaderDisplayed: t('alerts.payment_failed.title'),
              })
              setShowPaymentFailedModal(true)
            })
            .on(PaymentAuthenticationRequiredException, () =>
              getPaymentAuthenticationForBizum({
                phoneCountryCode: countryCode,
                phoneNationalNumber: nationalNumber,
              }),
            )
            .onUnhandled((unhandled) => {
              if (unhandled.type === 'managed') {
                PaymentMetrics.paymentErrorView({
                  orderId,
                  errorType: unhandled.exception.code,
                  errorDescriptionDisplayed: unhandled.exception.detail,
                })
                return
              }

              PaymentMetrics.paymentErrorView({
                orderId,
                errorType: 'unknown',
              })
            })
            .run()
        },
        onSuccess() {
          refetchOrder()
          setShowPaymentConfirmedModal(true)
        },
        onSettled() {
          setShowPageLoader(false)
        },
      },
    )
  }

  const handleConfirmAddBizumPayment = ({
    countryCode,
    nationalNumber,
  }: {
    countryCode: string
    nationalNumber: string
  }) => {
    PaymentMetrics.bizumAddPhoneClick({
      countryCode,
      phoneNumber: nationalNumber,
    })

    handleAddBizumPayment({ countryCode, nationalNumber })
  }

  const handleCancelEdit = () => {
    setShowList(false)
    editPayment()
  }

  const handleEditPayment = () => {
    if (forceOpenList) {
      setShowAddNewPaymentMethodModal(true)
      return
    }

    sendChangePaymentMethodClickMetrics({
      checkoutId,
      orderId,
      payment,
    })
    setShowList(true)
    editPayment()
  }

  const handleRetryPaymentFailed = () => {
    setShowPaymentFailedModal(false)
    setShowAddNewPaymentMethodModal(true)
  }

  const handleCancelPaymentFailed = () => {
    setShowPaymentFailedModal(false)
    setShowAddNewPaymentMethodModal(false)
    setShowList(false)
  }

  const handleAddPaymentMethod = (data: HandleAddNewPaymentMethodData) => {
    if (data.paymentMethodType === PaymentMethodType.BIZUM) {
      handleAddPaymentMethodBizum(data.payload)
    }

    if (data.paymentMethodType === PaymentMethodType.CREDIT_CARD) {
      confirmAddPayment()
      setShowAddNewPaymentMethodModal(false)
      setShowList(false)
    }
  }

  const handleAddPaymentMethodError = (data: AddNewPaymentMethodCardData) => {
    if (data.paymentMethodType === PaymentMethodType.CREDIT_CARD) {
      setShowPaymentFailedModal(true)
    }
  }

  const handleAddPaymentMethodBizum = (payload: {
    countryCode: string
    nationalNumber: string
  }) => {
    setBizumPhone({
      countryCode: payload.countryCode,
      nationalNumber: payload.nationalNumber,
    })

    if (checkout) {
      if (flagCheckoutBizumTokenAuthnRestStrategy) {
        checkoutPaymentsContext?.updatePaymentMethodWithBizum({
          phoneCountryCode: payload.countryCode,
          phoneNationalNumber: payload.nationalNumber,
        })
        return
      }

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

    if (
      order?.paymentStatus ===
      OrderPaymentStatus.REPREPARED_WITH_PENDING_PAYMENT
    ) {
      setShowAddNewPaymentMethodModal(false)
      orderPaymentsContext?.resolvePaymentIncidenceNewBizum(
        {
          countryCode: payload.countryCode,
          nationalNumber: payload.nationalNumber,
        },
        PaymentTokenAuthnFlow.RESOLVE_RESCHEDULED_PAYMENT_INCIDENT,
      )
      return
    }

    if (order?.paymentStatus === OrderPaymentStatus.FAILED) {
      setShowAddNewPaymentMethodModal(false)
      orderPaymentsContext?.resolvePaymentIncidenceNewBizum(
        {
          countryCode: payload.countryCode,
          nationalNumber: payload.nationalNumber,
        },
        PaymentTokenAuthnFlow.RESOLVE_PAYMENT_INCIDENT,
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

  const contentKey: OrderPaymentContent = useMemo(() => {
    if (CheckoutUtils.isPaymentDisabled(checkout)) {
      return OrderPaymentContent.HIDDEN
    }

    if (editMode && showList) {
      return OrderPaymentContent.CARD_LIST
    }

    return OrderPaymentContent.SUMMARY
  }, [checkout, editMode, showList])

  useEffect(() => {
    if (showPaymentCardListParam === 'true') {
      setShowList(true)
      editPayment()
      clearShowPaymentCardListParam()
    }
  }, [showPaymentCardListParam, editPayment, clearShowPaymentCardListParam])

  const cardStatus = cardStatusByContent[contentKey]

  const shouldShowEditButton = useMemo(() => {
    if (cardStatus !== OrderDetailCard.STATUSES.ENABLED) {
      return false
    }

    return showEditButton
  }, [showEditButton, cardStatus])

  const title = t('commons.order.order_payment.payment')

  const renderOrderPaymentDetail = () => {
    return (
      <OrderDetailCard.Content>
        {OrderPaymentContent.SUMMARY === contentKey && payment && (
          <div
            data-testid="order-payment-resume"
            className="order-payment-resume"
          >
            <PaymentMethodSummary paymentMethod={payment} />

            {forceOpenList && (
              <Notifier type="alert">
                {t(
                  'order_detail_payment_failed_payment_method_section_disclaimer',
                )}
              </Notifier>
            )}
          </div>
        )}

        {OrderPaymentContent.CARD_LIST === contentKey && (
          <>
            <FocusedElementWithInitialFocus>
              <p className="body1-r" tabIndex={TAB_INDEX.DISABLED}>
                {forceOpenList
                  ? t(
                      'order_detail_payment_failed_payment_method_list_disclaimer',
                    )
                  : t('commons.order.order_payment.payment_list.options')}
              </p>
            </FocusedElementWithInitialFocus>

            <OrderPaymentList
              currentSelectedPaymentId={selectedPaymentId}
              onAddNewPaymentMethodClick={handleAddNewPaymentMethod}
              onPaymentMethodConfirm={handleConfirmSelectPayment}
              onClose={handleCancelEdit}
            />
          </>
        )}

        {showExpirationDisclaimer && (
          <div className="order-payment__expiration-disclaimer">
            <Notifier variant="alert">
              {t('checkout.credit_card_expired_on_delivery_date')}
            </Notifier>
          </div>
        )}
      </OrderDetailCard.Content>
    )
  }

  const addPaymentMethodModalMode: AddPaymentMethodModalCustomMode | undefined =
    useMemo(() => {
      if (forceOpenList) {
        return AddPaymentMethodModalCustomMode.RESOLVE_PAYMENT_INCIDENT
      }

      if (
        order?.paymentStatus ===
        OrderPaymentStatus.REPREPARED_WITH_PENDING_PAYMENT
      ) {
        return AddPaymentMethodModalCustomMode.RESOLVE_PAYMENT_PENDING
      }

      return undefined
    }, [forceOpenList, order?.paymentStatus])

  const addPaymentMethodModalPaymentFlow: PaymentAuthFlow | undefined =
    useMemo(() => {
      if (
        order?.paymentStatus ===
        OrderPaymentStatus.REPREPARED_WITH_PENDING_PAYMENT
      ) {
        return PaymentAuthFlow.RESOLVE_RESCHEDULED_PAYMENT_INCIDENCE
      }

      if (order?.paymentStatus === OrderPaymentStatus.FAILED) {
        return PaymentAuthFlow.RESOLVE_PAYMENT_INCIDENCE
      }

      return undefined
    }, [forceOpenList, order?.paymentStatus])

  return (
    <>
      <OrderDetailCard
        aria-label={title}
        className="order-payment"
        hover={shouldShowEditButton}
        status={cardStatus}
        aria-disabled={cardStatus === OrderDetailCard.STATUSES.INACTIVE}
      >
        <OrderDetailCard.Header>
          <OrderDetailCard.Title>{title}</OrderDetailCard.Title>
        </OrderDetailCard.Header>
        {renderOrderPaymentDetail()}
        {shouldShowEditButton && (
          <Button
            variant="text"
            aria-label={t('button.edit')}
            onClick={handleEditPayment}
            className="order-payment__modify-button"
          >
            {t('button.edit')}
          </Button>
        )}
      </OrderDetailCard>

      {showAddNewPaymentMethodModal && (
        <AddPaymentMethodModal
          initialMode={addPaymentMethodModalMode}
          paymentFlow={addPaymentMethodModalPaymentFlow}
          currentPaymentMethod={payment}
          onAddNewPaymentMethod={handleAddPaymentMethod}
          onChangePaymentMethod={handleConfirmSelectPayment}
          onError={handleAddPaymentMethodError}
          onClose={() => setShowAddNewPaymentMethodModal(false)}
        />
      )}

      {showPhoneWithoutBizumModal && (
        <PhoneWithoutBizumModal
          phone={bizumPhone}
          onClick={() => setShowPhoneWithoutBizumModal(false)}
        />
      )}

      {showPaymentFailedModal && (
        <PaymentFailedModal
          reason={null}
          onRetry={handleRetryPaymentFailed}
          onClose={handleCancelPaymentFailed}
        />
      )}

      {showPaymentConfirmedModal && (
        <PaymentConfirmedModal
          orderId={orderId}
          onClick={() => setShowPaymentConfirmedModal(false)}
        />
      )}

      {showOrderPaymentMethodUpdatedModal && (
        <OrderPaymentMethodUpdatedModal
          onClick={() => setShowOrderPaymentMethodUpdatedModal(false)}
        />
      )}

      {showPageLoader && <PageLoader />}
    </>
  )
}
