import { useTranslation } from 'react-i18next'

import { OrderStatusProgressBar } from './components/OrderStatusProgressBar'

import { Order } from 'app/order/interfaces'
import { Payment } from 'domain/payment'
import { useId } from 'hooks/useId'
import { TAB_INDEX } from 'utils/constants'

import './OrderStatus.css'

interface OrderPreparedStatusProps {
  order: Order
}

export const OrderPreparedStatus = ({ order }: OrderPreparedStatusProps) => {
  const { t } = useTranslation()
  const id = useId()

  return (
    <div
      className="order-status"
      role="status"
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-description`}
      tabIndex={TAB_INDEX.ENABLED}
    >
      <OrderStatusProgressBar status={order.status} />
      <div className="order-status__content">
        <h6
          id={`${id}-title`}
          className="order-status__content-title headline1-b"
        >
          {t('commons.order.prepared')}
        </h6>
        <p
          id={`${id}-description`}
          className="order-status__content-body subhead1-r"
        >
          <span className="order-status__content-body-message">
            {Payment.isDone(order.paymentStatus) &&
              t('user_area.order_detail.status_msg.prepared_paid')}

            {Payment.isPending(order.paymentStatus) &&
              t('user_area.order_detail.status_msg.prepared_not_paid')}
          </span>
        </p>
      </div>
    </div>
  )
}
