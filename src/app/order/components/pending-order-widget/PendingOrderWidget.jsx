import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useHistory } from 'react-router-dom'

import { ConfirmedOrderMessage } from './PendingOrderWidget/ConfirmedOrderMessage'
import { DefaultOrderMessage } from './PendingOrderWidget/DefaultOrderMessage'
import { WidgetFactory } from './PendingOrderWidget/WidgetFactory'
import { number, shape, string } from 'prop-types'

import { OrderPaymentStatus } from 'app/order'
import {
  OrderDeliveredWidget,
  OrderPaymentFailedWidget,
  OrderRepreparedPaymentPendingWidget,
} from 'app/order/components/order-widget'
import { sendWidgetClickMetrics } from 'app/order/metrics'
import { Order as OrderUtils } from 'domain/order'
import { TAB_INDEX } from 'utils/constants'

import './PendingOrderWidget.css'

export const PendingOrderWidget = ({ order }) => {
  const { t } = useTranslation()
  const history = useHistory()
  const widget = WidgetFactory.getWidget(order)

  const orderDetailRef = useRef()

  const [pendingOrderAriaLabel, setPendingOrderAriaLabel] = useState('')

  const orderNumber = t('on_going_order.order_number', {
    orderNumber: order.id,
  })

  useEffect(() => {
    const orderDetail = orderDetailRef?.current?.textContent
    setPendingOrderAriaLabel(`${orderNumber}, ${orderDetail}`)
  }, [orderDetailRef?.current?.textContent, orderNumber])

  if (
    order.paymentStatus === OrderPaymentStatus.REPREPARED_WITH_PENDING_PAYMENT
  ) {
    return <OrderRepreparedPaymentPendingWidget order={order} />
  }

  if (order.paymentStatus === OrderPaymentStatus.FAILED) {
    return <OrderPaymentFailedWidget order={order} />
  }

  if (OrderUtils.isDelivered(order)) {
    return <OrderDeliveredWidget order={order} />
  }

  const ActionComponent = widget.action

  const goToOrderDetail = () => {
    history.push(`/user-area/orders/${order.id}`)
    sendWidgetClickMetrics(order, 'card')
  }

  return (
    <li
      aria-label={pendingOrderAriaLabel}
      tabIndex={TAB_INDEX.ENABLED}
      className="pending-order-widget"
      onClick={goToOrderDetail}
    >
      <div className="pending-order-widget__top-section">
        <img
          className="pending-order-widget__image"
          src={widget.image}
          data-testid="purchase-status-image"
          alt=""
        />
        <div className="pending-order-widget__info" aria-hidden={true}>
          <h3
            id="pending-order-widget-number"
            className="pending-order-widget__number footnote1-sb"
          >
            {orderNumber}
          </h3>
          <div ref={orderDetailRef}>
            {!OrderUtils.isConfirmed(order) && (
              <DefaultOrderMessage order={order} widget={widget} />
            )}
            {OrderUtils.isConfirmed(order) && (
              <ConfirmedOrderMessage order={order} />
            )}
          </div>
        </div>
      </div>
      <div className="pending-order-widget__actions">
        <Link
          id="pending-order-widget-see-action"
          data-testid="pending-order-widget-see-action"
          className="pending-order-widget__action subhead1-sb"
          to={`/user-area/orders/${order.id}`}
          onClick={(event) => {
            event.stopPropagation()
            sendWidgetClickMetrics(order, 'review')
          }}
        >
          {t('widget_see_action')}
        </Link>
        {ActionComponent && <ActionComponent order={order} />}
      </div>
    </li>
  )
}

PendingOrderWidget.propTypes = {
  order: shape({
    id: number.isRequired,
    paymentStatus: number.isRequired,
    status: string.isRequired,
    slot: shape({
      start: string.isRequired,
      end: string.isRequired,
    }).isRequired,
  }).isRequired,
}
