import { useTranslation } from 'react-i18next'

import classNames from 'classnames'
import { object } from 'prop-types'

import { SlotUtils } from 'app/shared/slot'
import { Order } from 'domain/order'
import { capitalizeFirstLetter } from 'utils/strings'

const getWidgetMessage = (order, widget) => {
  const interpolation = SlotUtils.getDateInfo(order)

  if (
    (Order.isPrepared(order) ||
      Order.isPreparing(order) ||
      Order.isDelivering(order)) &&
    Order.isBeingDeliveredToday(order)
  ) {
    return {
      key: 'on_going_order.delivering_today',
      interpolation,
    }
  }

  if (Order.isDelivering(order) && !Order.isBeingDeliveredToday(order)) {
    return {
      key: 'on_going_order.delivery_time',
      interpolation,
    }
  }

  if (widget.message) {
    return {
      key: widget.message,
      interpolation,
    }
  }

  return {
    key: 'on_going_order.delivery',
    interpolation,
  }
}

const getWidgetTitle = (order, widget, t) => {
  if (Order.isDelivering(order) && !Order.isBeingDeliveredToday(order)) {
    const interpolation = SlotUtils.getDateInfo(order)

    const dayName = capitalizeFirstLetter(interpolation.weekDay)
    const dayNumber = interpolation.monthDay
    const monthName = interpolation.monthName.toLowerCase()
    return `${dayName} ${dayNumber} ${monthName}`
  }

  return t(widget.text)
}

const DefaultOrderMessage = ({ widget, order }) => {
  const { t } = useTranslation()
  const widgetMessage = getWidgetMessage(order, widget)
  const widgetTitle = getWidgetTitle(order, widget, t)
  const isDisrupted = Order.isDisrupted(order)
  const className = classNames('headline1-sb', {
    'pending-order-widget__status--disrupted': isDisrupted,
  })

  return (
    <>
      <p className={className} id="pending-order-widget-status">
        {widgetTitle}
      </p>
      <p className="pending-order-widget__delivery subhead1-r">
        {t(widgetMessage.key, widgetMessage.interpolation)}
      </p>
    </>
  )
}

DefaultOrderMessage.propTypes = {
  order: object.isRequired,
  widget: object.isRequired,
}

export { DefaultOrderMessage }
