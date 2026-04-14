import { useTranslation } from 'react-i18next'

import { OrderStatusProgressBar } from './components/OrderStatusProgressBar'

import { type Order } from 'app/order'
import { useId } from 'hooks/useId'
import { TAB_INDEX } from 'utils/constants'

import './OrderStatus.css'

interface OrderDisruptedBySystemStatusProps {
  order: Order
}

export const OrderDisruptedBySystemStatus = ({
  order,
}: OrderDisruptedBySystemStatusProps) => {
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
          className="order-status__content-title order-status__content-title--incidence headline1-b"
        >
          {t('commons.order.delivery_disrupted')}
        </h6>
        <p
          id={`${id}-description`}
          className="order-status__content-body subhead1-r"
        >
          <span className="order-status__content-body-message">
            {t('order.detail.status.disrupted_by_system.body')}
          </span>
        </p>
      </div>
    </div>
  )
}
