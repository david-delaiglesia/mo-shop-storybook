import { FC } from 'react'

import { PendingOrderWidgetChatAction } from '../PendingOrderWidgetChatAction'
import { PendingOrderWidgetEditAction } from '../PendingOrderWidgetEditAction'
import { PendingOrderWidgetPaymentIssueAction } from '../PendingOrderWidgetPaymentIssueAction'
import { PendingOrderWidgetPrintableAction } from '../PendingOrderWidgetPrintableAction'
import { PendingOrderWidgetRateAction } from '../PendingOrderWidgetRateAction'

import { Order, OrderStatusUI } from 'app/order'
import confirmedOrderImage from 'app/order/components/pending-order/assets/order-confirmed.svg'
import deliveredOrderImage from 'app/order/components/pending-order/assets/order-delivered.svg'
import deliveringOrderImage from 'app/order/components/pending-order/assets/order-delivering.svg'
import disruptedOrderImage from 'app/order/components/pending-order/assets/order-disrupted.svg'
import nextToDeliveryOrderImage from 'app/order/components/pending-order/assets/order-next-to-delivery.svg'
import preparingOrderImage from 'app/order/components/pending-order/assets/order-preparing.svg'
import { Order as OrderDomain } from 'domain/order'
import { Payment } from 'domain/payment'

type NoneCancelledOrderStatusUI = Exclude<
  OrderStatusUI,
  OrderStatusUI.CANCELLED_BY_SYSTEM | OrderStatusUI.CANCELLED_BY_USER
>

type WidgetAction = FC<{ order: Order }>

interface WidgetConfig {
  image: string
  text: string
  message?: string
  action?: WidgetAction
}

const WIDGET_BY_ORDER_STATUS: Record<NoneCancelledOrderStatusUI, WidgetConfig> =
  {
    [OrderStatusUI.CONFIRMED]: {
      image: confirmedOrderImage,
      text: 'commons.order.on_going',
      action: PendingOrderWidgetEditAction as unknown as WidgetAction,
    },
    [OrderStatusUI.PREPARING]: {
      image: preparingOrderImage,
      text: 'commons.order.preparing',
      message: 'on_going_order.delivering_tomorrow',
    },
    [OrderStatusUI.PREPARED]: {
      image: preparingOrderImage,
      text: 'commons.order.prepared',
      action: PendingOrderWidgetPrintableAction as unknown as WidgetAction,
      message: 'on_going_order.delivering_tomorrow',
    },
    [OrderStatusUI.DELIVERING]: {
      image: deliveringOrderImage,
      text: 'commons.order.delivering',
      action: PendingOrderWidgetPrintableAction as unknown as WidgetAction,
    },
    [OrderStatusUI.NEXT_TO_DELIVERY]: {
      image: nextToDeliveryOrderImage,
      text: 'commons.order.next_to_delivery',
      message: 'next_order_widget_description',
      action: PendingOrderWidgetPrintableAction as unknown as WidgetAction,
    },
    [OrderStatusUI.DELIVERED]: {
      image: deliveredOrderImage,
      text: 'commons.order.delivered',
      message: 'purchase_confirmed_status_service_rating_cell_description',
      action: PendingOrderWidgetRateAction as unknown as WidgetAction,
    },
    [OrderStatusUI.DISRUPTED_BY_CUSTOMER]: {
      image: disruptedOrderImage,
      text: 'commons.order.delivery_disrupted',
      message: 'on_going_order.action_disrupted_delivery_customer',
      action: PendingOrderWidgetChatAction as unknown as WidgetAction,
    },
    [OrderStatusUI.DISRUPTED_BY_SYSTEM]: {
      image: disruptedOrderImage,
      text: 'commons.order.delivery_disrupted',
      message: 'on_going_order.action_disrupted_delivery_system',
      action: PendingOrderWidgetChatAction as unknown as WidgetAction,
    },
  }

const getWidget = (order: Order): WidgetConfig => {
  if (OrderDomain.isDelivered(order)) {
    return WIDGET_BY_ORDER_STATUS[OrderStatusUI.DELIVERED]
  }

  if (OrderDomain.hasPaymentFailed(order)) {
    return {
      image: disruptedOrderImage,
      text: 'commons.order.payment_disrupted',
      message: 'on_going_order.action_disrupted_payment',
      action: PendingOrderWidgetPaymentIssueAction,
    }
  }

  if (OrderDomain.isPrepared(order) && Payment.isPending(order.paymentStatus)) {
    return {
      image: preparingOrderImage,
      text: 'commons.order.prepared',
      message: 'on_going_order.delivering_tomorrow',
    }
  }

  return WIDGET_BY_ORDER_STATUS[order.status as NoneCancelledOrderStatusUI]
}

export const WidgetFactory = {
  getWidget,
}
