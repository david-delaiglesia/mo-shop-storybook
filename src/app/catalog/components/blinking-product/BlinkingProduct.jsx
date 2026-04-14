import { useTranslation } from 'react-i18next'

import classNames from 'classnames'
import { array, instanceOf, shape, string } from 'prop-types'

import { Card } from '@mercadona/mo.library.shop-ui/card'

import { Product } from 'domain/product'
import { getNumberDay, getStringMonthDay } from 'utils/dates'

import './BlinkingProduct.css'

const WEEKDAYS = {
  day1_abbrev: 1,
  day2_abbrev: 2,
  day3_abbrev: 3,
  day4_abbrev: 4,
  day5_abbrev: 5,
  day6_abbrev: 6,
}
const LONG_WEEKDAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
]

const BlinkingProduct = ({ product, selectedDay }) => {
  const { t } = useTranslation()

  const hasValidUnavailableFrom = Product.hasValidUnavailableFrom(
    product,
    selectedDay,
  )

  const manageUnavailableWeekdays = (unavailable_weekdays) => {
    const notAvailableDaysValue = unavailable_weekdays.map(
      (day) => LONG_WEEKDAYS[day - 1],
    )

    if (unavailable_weekdays.length < 3) {
      return `${t(
        'availability_advice.message_not_available',
      )}  ${notAvailableDaysValue
        .map((day) => t(`availability_advice.${day}`))
        .join(', ')}`
    }

    const availableDays = LONG_WEEKDAYS.filter(
      (day) => !notAvailableDaysValue.includes(day),
    )
    return `${t('availability_advice.message_only_available')}  ${availableDays
      .map((day) => t(`availability_advice.${day}`))
      .join(', ')}`
  }

  const manageUnavailableFrom = (unavailable_from) => {
    const month = getStringMonthDay(unavailable_from)
    const day = getNumberDay(unavailable_from)
    return t(`availability_advice.unavailable_from`, { day, month })
  }

  const renderSentenceWithUnavailableDays = () => {
    if (hasValidUnavailableFrom) {
      return manageUnavailableFrom(product.unavailable_from)
    }

    return manageUnavailableWeekdays(product.unavailable_weekdays)
  }

  return (
    <Card key={product.id} padding={1} className="blinking-product">
      <img src={product.thumbnail} alt="" className="blinking-product__image" />
      <div className="blinking-product__right">
        <p className="subhead1-r">{product.display_name}</p>
        <p
          className={classNames('blinking-product__unavailability-text', {
            'caption2-sb': !hasValidUnavailableFrom,
            'footnote1-sb': hasValidUnavailableFrom,
          })}
        >
          {renderSentenceWithUnavailableDays()}
        </p>
        {!hasValidUnavailableFrom && (
          <div className="blinking-product__weekdays">
            {Object.keys(WEEKDAYS).map((day) => (
              <div
                key={day}
                className={classNames('blinking-product__weekday', {
                  'blinking-product__weekday--unavailable':
                    product.unavailable_weekdays.includes(WEEKDAYS[day]),
                  'blinking-product__weekday--available':
                    !product.unavailable_weekdays.includes(WEEKDAYS[day]),
                })}
              >
                <span className="subhead1-sb">
                  {t(`availability_advice.${day}`)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}

BlinkingProduct.propTypes = {
  product: shape({
    id: string.isRequired,
    thumbnail: string.isRequired,
    display_name: string.isRequired,
    unavailable_weekdays: array,
    unavailable_from: instanceOf(Date),
  }).isRequired,
  selectedDay: string,
}

export { BlinkingProduct }
