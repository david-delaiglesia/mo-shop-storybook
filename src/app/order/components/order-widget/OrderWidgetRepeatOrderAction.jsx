import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'

import { number, shape } from 'prop-types'

import { createThunk } from '@mercadona/mo.library.dashtil'

import {
  sendRepeatPurchaseClickMetrics,
  sendWidgetClickMetrics,
} from 'app/order/metrics'
import { showRepeatPurchaseAlert } from 'app/shared/alert/commands'

const OrderWidgetRepeatOrderAction = ({ order }) => {
  const dispatch = useDispatch()
  const { cart } = useSelector(({ cart }) => ({ cart }))
  const { t } = useTranslation()

  const repeatPurchase = (event) => {
    event.stopPropagation()
    sendWidgetClickMetrics(order, 'repeat_purchase')
    sendRepeatPurchaseClickMetrics({ cart, order, source: 'widget' })

    const showRepeatPurchaseAlertThunk = createThunk(showRepeatPurchaseAlert)
    dispatch(showRepeatPurchaseAlertThunk({ cart, order }))
  }
  return (
    <button
      className="pending-order-widget__action subhead1-sb"
      onClick={repeatPurchase}
    >
      {t('widget_repeat_purchase_action')}
    </button>
  )
}

OrderWidgetRepeatOrderAction.propTypes = {
  order: shape({
    id: number.isRequired,
  }).isRequired,
}

export { OrderWidgetRepeatOrderAction }
