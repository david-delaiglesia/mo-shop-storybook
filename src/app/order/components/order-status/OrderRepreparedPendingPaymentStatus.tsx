import { useTranslation } from 'react-i18next'

import { OrderStatusProgressBar } from './components/OrderStatusProgressBar'

import { Button } from '@mercadona/mo.library.shop-ui/button'

import { Order, OrderMetrics } from 'app/order'
import { PAYMENT_SEARCH_PARAMS } from 'app/payment'
import { useId } from 'hooks/useId'
import { useSearchParam } from 'hooks/useSearchParam'
import { TAB_INDEX } from 'utils/constants'

import './OrderStatus.css'

interface OrderRepreparedPendingPaymentStatusProps {
  order: Order
}

export const OrderRepreparedPendingPaymentStatus = ({
  order,
}: OrderRepreparedPendingPaymentStatusProps) => {
  const { t, i18n } = useTranslation()
  const id = useId()

  const [, setShowAddPaymentMethodModalParam] = useSearchParam(
    PAYMENT_SEARCH_PARAMS.SHOW_RESOLVE_PAYMENT_INCIDENT,
  )

  const handleResolveIncidenceClick = () => {
    OrderMetrics.solvePaymentIssueClick({
      orderId: order.id,
      status: 'reprepared-payment-issue',
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
      <OrderStatusProgressBar status="reprepared_pending_payment" />
      <div className="order-status__content">
        <h6
          id={`${id}-title`}
          className="order-status__content-title order-status__content-title--incidence headline1-b"
        >
          {t('commons.order.reprepared_pending_payment.title', {
            amount: Intl.NumberFormat(i18n.language).format(
              Number(order.rescheduledOrder?.adjustmentAmount ?? 0),
            ),
          })}
        </h6>
        <p
          id={`${id}-description`}
          className="order-status__content-body subhead1-r"
        >
          <span className="order-status__content-body-message">
            {t('commons.order.reprepared_pending_payment.summary')}
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
