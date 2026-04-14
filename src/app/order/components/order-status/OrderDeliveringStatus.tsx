import { useTranslation } from 'react-i18next'

import { OrderStatusProgressBar } from './components/OrderStatusProgressBar'

import { type Order } from 'app/order'
import { useId } from 'hooks/useId'
import { TAB_INDEX } from 'utils/constants'
import { DateTime } from 'utils/slots'

import './OrderStatus.css'

interface OrderDeliveringStatusProps {
  order: Order
}

export const OrderDeliveringStatus = ({
  order,
}: OrderDeliveringStatusProps) => {
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
          {t('order.detail.status.delivering.title')}
        </h6>
        <p
          id={`${id}-description`}
          className="order-status__content-body subhead1-r"
        >
          <span className="order-status__content-body-message">
            {t('order.detail.status.delivering.body', {
              slotStart: DateTime.getFormattedTime(
                order.slot.start,
                order.slot.timezone,
              ),
              slotEnd: DateTime.getFormattedTime(
                order.slot.end,
                order.slot.timezone,
              ),
            })}
          </span>
        </p>
      </div>
    </div>
  )
}
