import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import classNames from 'classnames'

import { CheckoutMetrics } from 'app/checkout/metrics'
import { Slot, SlotUtils } from 'app/shared/slot'
import { DateTime } from 'utils/slots/DateTime'

import './SlotsItemHoneycomb.css'

interface SlotsItemHoneycombProps {
  slot: Slot
  isSelected: boolean
  timezone: string
  onSelect: () => void
}

export const SlotsItemHoneycomb = ({
  slot,
  isSelected,
  timezone,
  onSelect,
}: SlotsItemHoneycombProps) => {
  const { t } = useTranslation()
  const { open, available, start, end } = slot

  const getSlot = (time: string) => DateTime.getFormattedTime(time, timezone)

  useEffect(() => {
    if (isSelected) {
      onSelect()
    }
  }, [])

  const handleSlotClick = () => {
    CheckoutMetrics.slotTimeClick(slot)
    onSelect()
  }

  const isDisabled = !open || !available
  const isOneHourSlot = SlotUtils.getDuration(slot) === 1

  return (
    <button
      className={classNames('slots-item-honeycomb', {
        'headline1-sb slots-item-honeycomb--selected': isSelected,
        'headline1-r': !isSelected,
      })}
      onClick={handleSlotClick}
      aria-pressed={isSelected}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-label={t('commons.order.order_delivery.slots_calendar.item_label', {
        startTime: getSlot(start),
        endTime: getSlot(end),
      })}
    >
      {isDisabled && (
        <div className="subhead1-sb">
          {t('commons.order.order_delivery.slots_detail.not_available')}
        </div>
      )}

      {!isDisabled && (
        <>
          <div>
            {t('commons.order.order_delivery.slots_calendar.item', {
              startTime: getSlot(start),
              endTime: getSlot(end),
            })}
          </div>
          {isOneHourSlot && (
            <div className="slots-item-honeycomb__description subhead1-b">
              {t('slot_size')}
            </div>
          )}
        </>
      )}
    </button>
  )
}
