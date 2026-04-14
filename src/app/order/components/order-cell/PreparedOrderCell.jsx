import { withRouter } from 'react-router-dom'

import OrderCell from './OrderCell'
import { viewProducts } from './utils'
import PropTypes from 'prop-types'

import { compose } from '@mercadona/mo.library.dashtil'
import { Button } from '@mercadona/mo.library.shop-ui/button/Button'

import { withTranslate } from 'app/i18n/containers/i18n-provider'
import { getLongDayName, getNumberDay, getStringMonthDay } from 'utils/dates'
import { DateTime } from 'utils/slots'
import { capitalizeString } from 'utils/strings'

const PreparedOrderCell = ({
  id,
  orderId,
  price,
  startDate,
  endDate,
  history,
  timezone,
  t,
}) => {
  const deliveryDate = {
    weekDay: getLongDayName(startDate),
    monthDay: getNumberDay(startDate),
    month: getStringMonthDay(startDate),
  }

  return (
    <OrderCell
      statusName="prepared"
      orderId={orderId}
      price={price}
      id={id}
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
      statusNode={
        <span className="order-cell__status caption2-b order-cell__status--preparing">
          {capitalizeString(t('commons.order.prepared'))}
        </span>
      }
    />
  )
}

PreparedOrderCell.propTypes = {
  id: PropTypes.number.isRequired,
  orderId: PropTypes.number.isRequired,
  price: PropTypes.string.isRequired,
  startDate: PropTypes.string.isRequired,
  endDate: PropTypes.string.isRequired,
  history: PropTypes.object,
  timezone: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired,
}

export const PlainPreparedOrderCell = PreparedOrderCell

export default compose(withTranslate, withRouter)(PreparedOrderCell)
