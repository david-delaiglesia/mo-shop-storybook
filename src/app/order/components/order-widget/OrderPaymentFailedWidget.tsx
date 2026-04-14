import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router-dom'

import { BaseOrderWidget, OrderWidgetStatus } from './BaseOrderWidget'

import { Button } from '@mercadona/mo.library.shop-ui/button'

import { Order, OrderMetrics } from 'app/order'
import 'app/order/components/pending-order-widget/PendingOrderWidget.css'
import { sendWidgetClickMetrics } from 'app/order/metrics'
import { PAYMENT_SEARCH_PARAMS } from 'app/payment/constants'

interface OrderPaymentFailedWidgetProps {
  order: Order
}

export const OrderPaymentFailedWidget = ({
  order,
}: OrderPaymentFailedWidgetProps) => {
  const { t } = useTranslation()
  const history = useHistory()

  const goToOrderDetail = () => {
    history.push(
      `/user-area/orders/${order.id}?${new URLSearchParams({ [PAYMENT_SEARCH_PARAMS.SHOW_RESOLVE_PAYMENT_INCIDENT]: 'true' })}`,
    )
    sendWidgetClickMetrics(order, 'fix')
  }

  return (
    <BaseOrderWidget
      orderId={order.id}
      status={OrderWidgetStatus.DISRUPTED}
      title={t('commons.order.payment_disrupted')}
      description={t('on_going_order.action_disrupted_payment_description')}
      actions={
        <Button
          className="pending-order-widget__action subhead1-sb"
          variant="tertiary"
          size="small"
          onClick={(event) => {
            event.stopPropagation()
            OrderMetrics.solvePaymentIssueClick({
              orderId: order.id,
              status: 'payment-issue',
            })
            goToOrderDetail()
          }}
        >
          {t('order.detail.status.payment_disrupted.title')}
        </Button>
      }
      onClick={goToOrderDetail}
    />
  )
}
