import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router'

import { createThunk } from '@mercadona/mo.library.dashtil'

import { OrderClient } from 'app/order/client'
import {
  CancelledOrderCell,
  DeliveredOrderCell,
  DeliveringOrderCell,
  DisruptedOrderCell,
  OngoingOrderCell,
  PreparedOrderCell,
  PreparingOrderCell,
} from 'app/order/components/order-cell'
import { OrderPaymentStatus, OrderStatusUI } from 'app/order/interfaces'
import {
  sendRepeatPurchaseClickMetrics,
  sendTicketDownloadClickMetrics,
} from 'app/order/metrics'
import { showRepeatPurchaseAlert } from 'app/shared/alert/commands'
import { Order, OrderPropTypes } from 'domain/order'
import { Payment } from 'domain/payment'
import { showFile } from 'utils/files'
import { clearPendingAction } from 'wrappers/feedback/actions'

const SOURCE = 'my_purchases_view'

const OrderCellContainer = ({ order }) => {
  const { cart, uuid: userUuid } = useSelector(
    ({ cart, session: { uuid } }) => ({
      cart,
      uuid,
    }),
  )
  const history = useHistory()
  const dispatch = useDispatch()

  const buildOrderCellByStatus = () => {
    if (
      order.paymentStatus === OrderPaymentStatus.REPREPARED_WITH_PENDING_PAYMENT
    ) {
      return {
        component: DisruptedOrderCell,
        getProps: getDisruptedOrderProps,
      }
    }

    if (!Order.isFinal(order) && Order.isDisrupted(order)) {
      return {
        component: DisruptedOrderCell,
        getProps: getDisruptedOrderProps,
      }
    }

    const orderCellStatuses = {
      [OrderStatusUI.CONFIRMED]: {
        component: OngoingOrderCell,
        getProps: getOngoingOrderProps,
      },
      [OrderStatusUI.PREPARING]: {
        component: PreparingOrderCell,
        getProps: getPreparingOrderProps,
      },
      [OrderStatusUI.PREPARED]: {
        component: PreparedOrderCell,
        getProps: getPreparedOrderProps,
      },
      [OrderStatusUI.DELIVERING]: {
        component: DeliveringOrderCell,
        getProps: getDeliveringOrderProps,
      },
      [OrderStatusUI.DELIVERED]: {
        component: DeliveredOrderCell,
        getProps: getDeliveredOrderProps,
      },
      [OrderStatusUI.CANCELLED_BY_USER]: {
        component: CancelledOrderCell,
        getProps: getCancelledOrderProps,
      },
      [OrderStatusUI.CANCELLED_BY_SYSTEM]: {
        component: CancelledOrderCell,
        getProps: getCancelledOrderProps,
      },
    }

    return orderCellStatuses[order.status]
  }

  const repeatPurchase = () => {
    sendRepeatPurchaseClickMetrics({
      cart,
      order: { id: order.id },
      source: SOURCE,
    })

    const showRepeatPurchaseAlertThunk = createThunk(showRepeatPurchaseAlert)
    dispatch(showRepeatPurchaseAlertThunk({ cart, order }))
  }

  const getTicket = async () => {
    sendTicketDownloadClickMetrics(SOURCE)

    const orderBlob = await OrderClient.getTicket(userUuid, order.id)
    dispatch(clearPendingAction())

    if (!orderBlob) {
      return
    }

    const title = `Receipt-${order.id}`
    showFile(orderBlob, title)
  }

  const getProps = (extraProps) => {
    const { id, order_id: orderId, summary } = order

    const { total: price } = summary
    return {
      id,
      orderId,
      price,
      ...extraProps,
    }
  }

  const getOngoingOrderProps = () => {
    const { start: startDate, end: endDate, timezone } = order.slot
    const ongoingOrderProps = {
      startDate,
      endDate,
      editOrderClick: editOrderProducts,
      approxPrice: true,
      timezone,
    }
    return getProps(ongoingOrderProps)
  }

  const getPreparedOrderProps = () => {
    const { start: startDate, end: endDate, timezone } = order.slot
    const preparedOrderProps = { startDate, endDate, timezone }

    return getProps(preparedOrderProps)
  }

  const getDeliveringOrderProps = () => {
    const { start: startDate, end: endDate, timezone } = order.slot
    const preparedOrderProps = { startDate, endDate, timezone }

    return getProps(preparedOrderProps)
  }

  const getPreparingOrderProps = () => {
    const { start: startDate, end: endDate, timezone } = order.slot
    const preparingOrderProps = {
      approxPrice: true,
      startDate,
      endDate,
      timezone,
    }

    return getProps(preparingOrderProps)
  }

  const editOrderProducts = () => {
    history.push(`/orders/${order.id}/edit/products`)
  }

  const getDeliveredOrderProps = () => {
    const deliveredOrderProps = {
      repeat: repeatPurchase,
      getTicket: getTicket,
      deliveryDate: order.slot.start,
      cart,
    }
    return getProps(deliveredOrderProps)
  }

  const getCancelledOrderProps = () => {
    const cancelledOrderProps = {
      repeat: repeatPurchase,
      approxPrice: true,
      cart,
    }
    return getProps(cancelledOrderProps)
  }

  const redirectToOrder = () => {
    history.push(`/user-area/orders/${order.id}`)
  }

  const getDisruptedOrderProps = () => {
    const { start: startDate, end: endDate, timezone } = order.slot

    let statusName = 'disrupted'

    if (Payment.isFailed(order.paymentStatus)) {
      statusName = 'with-payment-issue'
    }

    const disruptedOrderProps = {
      redirectToOder: redirectToOrder,
      startDate,
      endDate,
      statusName,
      timezone,
    }

    return getProps(disruptedOrderProps)
  }

  const { component: OrderCell, getProps: getOrderCellProps } =
    buildOrderCellByStatus()

  return <OrderCell {...getOrderCellProps()} />
}

OrderCellContainer.propTypes = {
  order: OrderPropTypes,
}

export default OrderCellContainer
