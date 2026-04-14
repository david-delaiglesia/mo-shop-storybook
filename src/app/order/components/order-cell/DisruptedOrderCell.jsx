import OrderCell from './OrderCell'
import { bool, func, number, string } from 'prop-types'

import { Button } from '@mercadona/mo.library.shop-ui/button/Button'

import { withTranslate } from 'app/i18n/containers/i18n-provider'
import { getLongDayName, getNumberDay, getStringMonthDay } from 'utils/dates'
import { DateTime } from 'utils/slots'
import { capitalizeString } from 'utils/strings'

const DisruptedOrderCell = ({
  statusName,
  id,
  orderId,
  price,
  startDate,
  endDate,
  redirectToOder,
  approxPrice,
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
      statusName={statusName}
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
        <span className="order-cell__status caption2-b order-cell__status--disrupted">
          {capitalizeString(t('commons.order.disrupted'))}
        </span>
      }
      secondaryActionsNode={
        <Button variant="primary" size="small" onClick={redirectToOder}>
          {t('cells.order.disrupted_action')}
        </Button>
      }
    />
  )
}

DisruptedOrderCell.propTypes = {
  statusName: string.isRequired,
  id: number.isRequired,
  orderId: number.isRequired,
  price: string.isRequired,
  startDate: string.isRequired,
  endDate: string.isRequired,
  redirectToOder: func.isRequired,
  approxPrice: bool,
  timezone: string.isRequired,
  t: func.isRequired,
}

export const PlainDisruptedOrderCell = DisruptedOrderCell

export default withTranslate(DisruptedOrderCell)
