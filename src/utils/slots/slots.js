import {
  addDaysToDate,
  getDay,
  getDiffDays,
  getToday,
  sortDateAsc,
} from '../dates'

import { SlotUtils } from 'app/shared/slot'

const DAYS_PER_ROW = 5
export const INCLUSIVE_DIFFERENCE_OFFSET = 1

export function getDefaultDay(slots) {
  const defaultDay = slots.find(
    (slot) => slot.open && slot.available && getDay(slot.start) > getToday(),
  )

  if (!defaultDay) {
    return getDay(slots[0].start)
  }
  return getDay(defaultDay.start)
}

export function getInclusiveDiffDays(firstDay, lastDay) {
  const diffDays = getDiffDays(firstDay, lastDay)

  if (diffDays < INCLUSIVE_DIFFERENCE_OFFSET) {
    return INCLUSIVE_DIFFERENCE_OFFSET
  }

  return diffDays + INCLUSIVE_DIFFERENCE_OFFSET
}

export function generateAvailableSlots(slots) {
  const firstDay = getToday()
  const lastDay = getLastDayFromSlots(slots)
  const diffDays = getInclusiveDiffDays(firstDay, lastDay) - 1
  const gapDays = Math.ceil(diffDays / DAYS_PER_ROW) * DAYS_PER_ROW + 1

  const availableSlotsFromDay = Array.from({
    length: gapDays,
  }).map((_, index) => getAvailableSlotsFromDay(firstDay, slots, index))

  return availableSlotsFromDay
}

function isAvailableSlot(day) {
  return (slot) => SlotUtils.isAvailable(slot) && getDay(slot.start) === day
}

export function getAvailableSlotsFromDay(firstDay, slots, index) {
  const day = addDaysToDate(index, firstDay)
  const slotsForDay = slots.filter((slot) => getDay(slot.start) === day)
  const sortedSlots = sortSlotsByDate(slotsForDay)
  const hasAvailableSlots = slots.some(isAvailableSlot(day))

  return {
    day,
    activeSlots: hasAvailableSlots && SlotUtils.isWorkingDay(sortedSlots),
    slots: sortedSlots,
  }
}

export function getLastDayFromSlots(slots) {
  return sortSlotsByDate([...slots]).pop().start
}

export function sortSlotsByDate(slots) {
  return slots.sort((a, b) => sortDateAsc(a.start, b.start))
}
