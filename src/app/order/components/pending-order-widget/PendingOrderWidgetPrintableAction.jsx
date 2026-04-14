import { useSelector } from 'react-redux'

import { func, object } from 'prop-types'

import { withTranslate } from 'app/i18n/containers/i18n-provider'
import { OrderClient } from 'app/order/client'
import { sendWidgetClickMetrics } from 'app/order/metrics'
import { showFile } from 'utils/files'

const PendingOrderWidgetPrintableAction = ({ order, t }) => {
  const userUuid = useSelector((state) => state.session.uuid)

  const getTicket = async (orderId) => {
    const ticketBody = await OrderClient.getTicket(userUuid, orderId)

    if (!ticketBody) {
      return
    }

    const ticketName = `Receipt-${orderId}.pdf`

    showFile(ticketBody, ticketName)
  }

  const getTicketWithMetrics = (order) => {
    sendWidgetClickMetrics(order, 'see_ticket')
    getTicket(order.id)
  }

  return (
    <button
      className="pending-order-widget__action subhead1-sb"
      onClick={(event) => {
        event.stopPropagation()
        getTicketWithMetrics(order)
      }}
    >
      {t('widget_ticket_action')}
    </button>
  )
}

PendingOrderWidgetPrintableAction.propTypes = {
  order: object.isRequired,
  t: func.isRequired,
}

const PendingOrderWidgetPrintableActionWithTranslate = withTranslate(
  PendingOrderWidgetPrintableAction,
)

export { PendingOrderWidgetPrintableActionWithTranslate as PendingOrderWidgetPrintableAction }
