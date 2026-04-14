import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { OrderMetrics } from 'app/order/OrderMetrics'
import { Order } from 'app/order/interfaces'
import { sendWidgetClickMetrics } from 'app/order/metrics'
import { PAYMENT_SEARCH_PARAMS } from 'app/payment'

interface PendingOrderWidgetPaymentIssueActionProps {
  order: Order
}

export const PendingOrderWidgetPaymentIssueAction = ({
  order,
}: PendingOrderWidgetPaymentIssueActionProps) => {
  const { t } = useTranslation()

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.stopPropagation()
    sendWidgetClickMetrics(order, 'fix')
    OrderMetrics.solvePaymentIssueClick({
      orderId: order.id,
      status: 'payment-issue',
    })
  }

  return (
    <Link
      to={`/user-area/orders/${order.id}?${new URLSearchParams({ [PAYMENT_SEARCH_PARAMS.SHOW_RESOLVE_PAYMENT_INCIDENT]: 'true' })}`}
      className="pending-order-widget__action subhead1-sb"
      onClick={handleClick}
    >
      {t('widget_fix_action')}
    </Link>
  )
}
