import { useTranslation } from 'react-i18next'

import { object } from 'prop-types'

import { Countdown } from 'app/order/components/countdown'
import { SlotUtils } from 'app/shared/slot'
import { Order } from 'domain/order'
import { capitalizeFirstLetter } from 'utils/strings'

const ConfirmedOrderMessage = ({ order }) => {
  const { t } = useTranslation()
  const interpolation = SlotUtils.getDateInfo(order)

  const dayName = capitalizeFirstLetter(interpolation.weekDay)
  const dayNumber = interpolation.monthDay
  const monthName = interpolation.monthName.toLowerCase()
  const deliveryDateMessage = `${dayName} ${dayNumber} ${monthName}`

  const deliveryTimeMessage = {
    key: 'on_going_order.delivery_time',
    interpolation: {
      startTime: interpolation.startTime,
      endTime: interpolation.endTime,
    },
  }

  const shouldDisplayCountdown = Order.isLessThan24HoursAwayFromCutoff(order)

  return (
    <>
      {!shouldDisplayCountdown && (
        <>
          <p className="headline1-sb">{deliveryDateMessage}</p>
          <p className="subhead1-r">
            {t(deliveryTimeMessage.key, deliveryTimeMessage.interpolation)}
          </p>
        </>
      )}
      {shouldDisplayCountdown && (
        <Countdown
          title={t('countdown_remaining_time_widget')}
          cutoffTime={order.changesUntil}
          hideCutoffText
          timezone={order.timezone}
        />
      )}
    </>
  )
}

ConfirmedOrderMessage.propTypes = {
  order: object.isRequired,
}

export { ConfirmedOrderMessage }
