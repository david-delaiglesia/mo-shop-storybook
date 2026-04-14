import { useTranslation } from 'react-i18next'
import { Link, useHistory } from 'react-router-dom'

import { OrderWidgetRepeatOrderAction } from './OrderWidgetRepeatOrderAction'
import classNames from 'classnames'
import { number, shape, string } from 'prop-types'

import 'app/order/components/pending-order-widget/PendingOrderWidget.css'
import { PendingOrderWidgetRateAction } from 'app/order/components/pending-order-widget/PendingOrderWidgetRateAction'
import deliveredOrderImage from 'app/order/components/pending-order/assets/order-delivered.svg'
import { sendWidgetClickMetrics } from 'app/order/metrics'
import { SlotUtils } from 'app/shared/slot'
import { Order } from 'domain/order'

const OrderDeliveredWidget = ({ order }) => {
  const history = useHistory()
  const { t } = useTranslation()

  const goToOrderDetail = () => {
    history.push(`/user-area/orders/${order.id}`)
    sendWidgetClickMetrics(order, 'card')
  }

  const canOrderBeRated = Order.canBeRated(order)

  const description = canOrderBeRated
    ? t('purchase_confirmed_status_service_rating_cell_description')
    : t('on_going_order.delivery', SlotUtils.getDateInfo(order))

  const linkClasses = classNames('subhead1-sb', {
    'pending-order-widget__action': !canOrderBeRated,
  })

  const orderNumber = t('on_going_order.order_number', {
    orderNumber: order.id,
  })

  const orderDelivered = t('commons.order.delivered')

  const ariaLabelForOrderDelivered = `${orderNumber}, ${orderDelivered}, ${description}`

  return (
    <li
      className="pending-order-widget"
      onClick={goToOrderDetail}
      aria-label={ariaLabelForOrderDelivered}
    >
      <div className="pending-order-widget__top-section">
        <img
          className="pending-order-widget__image"
          src={deliveredOrderImage}
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
          <p className="headline1-sb" id="pending-order-widget-status">
            {orderDelivered}
          </p>
          <p className="pending-order-widget__delivery subhead1-r">
            {description}
          </p>
        </div>
      </div>
      <div className="pending-order-widget__actions">
        {!canOrderBeRated && (
          <Link
            id="pending-order-widget-see-action"
            data-testid="pending-order-widget-see-action"
            aria-labelledby="pending-order-widget-number pending-order-widget-see-action"
            aria-describedby="pending-order-widget-status"
            className={linkClasses}
            to={`/user-area/orders/${order.id}`}
            onClick={(event) => {
              event.stopPropagation()
              sendWidgetClickMetrics(order, 'review')
            }}
          >
            {t('widget_see_action')}
          </Link>
        )}
        {canOrderBeRated && (
          <PendingOrderWidgetRateAction order={order} position="left" />
        )}
        <OrderWidgetRepeatOrderAction order={order} />
      </div>
    </li>
  )
}

OrderDeliveredWidget.propTypes = {
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

export { OrderDeliveredWidget }
