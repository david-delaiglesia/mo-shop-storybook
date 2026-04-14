import { useTranslation } from 'react-i18next'

import { Slot } from 'app/shared/slot'
import { TAB_INDEX } from 'utils/constants'
import { getLongDayName, getNumberDay, getStringMonthDay } from 'utils/dates'
import { DateTime } from 'utils/slots'
import { capitalizeFirstLetter } from 'utils/strings'

import './OrderDeliverySummary.css'

const getDeliveryDate = (start: string) => ({
  weekDay: capitalizeFirstLetter(getLongDayName(start)),
  monthDay: getNumberDay(start),
  month: getStringMonthDay(start),
})

interface OrderDeliverySummaryProps {
  address: string
  slot: Pick<Slot, 'start' | 'end'>
  town: string
  timezone: string
}

export const OrderDeliverySummary = ({
  address,
  slot,
  town,
  timezone,
}: OrderDeliverySummaryProps) => {
  const { t } = useTranslation()

  return (
    <div tabIndex={TAB_INDEX.ENABLED}>
      <p>
        <span className="body1-b">
          {t(
            'commons.order.order_delivery.delivery_date.date',
            getDeliveryDate(slot.start),
          )}
        </span>{' '}
        <span className="body1-b">
          {t('commons.order.order_delivery.delivery_date.time', {
            startTime: DateTime.getFormattedTime(slot.start, timezone),
            endTime: DateTime.getFormattedTime(slot.end, timezone),
          })}
        </span>
      </p>
      <div className="ym-hide-content">
        <p className="subhead1-r">{address}</p>
        <p className="subhead1-r order-delivery-summary__town">{town}</p>
      </div>
    </div>
  )
}
