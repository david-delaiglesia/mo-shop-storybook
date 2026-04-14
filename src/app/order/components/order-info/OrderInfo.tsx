import { ComponentType, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { OrderSummary } from '../order-summary'

import {
  OrderCancelledStatus,
  OrderConfirmedStatus,
  OrderDeliveredStatus,
  OrderDeliveringStatus,
  OrderDisruptedByCustomerStatus,
  OrderDisruptedBySystemStatus,
  OrderNextToDeliveryStatus,
  OrderPaymentFailedStatus,
  OrderPreparedStatus,
  OrderPreparingStatus,
  OrderRepreparedPendingPaymentStatus,
} from 'app/order/components/order-status'
import { useOrderContext } from 'app/order/contexts/OrderContext'
import { Order, OrderPaymentStatus, OrderStatusUI } from 'app/order/interfaces'
import { Order as OrderUtils } from 'domain/order'
import { useId } from 'hooks/useId'
import { capitalizeString } from 'utils/strings'

import './OrderInfo.css'

const COMPONENT_BY_STATUS: Record<
  OrderStatusUI,
  ComponentType<{ order: Order }>
> = {
  [OrderStatusUI.CONFIRMED]: OrderConfirmedStatus,
  [OrderStatusUI.PREPARING]: OrderPreparingStatus,
  [OrderStatusUI.PREPARED]: OrderPreparedStatus,
  [OrderStatusUI.DELIVERING]: OrderDeliveringStatus,
  [OrderStatusUI.NEXT_TO_DELIVERY]: OrderNextToDeliveryStatus,
  [OrderStatusUI.DELIVERED]: OrderDeliveredStatus,
  [OrderStatusUI.CANCELLED_BY_USER]: OrderCancelledStatus,
  [OrderStatusUI.CANCELLED_BY_SYSTEM]: OrderCancelledStatus,
  [OrderStatusUI.DISRUPTED_BY_CUSTOMER]: OrderDisruptedByCustomerStatus,
  [OrderStatusUI.DISRUPTED_BY_SYSTEM]: OrderDisruptedBySystemStatus,
}

export const OrderInfo = () => {
  const { t } = useTranslation()
  const id = useId()

  const { order } = useOrderContext()

  if (!order) {
    return null
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const OrderStatus = useMemo(() => {
    if (OrderUtils.hasPaymentFailed(order) && !OrderUtils.isFinal(order)) {
      return OrderPaymentFailedStatus
    }

    if (
      order.paymentStatus === OrderPaymentStatus.REPREPARED_WITH_PENDING_PAYMENT
    ) {
      return OrderRepreparedPendingPaymentStatus
    }

    return COMPONENT_BY_STATUS[order.status]
  }, [order])

  return (
    <div className="order-info">
      <section
        className="order-info__content"
        aria-labelledby={`${id}-order-status`}
      >
        <p className="footnote1-b" id={`${id}-order-status`}>
          {capitalizeString(t('user_area.order_detail.order_status'))}
        </p>
        <OrderStatus order={order} />
      </section>
      <section
        className="order-info__summary"
        aria-labelledby={`${id}-order-summary`}
      >
        <p className="footnote1-b" id={`${id}-order-summary`}>
          {capitalizeString(t('user_area.order_detail.order_price'))}
        </p>
        <OrderSummary order={order} />
      </section>
    </div>
  )
}
