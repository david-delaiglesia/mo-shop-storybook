import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import classNames from 'classnames'

import { CheckoutMetrics } from 'app/checkout'
import { Slot } from 'app/shared/slot'
import { DateTime } from 'utils/slots/DateTime'

import './SlotsItem.css'

interface SlotsItemProps {
  slot: Slot
  isSelected: boolean
  timezone: string
  onSelect: () => void
}

export const SlotsItem = ({
  slot,
  isSelected,
  timezone,
  onSelect,
}: SlotsItemProps) => {
  const { t } = useTranslation()
  const { open, available, start, end } = slot

  const getSlot = (time: string) => DateTime.getFormattedTime(time, timezone)

  const handleSelectSlot = () => {
    CheckoutMetrics.slotTimeClick(slot)
    onSelect()
  }

  useEffect(() => {
    if (isSelected) {
      handleSelectSlot()
    }
  }, [])

  if (!isSelected && !open) {
    return (
      <div className="slots-item slots-item--disabled subhead1-sb">
        {t('commons.order.order_delivery.slots_detail.not_available')}
      </div>
    )
  }

  if (!isSelected && !available) {
    return (
      <div className="slots-item slots-item--disabled subhead1-sb">
        {t('commons.order.order_delivery.slots_detail.at_capacity')}
      </div>
    )
  }

  const slotItemClass = classNames('slots-item', {
    'slots-item--selected': isSelected,
    'headline1-sb': isSelected,
    'headline1-r': !isSelected,
  })

  return (
    <button
      className={slotItemClass}
      onClick={handleSelectSlot}
      aria-pressed={isSelected}
      aria-label={t('commons.order.order_delivery.slots_calendar.item_label', {
        startTime: getSlot(start),
        endTime: getSlot(end),
      })}
    >
      {t('commons.order.order_delivery.slots_calendar.item', {
        startTime: getSlot(start),
        endTime: getSlot(end),
      })}
    </button>
  )
}
