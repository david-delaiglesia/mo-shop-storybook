import { useTranslation } from 'react-i18next'

import { SlotsItem } from '../slots-item'

import { Button } from '@mercadona/mo.library.shop-ui/button'
import { Notifier } from '@mercadona/mo.library.shop-ui/notifier'

import { FocusedElementWithInitialFocus } from 'app/accessibility'
import { CheckoutMetrics } from 'app/checkout'
import { SlotsDetailHoneycomb } from 'app/delivery-area/components/slots-detail-honeycomb'
import { Slot, SlotUtils } from 'app/shared/slot'
import { TAB_INDEX } from 'utils/constants'
import {
  getDiffDays,
  getLongDayName,
  getNumberDay,
  getStringMonthDay,
  getToday,
} from 'utils/dates'

import './SlotsDetail.css'

interface SlotsDetailProps {
  daySlots: Slot[]
  slotDate: string
  onClick: (slot: Slot) => void
  confirm: () => void
  cancel: () => void
  selectedSlot: Slot | null
  isButtonDisabled: boolean
  isCancellable: boolean
  timezone: string
}

export const SlotsDetail = ({
  slotDate,
  daySlots,
  isButtonDisabled,
  isCancellable,
  cancel,
  timezone,
  confirm,
  selectedSlot,
  onClick,
}: SlotsDetailProps) => {
  const { t } = useTranslation()

  const slotDateInfo = {
    weekDay: getLongDayName(slotDate),
    monthDay: getNumberDay(slotDate),
    month: getStringMonthDay(slotDate),
  }
  const isToday = getToday() === slotDate

  const showHoneycombSlots = SlotUtils.isHoneycomb(daySlots)

  const handleSelectSlot = (slot: Slot) => {
    onClick(slot)
  }

  const getDaysOffset = () => {
    const today = getToday()
    return getDiffDays(today, slotDate)
  }

  const getAlertDaysNumber = () => {
    const daysOffset = getDaysOffset()

    return daysOffset
  }

  const showDaysAlertBanner = () => {
    const offsetLimit = 7
    const isVisible = getDaysOffset() >= offsetLimit
    return isVisible
  }

  const confirmWithMetrics = () => {
    if (!selectedSlot) return

    CheckoutMetrics.slotFinished(selectedSlot)
    confirm()
  }

  const renderTodayText = () => {
    return `${t('slot_available_for_selected_day')} ${t(
      'commons.order.order_delivery.slots_calendar.today_text',
    )}
    ${slotDateInfo.monthDay}`
  }

  return (
    <div className="slots-detail" data-testid="slot-detail">
      {showDaysAlertBanner() && (
        <FocusedElementWithInitialFocus inner effectDeps={[slotDate]}>
          <Notifier
            icon="bubble"
            type="alert"
            aria-live="polite"
            className="slots-detail__days-alert-banner visible"
          >
            {t('slot_alert_low_availability', {
              days_left: getAlertDaysNumber(),
            })}
          </Notifier>
        </FocusedElementWithInitialFocus>
      )}
      <hr className="slots-detail__separator" />
      <FocusedElementWithInitialFocus
        enabled={!showDaysAlertBanner()}
        effectDeps={[slotDate]}
      >
        <fieldset
          className="slots-detail__section"
          aria-describedby="slots-detail-description"
          tabIndex={TAB_INDEX.ENABLED}
        >
          <legend className="headline1-b">
            {isToday
              ? renderTodayText()
              : `${t('slot_available_for_selected_day')} ${
                  slotDateInfo.weekDay
                } ${slotDateInfo.monthDay}`}
          </legend>
          <div
            id="slots-detail-description"
            className="slots-detail__description subhead1-r"
          >
            {t('slot_selection_help_hint')}
          </div>
          {showHoneycombSlots && (
            <SlotsDetailHoneycomb
              daySlots={daySlots}
              onSelectSlot={handleSelectSlot}
              selectedSlot={selectedSlot}
              timezone={timezone}
            />
          )}
          {!showHoneycombSlots && (
            <div
              className="slots-detail__content"
              role="group"
              aria-labelledby="slots-detail-description"
            >
              {daySlots.map((slot) => (
                <SlotsItem
                  key={slot.id}
                  slot={slot}
                  onSelect={() => handleSelectSlot(slot)}
                  isSelected={selectedSlot?.start === slot.start}
                  timezone={timezone}
                />
              ))}
            </div>
          )}
        </fieldset>
      </FocusedElementWithInitialFocus>
      <div className="slots-detail__footer">
        {isCancellable && (
          <Button
            variant="secondary"
            size="small"
            data-testid="slot-cancel-button"
            onClick={cancel}
          >
            {t('button.cancel')}
          </Button>
        )}
        <Button
          key={`confirm-button-${selectedSlot?.id || 'no-slot'}`}
          variant="primary"
          size="small"
          data-testid="slot-save-button"
          disabled={isButtonDisabled}
          onClick={confirmWithMetrics}
          autoFocus={!!selectedSlot}
        >
          {t('button.save_changes')}
        </Button>
      </div>
    </div>
  )
}
