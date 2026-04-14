import { OrderClient } from '../../client'

import { useUserUUID } from 'app/authentication'
import { OrderCancel } from 'app/order/components/order-cancel'
import { useOrderContext } from 'app/order/contexts/OrderContext'
import {
  sendCancelPurchaseClickMetrics,
  sendCancelPurchaseConfirmationClickMetrics,
} from 'app/order/metrics'
import { useAppDispatch } from 'app/redux'
import { hideAlert, showAlert } from 'app/shared/alert/actions'

export const OrderCancelContainer = () => {
  const dispatch = useAppDispatch()

  const customerId = useUserUUID()
  const { order, refetchOrder } = useOrderContext()

  const closeAlert = () => {
    dispatch(hideAlert())
  }

  const openAlert = () => {
    sendCancelPurchaseClickMetrics(order)
    dispatch(
      showAlert({
        mood: 'destructive',
        title: 'alerts.cancel_order.title',
        description: 'alerts.cancel_order.message',
        confirmButtonText: 'button.cancel_order',
        confirmButtonAction: cancelOrder,
        secondaryActionText: 'button.cancel',
        secondaryAction: closeAlert,
      }),
    )
  }

  const cancelOrder = async () => {
    sendCancelPurchaseConfirmationClickMetrics(order)

    await OrderClient.cancel(customerId, order!.id)
    closeAlert()
    refetchOrder()
  }

  return <OrderCancel onCancel={openAlert} />
}
