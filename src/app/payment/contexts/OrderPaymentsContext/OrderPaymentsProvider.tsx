import { ReactNode, useState } from 'react'

import { useOrderPSD2Context } from '../OrderPSD2Context'
import { OrderPaymentsContext } from './OrderPaymentsContext'
import { OrderAuthenticatingModal } from './components/OrderAuthenticatingModal'

import { useOrderContext } from 'app/order/contexts/OrderContext'
import { PaymentAuthenticationFailedModal } from 'app/payment/components/payment-authentication-failed-modal'
import { PaymentConfirmedModal } from 'app/payment/components/payment-confirmed-modal'
import { PaymentFailedModal } from 'app/payment/components/payment-failed-modal'
import { PhoneWithoutBizumModal } from 'app/payment/components/phone-without-bizum-modal'
import { PSD2Loader } from 'app/payment/components/psd2-loader'
import { PAYMENT_SEARCH_PARAMS } from 'app/payment/constants'
import {
  PaymentAuthenticationRequiredException,
  PhoneWithoutBizumException,
} from 'app/payment/exceptions'
import {
  PaymentAuthFlow,
  useResolveOrderPaymentIncident,
} from 'app/payment/hooks'
import {
  PaymentIncidentReason,
  PaymentTokenAuthnFlow,
} from 'app/payment/interfaces'
import { handleManagedError } from 'app/shared/exceptions'
import { useSearchParam } from 'hooks/useSearchParam'

export const OrderPaymentsProvider = ({
  children,
}: {
  children: ReactNode
}) => {
  const { order, refetchOrder } = useOrderContext()
  const orderPsd2Context = useOrderPSD2Context()

  const [, setShowAddPaymentMethodModalParam] = useSearchParam(
    PAYMENT_SEARCH_PARAMS.SHOW_RESOLVE_PAYMENT_INCIDENT,
  )

  // STATES
  const [showPaymentConfirmedModal, setShowPaymentConfirmedModal] =
    useState(false)
  const [showPaymentFailedModal, setShowPaymentFailedModal] = useState(false)
  const [
    showPaymentAuthenticationFailedModal,
    setShowPaymentAuthenticationFailedModal,
  ] = useState(false)
  const [paymentIncidentReason, setPaymentIncidentReason] =
    useState<PaymentIncidentReason | null>(null)

  const [exceptionPhoneWithoutBizumModal, setExceptionPhoneWithoutBizumModal] =
    useState({ show: false, phone: { countryCode: '', nationalNumber: '' } })

  const {
    resolveOrderPaymentIncident,
    resolveOrderPaymentIncidentNewBizum,
    isLoading: isResolvingOrderPaymentIncident,
    isAuthenticating: isAuthenticatingOrderPaymentIncident,
    startPolling: startPollingOrderPaymentIncident,
    cancelAuthentication: cancelAuthenticationOrderPaymentIncident,
  } = useResolveOrderPaymentIncident({
    orderId: order!.id,
    orderPaymentStatus: order!.paymentStatus,
    onSuccess: async () => {
      refetchOrder()

      setShowPaymentConfirmedModal(true)
      setPaymentIncidentReason(null)
    },
    onError: (
      paymentIncidentReason:
        | PaymentIncidentReason
        | null
        | 'authentication_failed',
    ) => {
      if (paymentIncidentReason === 'authentication_failed') {
        setShowPaymentFailedModal(false)
        setShowPaymentAuthenticationFailedModal(true)
        setPaymentIncidentReason(null)
        return
      }

      setShowPaymentAuthenticationFailedModal(false)
      setPaymentIncidentReason(paymentIncidentReason)
      setShowPaymentFailedModal(true)
    },
    onFallbackRequired: (authenticationUuid) => {
      orderPsd2Context?.startPsd2Auth(
        PaymentAuthFlow.RESOLVE_PAYMENT_INCIDENCE,
        authenticationUuid,
      )
    },
  })

  const resolvePaymentIncidence = async (
    paymentMethodId: number,
    paymentFlow:
      | PaymentAuthFlow.RESOLVE_PAYMENT_INCIDENCE
      | PaymentAuthFlow.RESOLVE_RESCHEDULED_PAYMENT_INCIDENCE,
  ) => {
    await resolveOrderPaymentIncident(paymentMethodId, {
      async onError(error) {
        await handleManagedError(error)
          .on(PaymentAuthenticationRequiredException, (exception) =>
            orderPsd2Context?.startPsd2Auth(
              paymentFlow,
              exception.authentication_uuid,
            ),
          )
          .run()
      },
    })
  }

  const resolvePaymentIncidenceNewBizum = async (
    paymentMethod: { countryCode: string; nationalNumber: string },
    paymentFlow:
      | PaymentTokenAuthnFlow.RESOLVE_PAYMENT_INCIDENT
      | PaymentTokenAuthnFlow.RESOLVE_RESCHEDULED_PAYMENT_INCIDENT,
  ) => {
    await resolveOrderPaymentIncidentNewBizum(paymentMethod, paymentFlow, {
      async onError(error) {
        await handleManagedError(error)
          .on(PhoneWithoutBizumException, () =>
            setExceptionPhoneWithoutBizumModal({
              show: true,
              phone: paymentMethod,
            }),
          )
          .run()
      },
    })
  }

  return (
    <OrderPaymentsContext.Provider
      value={{
        resolvePaymentIncidence,
        resolvePaymentIncidenceNewBizum,
        startPollingOrderPaymentIncident,
      }}
    >
      {children}

      {isResolvingOrderPaymentIncident && <PSD2Loader />}

      {isAuthenticatingOrderPaymentIncident && (
        <OrderAuthenticatingModal
          flow="payment"
          onClose={cancelAuthenticationOrderPaymentIncident}
        />
      )}

      {showPaymentConfirmedModal && (
        <PaymentConfirmedModal
          orderId={order!.id}
          onClick={() => setShowPaymentConfirmedModal(false)}
        />
      )}

      {showPaymentFailedModal && (
        <PaymentFailedModal
          reason={paymentIncidentReason}
          onClose={() => setShowPaymentFailedModal(false)}
          onRetry={() => {
            setShowPaymentFailedModal(false)
            setShowAddPaymentMethodModalParam('true')
          }}
        />
      )}

      {showPaymentAuthenticationFailedModal && (
        <PaymentAuthenticationFailedModal
          onClose={() => setShowPaymentAuthenticationFailedModal(false)}
          onRetry={() => {
            setShowPaymentAuthenticationFailedModal(false)
            setShowAddPaymentMethodModalParam('true')
          }}
        />
      )}

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
    </OrderPaymentsContext.Provider>
  )
}
