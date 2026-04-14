import { useTranslation } from 'react-i18next'

import { OrderStatusProgressBar } from './components/OrderStatusProgressBar'

import { Button } from '@mercadona/mo.library.shop-ui/button'

import { Order, OrderMetrics } from 'app/order'
import { PAYMENT_SEARCH_PARAMS } from 'app/payment'
import { useId } from 'hooks/useId'
import { useSearchParam } from 'hooks/useSearchParam'
import { TAB_INDEX } from 'utils/constants'

import './OrderStatus.css'

interface OrderPaymentFailedStatusProps {
  order: Order
}

export const OrderPaymentFailedStatus = ({
  order,
}: OrderPaymentFailedStatusProps) => {
  const { t } = useTranslation()
  const id = useId()

  const [, setShowAddPaymentMethodModalParam] = useSearchParam(
    PAYMENT_SEARCH_PARAMS.SHOW_RESOLVE_PAYMENT_INCIDENT,
  )

  const handleResolveIncidenceClick = () => {
    OrderMetrics.solvePaymentIssueClick({
      orderId: order.id,
      status: 'payment-issue',
    })

    setShowAddPaymentMethodModalParam('true')
  }

  return (
    <div
      className="order-status"
      role="status"
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-description`}
      tabIndex={TAB_INDEX.ENABLED}
    >
      <OrderStatusProgressBar status="payment_failed" />
      <div className="order-status__content">
        <h6
          id={`${id}-title`}
          className="order-status__content-title order-status__content-title--incidence headline1-b"
        >
          {t('commons.order.payment_disrupted')}
        </h6>
        <p
          id={`${id}-description`}
          className="order-status__content-body subhead1-r"
        >
          <span className="order-status__content-body-message">
            {t('user_area.order_detail.status_msg.payment_disrupted')}
          </span>
        </p>
      </div>
      <div className="order-status__actions">
        <Button onClick={handleResolveIncidenceClick}>
          {t('order.detail.status.payment_disrupted.title')}
        </Button>
      </div>
    </div>
  )
}
