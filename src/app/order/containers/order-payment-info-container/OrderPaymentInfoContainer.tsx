import { useState } from 'react'

import { useUserUUID } from 'app/authentication'
import { OrderPaymentStatus } from 'app/order'
import { OrderClient } from 'app/order/client'
import { OrderPaymentContainer } from 'app/order/containers/order-payment-container'
import { useOrderContext } from 'app/order/contexts/OrderContext'
import {
  PaymentAuthFlow,
  PaymentAuthenticationFailedModal,
  PaymentAuthenticationRequiredException,
  PaymentConfirmedModal,
  PaymentFailedModal,
  PaymentIncidentReason,
  PaymentMethod,
  usePaymentAuthenticationCallbacks,
} from 'app/payment'
import {
  PAYMENT_SEARCH_PARAMS,
  SCA_SOURCES,
  SCA_STATUS_CODES,
} from 'app/payment/constants'
import { SCAChallengeContainer } from 'app/payment/containers/SCA-challenge-container'
import { useOrderPaymentsContext } from 'app/payment/contexts/OrderPaymentsContext'
import { FLOWS } from 'app/payment/metrics'
import { handleManagedError } from 'app/shared/exceptions'
import { Order } from 'domain/order'
import { useSearchParam } from 'hooks/useSearchParam'
import { HTTP_STATUS } from 'services/http'
import { Storage } from 'services/storage'
import { STORAGE_KEYS } from 'services/storage/constants'
import { PageLoader } from 'system-ui/page-loader'

interface OrderPaymentInfoContainerState {
  SCAId: string | null
  SCASource: ValueOf<typeof SCA_SOURCES> | null
  scaFlow: string
  paymentFlow: PaymentAuthFlow
  isBizum: boolean
  isMIT: boolean

  loading: boolean
  showPaymentConfirmedModal: boolean
  showPaymentFailedModal: boolean
  showPaymentAuthenticationFailedModal: boolean
  paymentIncidentReason: PaymentIncidentReason | null
}

