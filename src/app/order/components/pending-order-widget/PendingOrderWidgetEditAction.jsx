import { Link, useLocation } from 'react-router-dom'

import { func, object } from 'prop-types'

import { withTranslate } from 'app/i18n/containers/i18n-provider'
import {
  EDIT_PURCHASE_PRODUCTS_SOURCES,
  sendEditPurchaseProductsMetrics,
  sendWidgetClickMetrics,
} from 'app/order/metrics'

const PendingOrderWidgetEditAction = ({ order, t }) => {
  const location = useLocation()

  const sendMetrics = () => {
    sendWidgetClickMetrics(order, 'edit')
    sendEditPurchaseProductsMetrics({
      orderId: order.id,
      source: EDIT_PURCHASE_PRODUCTS_SOURCES.WIDGET,
    })
  }
  return (
    <Link
      to={{
        pathname: `/orders/${order.id}/edit/products`,
        state: { from: location.pathname },
      }}
      className="pending-order-widget__action subhead1-sb"
      onClick={(event) => {
        event.stopPropagation()
        sendMetrics()
      }}
    >
      {t('widget_edit_action')}
    </Link>
  )
}

PendingOrderWidgetEditAction.propTypes = {
  order: object.isRequired,
  t: func.isRequired,
}

const PendingOrderWidgetEditActionWithTranslate = withTranslate(
  PendingOrderWidgetEditAction,
)

export { PendingOrderWidgetEditActionWithTranslate as PendingOrderWidgetEditAction }
