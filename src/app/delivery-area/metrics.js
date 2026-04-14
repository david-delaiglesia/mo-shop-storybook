import { Tracker } from 'services/tracker'
import { getEnglishShortWeekDay, getNumberDay } from 'utils/dates'

export const EVENTS = {
  CHANGE_POSTAL_CODE_CLICK: 'change_postal_code_click',
  CHANGE_POSTAL_CODE_SAVE_BUTTON_CLICK: 'change_postal_code_save_button_click',
  CHANGE_POSTAL_CODE_CANCEL_BUTTON_CLICK:
    'change_postal_code_cancel_button_click',
  NO_AVAILABILITY_ALERT: 'no_availability_alert',
  LOW_AVAILABILITY_ALERT: 'low_availability_alert',
  ADDRESS_SUGGESTION_CLICK: 'address_suggestion_click',
  SLOT_DAY_CLICK: 'slot_day_click',
}

function sendChangePostalCodeClickMetrics({ session, source }) {
  if (session.isAuth) return
  Tracker.sendInteraction(EVENTS.CHANGE_POSTAL_CODE_CLICK, { source })
}

function sendSlotsNotificationViewMetrics({ eventKey, message }) {
  Tracker.sendInteraction(eventKey, { message })
}

function sendSlotsNotificationClickMetrics({ eventKey, message }) {
  const key = `${eventKey}_click`
  Tracker.sendInteraction(key, { message })
}

function sendSlotDayClickMetrics(day) {
  const options = {
    monthday: getNumberDay(day),
    weekday: getEnglishShortWeekDay(day).toLowerCase(),
  }
  Tracker.sendInteraction(EVENTS.SLOT_DAY_CLICK, options)
}

export function sendChangePostalCodeSaveClickMetrics(
  old_postal_code,
  new_postal_code,
) {
  Tracker.sendInteraction(EVENTS.CHANGE_POSTAL_CODE_SAVE_BUTTON_CLICK, {
    old_postal_code,
    new_postal_code,
  })
}

export function sendChangePostalCodeCancelClickMetrics() {
  Tracker.sendInteraction(EVENTS.CHANGE_POSTAL_CODE_CANCEL_BUTTON_CLICK)
}

export {
  sendChangePostalCodeClickMetrics,
  sendSlotsNotificationViewMetrics,
  sendSlotsNotificationClickMetrics,
  sendSlotDayClickMetrics,
}