export const OrderPaymentInfoContainer = () => {
  const { order, refetchOrder } = useOrderContext()
  const customerId = useUserUUID()

  const orderPaymentsContext = useOrderPaymentsContext()

  const [state, setState] = useState<OrderPaymentInfoContainerState>({
    SCAId: null,
    SCASource: null,
    isBizum: false,
    isMIT: false,
    scaFlow: FLOWS.EDIT_PAYMENT_METHOD,
    paymentFlow: PaymentAuthFlow.UPDATE_ORDER_PAYMENT_METHOD,

    loading: false,
    showPaymentConfirmedModal: false,
    showPaymentFailedModal: false,
    showPaymentAuthenticationFailedModal: false,
    paymentIncidentReason: null,
  })

  if (!order) return null

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [, setShowAddPaymentMethodModalParam] = useSearchParam(
    PAYMENT_SEARCH_PARAMS.SHOW_RESOLVE_PAYMENT_INCIDENT,
  )

  // eslint-disable-next-line react-hooks/rules-of-hooks
  usePaymentAuthenticationCallbacks({
    flow: PaymentAuthFlow.RESOLVE_RESCHEDULED_PAYMENT_INCIDENCE,
    paymentMethodType: 'any',
    onAuthSuccess: () => {
      orderPaymentsContext?.startPollingOrderPaymentIncident()
    },
    onAuthFailure: () => {
      setState((prevState) => ({
        ...prevState,
        showPaymentFailedModal: true,
        paymentIncidentReason: null,
      }))
    },
  })

  // eslint-disable-next-line react-hooks/rules-of-hooks
  usePaymentAuthenticationCallbacks({
    flow: PaymentAuthFlow.RESOLVE_PAYMENT_INCIDENCE,
    paymentMethodType: 'any',
    onAuthSuccess: () => {
      orderPaymentsContext?.startPollingOrderPaymentIncident()
    },
    onAuthFailure: () => {
      setState((prevState) => ({
        ...prevState,
        showPaymentFailedModal: true,
        paymentIncidentReason: null,
      }))
    },
  })

  const retryPaymentFailed = async () => {
    setState((prevState) => ({ ...prevState, loading: true }))
    await OrderClient.retryPayment(customerId, order.id)
    await refetchOrder()
    setState((prevState) => ({
      ...prevState,
      loading: false,
      showPaymentConfirmedModal: true,
    }))
  }

  const resolvePaymentIncidence = async (
    paymentMethodId: number,
    paymentFlow:
      | PaymentAuthFlow.RESOLVE_PAYMENT_INCIDENCE
      | PaymentAuthFlow.RESOLVE_RESCHEDULED_PAYMENT_INCIDENCE,
  ) => {
    await orderPaymentsContext?.resolvePaymentIncidence(
      paymentMethodId,
      paymentFlow,
    )
  }

  const retryPaymentIfNeeded = async () => {
    if (Order.hasPaymentFailed(order)) {
      await retryPaymentFailed()
      return
    }
  }

  const updatePaymentInfoAndRetry = async (
    selectedPaymentInfo: Pick<PaymentMethod, 'id'>,
  ) => {
    try {
      if (order.paymentStatus === OrderPaymentStatus.FAILED) {
        await resolvePaymentIncidence(
          selectedPaymentInfo.id,
          PaymentAuthFlow.RESOLVE_PAYMENT_INCIDENCE,
        )
        await refetchOrder()
        return
      }

      if (
        order.paymentStatus ===
        OrderPaymentStatus.REPREPARED_WITH_PENDING_PAYMENT
      ) {
        await resolvePaymentIncidence(
          selectedPaymentInfo.id,
          PaymentAuthFlow.RESOLVE_RESCHEDULED_PAYMENT_INCIDENCE,
        )
        await refetchOrder()
        return
      }

      if (selectedPaymentInfo.id === order.paymentMethod.id) {
        await retryPaymentIfNeeded()
        return
      }

      await OrderClient.updatePaymentInfo(
        customerId,
        order.id,
        selectedPaymentInfo,
      )

      await refetchOrder()
      await retryPaymentIfNeeded()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setState((prevState) => ({ ...prevState, loading: false }))
      const isSCARequired = SCA_STATUS_CODES.includes(error.status)
      const isMITRequired = error.status === HTTP_STATUS.MIT

      if (isSCARequired) {
        const errorDetail = await error.json()
        Storage.setItem(STORAGE_KEYS.SCA_UPDATE_PAYMENT, selectedPaymentInfo)
        setState((prevState) => ({
          ...prevState,
          SCAId: errorDetail.errors[0].detail,
          isBizum: false,
          SCASource: SCA_SOURCES.SCA_UPDATE_PAYMENT,
          isMIT: isMITRequired,
        }))
        return
      }

      await handleManagedError(error)
        .on(PaymentAuthenticationRequiredException, (exception) => {
          Storage.setItem(STORAGE_KEYS.SCA_UPDATE_PAYMENT, selectedPaymentInfo)
          setState((prevState) => ({
            ...prevState,
            SCAId: exception.authentication_uuid,
            SCASource: SCA_SOURCES.SCA_UPDATE_PAYMENT,
            isBizum: true,
          }))
        })
        .run()
    } finally {
      setState((prevState) => ({ ...prevState, loading: false }))
    }
  }

  const canEdit =
    Order.isEditable(order) ||
    (!Order.isCancelled(order) && Order.hasPaymentFailed(order))

  return (
    <>
      <SCAChallengeContainer
        id={state.SCAId}
        source={state.SCASource}
        paymentMethod={order.paymentMethod}
        confirm={updatePaymentInfoAndRetry}
        updatePaymentMethod={updatePaymentInfoAndRetry}
        flow={state.scaFlow}
        isMIT={state.isMIT}
        isBizum={state.isBizum}
        paymentFlow={state.paymentFlow}
        orderId={order.id.toString()}
      >
        <OrderPaymentContainer
          payment={order.paymentMethod}
          confirmData={updatePaymentInfoAndRetry}
          showEditButton={canEdit}
          checkoutId={order.id}
          orderId={order.orderId}
          forceOpenList={Order.hasPaymentFailed(order)}
        />
      </SCAChallengeContainer>

      {state.showPaymentConfirmedModal && (
        <PaymentConfirmedModal
          orderId={order.id}
          onClick={() =>
            setState((prevState) => ({
              ...prevState,
              showPaymentConfirmedModal: false,
            }))
          }
        />
      )}

      {state.loading && <PageLoader />}

      {state.showPaymentFailedModal && (
        <PaymentFailedModal
          reason={state.paymentIncidentReason}
          onClose={() =>
            setState((prevState) => ({
              ...prevState,
              showPaymentFailedModal: false,
            }))
          }
          onRetry={() => {
            setState((prevState) => ({
              ...prevState,
              showPaymentFailedModal: false,
            }))
            setShowAddPaymentMethodModalParam('true')
          }}
        />
      )}

      {state.showPaymentAuthenticationFailedModal && (
        <PaymentAuthenticationFailedModal
          onClose={() =>
            setState((prevState) => ({
              ...prevState,
              showPaymentAuthenticationFailedModal: false,
            }))
          }
          onRetry={() => {
            setState((prevState) => ({
              ...prevState,
              showPaymentAuthenticationFailedModal: false,
            }))
            setShowAddPaymentMethodModalParam('true')
          }}
        />
      )}
    </>
  )
}
