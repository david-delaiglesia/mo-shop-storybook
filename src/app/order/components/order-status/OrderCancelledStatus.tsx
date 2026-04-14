import { useTranslation } from 'react-i18next'

import moment from 'moment'

import { type Order } from 'app/order'
import { useId } from 'hooks/useId'
import { TAB_INDEX } from 'utils/constants'

import './OrderStatus.css'

interface OrderCancelledStatusProps {
  order: Order
}

export const OrderCancelledStatus = ({ order }: OrderCancelledStatusProps) => {
  const { t, i18n } = useTranslation()

  const id = useId()

  const slotStartTime = moment(order.slot.start)
    .tz(order.slot.timezone)
    .locale(i18n.language)
    .format('DD MMM YYYY')

  return (
    <div
      className="order-status"
      role="status"
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-description`}
      tabIndex={TAB_INDEX.ENABLED}
    >
      <div className="order-status__content">
        <h6
          id={`${id}-title`}
          className="order-status__content-title order-status__content-title--cancelled headline1-b"
        >
          {t('commons.order.cancelled')}
        </h6>
        <p
          className="order-status__content-body subhead1-r"
          id={`${id}-description`}
        >
          <time
            role="time"
            className="order-status__content-body-message--bold headline1-b"
            dateTime={slotStartTime}
          >
            {slotStartTime}
          </time>
          <span className="order-status__content-body-message subhead1-r">
            {t('user_area.order_detail.status_msg.cancelled')}
          </span>
        </p>
      </div>
    </div>
  )
}
