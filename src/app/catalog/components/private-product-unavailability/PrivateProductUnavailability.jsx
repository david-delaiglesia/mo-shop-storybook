import { useTranslation } from 'react-i18next'

import { array, instanceOf } from 'prop-types'

import { Icon } from '@mercadona/mo.library.shop-ui/icon'

import {
  getNumberDay,
  getStringMonthDay,
  getToday,
  getWeekDayNameFromWeekNumberDay,
  isEqualOrGreater,
} from 'utils/dates'

const PrivateProductUnavailability = ({
  unavailable_weekdays,
  unavailable_from,
}) => {
  const { t } = useTranslation()
  const today = getToday()

  const shouldHandleUnavailableWeekdays = unavailable_weekdays?.length > 0
  const shouldHandleUnavailableFrom =
    !!unavailable_from && isEqualOrGreater(unavailable_from, today)

  const unavailableFromMessage = () => {
    const month = getStringMonthDay(unavailable_from)
    const day = getNumberDay(unavailable_from)
    const unavailableFromCopy = t(
      `availability_advice.unavailable_from_detail`,
      {
        day,
        month,
      },
    )

    return (
      <div className="private-product-detail__unavailable-days">
        <Icon icon="info" />
        <p>{unavailableFromCopy}</p>
      </div>
    )
  }

  const unavailableWeekdaysMessage = () => {
    return (
      <div className="private-product-detail__unavailable-days">
        <Icon icon="info" />
        <p>
          {t('product_detail.unavailable_weekdays', {
            weekDay: unavailable_weekdays
              .map((day) => getWeekDayNameFromWeekNumberDay(day))
              .join(', ')
              .toLowerCase(),
          })}
        </p>
      </div>
    )
  }

  const unavailableFromAndWeekdaysMessage = () => {
    return (
      <div className="private-product-detail__unavailable-days">
        <Icon icon="info" />
        <p>
          {t('product_detail.unavailable_weekdays_and_from', {
            unavailableWeekdays: unavailable_weekdays
              .map((day) => getWeekDayNameFromWeekNumberDay(day))
              .join(', ')
              .toLowerCase(),
            unavailableFromDay: getNumberDay(unavailable_from),
            unavailableFromMonth:
              getStringMonthDay(unavailable_from).toLowerCase(),
          })}
        </p>
      </div>
    )
  }

  const getMessage = () => {
    if (shouldHandleUnavailableFrom && shouldHandleUnavailableWeekdays) {
      return unavailableFromAndWeekdaysMessage()
    }

    if (shouldHandleUnavailableFrom) {
      return unavailableFromMessage()
    }

    if (shouldHandleUnavailableWeekdays) {
      return unavailableWeekdaysMessage()
    }

    return null
  }

  return getMessage()
}

PrivateProductUnavailability.propTypes = {
  unavailable_weekdays: array,
  unavailable_from: instanceOf(Date),
}

export { PrivateProductUnavailability }
