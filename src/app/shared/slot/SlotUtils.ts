import { Slot } from './interfaces'
import moment from 'moment'

import { getLongDayName, getMonthName, getNumberDay } from 'utils/dates'
import { DateTime } from 'utils/slots'

export const SlotUtils = {
  isAvailable(slot: Pick<Slot, 'open' | 'available'>): boolean {
    return !!slot.open && slot.available
  },

  isWorkingDay(slots: Pick<Slot, 'open'>[]): boolean {
    return slots.some((slot) => slot.open)
  },

  hasAvailableByDay(
    slotsByDay: { slots: Pick<Slot, 'open' | 'available'>[] }[],
  ): boolean {
    return slotsByDay.some((day) => day.slots.some(this.isAvailable))
  },

  isHoneycomb(slotList: unknown[]): boolean {
    return slotList.length < 10
  },

  getDuration(slot: Pick<Slot, 'start' | 'end'>): number {
    const duration = moment.duration(moment(slot.end).diff(moment(slot.start)))
    return duration.asHours()
  },

  getDateInfo({
    slot,
    timezone,
  }: {
    slot: Pick<Slot, 'start' | 'end'>
    timezone: string
  }) {
    const { start, end } = slot

    return {
      weekDay: getLongDayName(start),
      monthDay: getNumberDay(start),
      monthName: getMonthName(start),
      startTime: DateTime.getFormattedTime(start, timezone),
      endTime: DateTime.getFormattedTime(end, timezone),
    }
  },

  getFirstDayWithAvailableSlots(
    days: Array<{
      day: string
      activeSlots: boolean
      slots: Slot[]
    }>,
  ):
    | {
        day: string
        activeSlots: boolean
        slots: Slot[]
      }
    | undefined {
    return days.find((day) => day.activeSlots)
  },
}
