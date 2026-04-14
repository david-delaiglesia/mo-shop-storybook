import { Ref } from 'react'
import { useTranslation } from 'react-i18next'

import classNames from 'classnames'

import {
  getLongDayName,
  getNumberDay,
  getShortDayName,
  getToday,
} from 'utils/dates'

import './SlotsCalendarDay.css'

interface SlotsCalendarDayProps {
  day: string
  isSelected: boolean
  disabled: boolean
  onClick: () => void
  innerRef: Ref<HTMLDivElement>
}

export const SlotsCalendarDay = ({
  innerRef,
  day,
  isSelected,
  disabled,
  onClick,
}: SlotsCalendarDayProps) => {
  const { t } = useTranslation()

  const handleClick = () => {
    if (disabled) return

    onClick()
  }

  const isToday = day === getToday()

  const dayNumber = getNumberDay(day)
  const dayName = getLongDayName(day)
  const dayShortName = getShortDayName(day)
  const label = `${dayName}, ${dayNumber}${isToday ? `, ${t('commons.order.order_delivery.slots_calendar.today_text')}` : ''}`

  return (
    <div className="slots-calendar-day" ref={innerRef}>
      <button
        className={classNames(
          'slots-calendar-day__button',
          isSelected && 'slots-calendar-day__button--selected',
        )}
        onClick={handleClick}
        disabled={disabled}
        aria-label={label}
        aria-pressed={isSelected}
        aria-disabled={disabled}
      >
        <span className={isSelected ? 'title2-b' : 'title2-r'}>
          {dayNumber}
        </span>
        <span
          className={classNames(
            'slots-calendar-day__name',
            isSelected ? 'footnote1-b' : 'footnote1-r',
          )}
        >
          {isToday
            ? t('commons.order.order_delivery.slots_calendar.today_text')
            : dayShortName}
        </span>
      </button>
    </div>
  )
}
