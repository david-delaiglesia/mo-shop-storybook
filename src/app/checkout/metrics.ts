import { Checkout } from './interfaces'

import { Slot, SlotUtils } from 'app/shared/slot'
import { Session } from 'services/session'
import { Tracker } from 'services/tracker'
import {
  getDay,
  getDiffDaysWithToday,
  getEnglishShortWeekDay,
  getNumberDay,
  getTime,
} from 'utils/dates'
import { generateAvailableSlots } from 'utils/slots'

const formatSlotToMetric = (slot: Pick<Slot, 'start' | 'end'>) => {
  return {
    monthday: getNumberDay(slot.start),
    weekday: getEnglishShortWeekDay(slot.start).toLowerCase(),
    time_range: `${getTime(slot.start)} - ${getTime(slot.end)}`,
    centre_code: Session.get().warehouse,
    slot_type: SlotUtils.getDuration(slot),
  }
}

const getFirstAvailableDay = (slotList: Slot[]) => {
  const slotsByDay = generateAvailableSlots(slotList)
  return SlotUtils.getFirstDayWithAvailableSlots(slotsByDay)
}

const getSlotsFirstDay = (slotList: Slot[]): number => {
  const firstAvailableDay = getFirstAvailableDay(slotList)

  if (!firstAvailableDay) {
    return 0
  }

  const { slots } = firstAvailableDay
  const availableSlots = slots.filter(SlotUtils.isAvailable)

  return availableSlots.length
}

const getRealQueue = (slotList: Slot[]) => {
  const daysFromTodayToFirstSlot = 1
  const firstAvailableDay = slotList
    .filter((slot) => SlotUtils.isAvailable(slot))
    .map((slot) => getDay(slot.start))
    .shift()

  if (!firstAvailableDay) {
    return -1
  }

  const slotDays = slotList.map((slot) => getDay(slot.start)).sort()
  const uniqueSlotDays = [...new Set(slotDays)]

  return uniqueSlotDays.indexOf(firstAvailableDay) + daysFromTodayToFirstSlot
}

export const CheckoutMetrics = {
  deliveryView() {
    Tracker.sendInteraction('delivery_view')
  },

  slotFinished(slot: Slot) {
    Tracker.sendInteraction('slot_finished', formatSlotToMetric(slot))
  },

  slotsAvailability(slots: Slot[]) {
    const getQueue = (slotList: Slot[]) => {
      const firstAvailableDay = getFirstAvailableDay(slotList)

      if (!firstAvailableDay) {
        return -1
      }

      return getDiffDaysWithToday(firstAvailableDay.day)
    }

    const properties = {
      queue: getQueue(slots),
      slots_first_day: getSlotsFirstDay(slots),
      real_queue: getRealQueue(slots),
      centre_code: Session.get().warehouse,
    }

    Tracker.sendInteraction('slots_availability', properties)
  },

  finishCheckoutClick(
    checkout: Pick<Checkout, 'cart' | 'summary' | 'paymentMethod'>,
  ) {
    Tracker.sendInteraction('finish_checkout_click', {
      cart_id: checkout.cart.id,
      price: checkout.summary.total,
      is_valid: true,
      has_payment_method: !!checkout.paymentMethod,
    })
  },

  systemDismissCheckoutAlertView() {
    Tracker.sendInteraction('system_dismiss_checkout_alert_view')
  },

  systemDismissCheckoutAlertConfirmClick() {
    Tracker.sendInteraction('system_dismiss_checkout_alert_confirm_click')
  },

  slotTimeClick(slot: Pick<Slot, 'start' | 'end'>) {
    Tracker.sendInteraction('slot_time_click', formatSlotToMetric(slot))
  },

  duplicatedOrdersAlertView() {
    Tracker.sendInteraction('duplicated_orders_alert_view')
  },

  duplicatedOrdersClick(result: 'continue' | 'cancel') {
    Tracker.sendInteraction('duplicated_orders_click', {
      result,
    })
  },

  summaryView(checkout: Pick<Checkout, 'paymentMethod'>) {
    Tracker.sendInteraction('summary_view', {
      has_payment_method: !!checkout?.paymentMethod,
    })
  },
}
