import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router-dom'

import OrderCell from './OrderCell'
import { viewProducts } from './utils'
import PropTypes from 'prop-types'

import { Button } from '@mercadona/mo.library.shop-ui/button/Button'

import {
  EDIT_PURCHASE_PRODUCTS_SOURCES,
  sendEditPurchaseProductsMetrics,
} from 'app/order/metrics'
import { getLongDayName, getNumberDay, getStringMonthDay } from 'utils/dates'
import { DateTime } from 'utils/slots'
import { capitalizeString } from 'utils/strings'

const OngoingOrderCell = ({
  id,
  orderId,
  price,
  startDate,
  endDate,
  editOrderClick,
  approxPrice,
  timezone,
}) => {
  const history = useHistory()
  const { t } = useTranslation()

  const deliveryDate = {
    weekDay: getLongDayName(startDate),
    monthDay: getNumberDay(startDate),
    month: getStringMonthDay(startDate),
  }

  const editOrder = () => {
    sendEditPurchaseProductsMetrics({
      orderId,
      source: EDIT_PURCHASE_PRODUCTS_SOURCES.PURCHASE,
    })
    editOrderClick()
  }

  return (
    <OrderCell
      statusName="ongoing"
      orderId={orderId}
      price={price}
      id={id}
      approxPrice={approxPrice}
      titleNode={
        <h1 className="order-cell__title body1-sb">
          {t('cells.order.delivery_date', deliveryDate)}
          <span className="order-cell__sub-title subhead1-r">
            {t('purchase_delivery_time', {
              start_date: DateTime.getFormattedTime(startDate, timezone),
              end_date: DateTime.getFormattedTime(endDate, timezone),
            })}
          </span>
        </h1>
      }
      statusNode={
        <span className="order-cell__status caption2-b order-cell__status--ongoing">
          {capitalizeString(t('commons.order.on_going'))}
        </span>
      }
      actionsNode={
        <Button
          variant="tertiary"
          size="small"
          icon="products"
          onClick={viewProducts(orderId, history)}
        >
          {t('view_products')}
        </Button>
      }
      secondaryActionsNode={
        <Button variant="primary" size="small" onClick={editOrder}>
          {t('button.modify_order')}
        </Button>
      }
    />
  )
}

OngoingOrderCell.propTypes = {
  id: PropTypes.number.isRequired,
  orderId: PropTypes.number.isRequired,
  price: PropTypes.string.isRequired,
  startDate: PropTypes.string.isRequired,
  endDate: PropTypes.string.isRequired,
  editOrderClick: PropTypes.func.isRequired,
  approxPrice: PropTypes.bool,
  timezone: PropTypes.string.isRequired,
}

export { OngoingOrderCell }
