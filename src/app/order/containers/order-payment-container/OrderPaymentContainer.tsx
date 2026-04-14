import { useEffect, useState } from 'react'

import { useUserUUID } from 'app/authentication'
import { useCheckoutContext } from 'app/checkout'
import { OrderPayment } from 'app/order/components/order-payment'
import { PaymentMethod } from 'app/payment'
import { PaymentClient } from 'app/payment/client'
import { TokenAuthnProvider } from 'app/payment/contexts/TokenAuthn'
import { useAppDispatch } from 'app/redux'
import { hideAlert, showAddPaymentKoAlert } from 'app/shared/alert/actions'
import { NetworkError } from 'services/http'
import { clearPendingAction } from 'wrappers/feedback/actions'

interface OrderPaymentContainerProps {
  payment: PaymentMethod
  incrementEditMode?: () => void
  decrementEditMode?: () => void
  confirmData: (paymentMethod: Pick<PaymentMethod, 'id'>) => void
  showEditButton: boolean
  forceOpenList: boolean
  checkoutId: number
  orderId: number
  showExpirationDisclaimer?: boolean
}

const OrderPaymentContainer = ({
  payment,
  incrementEditMode,
  decrementEditMode,
  confirmData,
  showEditButton = true,
  forceOpenList,
  checkoutId,
  orderId,
  showExpirationDisclaimer,
}: OrderPaymentContainerProps) => {
  const dispatch = useAppDispatch()
  const { checkout } = useCheckoutContext()
  const userUuid = useUserUUID()

  const [editMode, setEditMode] = useState(false)

  useEffect(() => {
    const { onAddPaymentSuccess, onAddPaymentFailed } =
      window.history.state || {}

    if (onAddPaymentSuccess) {
      setEditMode(true)
      confirmAddPayment()
      window.history.replaceState(null, '')
    }

    if (onAddPaymentFailed) {
      dispatch(
        showAddPaymentKoAlert({
          flow: 'summary',
          confirmButtonAction: () => dispatch(hideAlert()),
        }),
      )
      window.history.replaceState(null, '')
    }
  }, [])

  const confirmSelectPayment = async (id: PaymentMethod['id']) => {
    try {
      const paymentInfo = { id }
      await confirmData(paymentInfo)
      editPayment()
    } catch (error) {
      NetworkError.publish(error)
    } finally {
      dispatch(clearPendingAction())
    }
  }

  const confirmAddPayment = async () => {
    const paymentMethods: PaymentMethod[] =
      await PaymentClient.getListByUserId(userUuid)

    const defaultPayment = paymentMethods.find((payment) => payment.defaultCard)

    if (defaultPayment) {
      confirmSelectPayment(defaultPayment.id)
    }
  }

  const editPayment = async () => {
    setEditMode((current) => !current)

    if (incrementEditMode) {
      setEditFormatMode(editMode, incrementEditMode, decrementEditMode)
    }
  }

  const setEditFormatMode = (
    editMode: boolean,
    incrementEditMode?: () => void,
    decrementEditMode?: () => void,
  ) => {
    if (editMode) {
      decrementEditMode?.()
    } else {
      incrementEditMode?.()
    }
  }

  return (
    <TokenAuthnProvider onSuccess={confirmAddPayment} checkout={checkout}>
      <OrderPayment
        payment={payment}
        selectedPaymentId={payment?.id}
        editPayment={editPayment}
        editMode={editMode}
        confirmSelectPayment={confirmSelectPayment}
        confirmAddPayment={confirmAddPayment}
        showEditButton={showEditButton}
        checkoutId={checkoutId}
        orderId={orderId}
        forceOpenList={forceOpenList}
        showExpirationDisclaimer={showExpirationDisclaimer}
      />
    </TokenAuthnProvider>
  )
}

export { OrderPaymentContainer }
