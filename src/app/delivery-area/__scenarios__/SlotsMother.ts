import { SlotResponse } from 'app/shared/slot/interfaces/Slot'

type SlotsResult = {
  count: number
  next: null
  previous: null
  results: SlotResponse[]
}

function getFutureDateStr(dayOffset: number): string {
  const date = new Date()
  date.setDate(date.getDate() + dayOffset)
  return date.toISOString().split('T')[0]
}

function getMadridOffset(dateStr: string): number {
  const noonUTC = new Date(`${dateStr}T12:00:00Z`)
  const madridHour = parseInt(
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'Europe/Madrid',
      hour: 'numeric',
      hour12: false,
    }).format(noonUTC),
    10,
  )
  return madridHour - 12
}

const buildSlot = (dayOffset: number, hour: number): SlotResponse => {
  const dateStr = getFutureDateStr(dayOffset)
  const hourStr = String(hour).padStart(2, '0')
  const nextHourStr = String(hour + 1).padStart(2, '0')

  return {
    id: `${dayOffset}${hour}`,
    start: `${dateStr}T${hourStr}:00:00Z`,
    end: `${dateStr}T${nextHourStr}:00:00Z`,
    price: '6.00',
    available: true,
    open: true,
    timezone: 'Europe/Madrid',
    cutoff_time: `${dateStr}T09:00:00Z`,
  }
}

const buildHoneycombSlot = (
  dayOffset: number,
  madridHour: number,
  duration: number,
): SlotResponse => {
  const dateStr = getFutureDateStr(dayOffset)
  const utcHour = madridHour - getMadridOffset(dateStr)
  const utcHourStr = String(utcHour).padStart(2, '0')
  const utcEndHourStr = String(utcHour + duration).padStart(2, '0')

  return {
    id: `${dayOffset}${madridHour}`,
    start: `${dateStr}T${utcHourStr}:00:00Z`,
    end: `${dateStr}T${utcEndHourStr}:00:00Z`,
    price: '6.00',
    available: true,
    open: true,
    timezone: 'Europe/Madrid',
    cutoff_time: `${dateStr}T09:00:00Z`,
  }
}

export const SlotsMother = {
  withAvailableSlots(): SlotsResult {
    return {
      count: 10,
      next: null,
      previous: null,
      results: [
        buildSlot(1, 7),
        buildSlot(1, 8),
        buildSlot(1, 9),
        buildSlot(1, 10),
        buildSlot(1, 11),
        buildSlot(1, 12),
        buildSlot(1, 13),
        buildSlot(1, 14),
        buildSlot(1, 15),
        buildSlot(1, 16),
      ],
    }
  },

  withHoneycombSlots(): SlotsResult {
    return {
      count: 8,
      next: null,
      previous: null,
      results: [
        buildHoneycombSlot(1, 11, 2),
        buildHoneycombSlot(1, 13, 2),
        buildHoneycombSlot(1, 15, 2),
        buildHoneycombSlot(1, 17, 1),
        buildHoneycombSlot(2, 11, 2),
        buildHoneycombSlot(2, 13, 2),
        buildHoneycombSlot(2, 15, 2),
        buildHoneycombSlot(2, 17, 2),
      ],
    }
  },

  withClosedHoneycombSlots(): SlotsResult {
    return {
      count: 8,
      next: null,
      previous: null,
      results: [
        { ...buildHoneycombSlot(1, 11, 2), open: false },
        buildHoneycombSlot(1, 13, 2),
        buildHoneycombSlot(1, 15, 2),
        buildHoneycombSlot(1, 17, 2),
        buildHoneycombSlot(2, 11, 2),
        buildHoneycombSlot(2, 13, 2),
        buildHoneycombSlot(2, 15, 2),
        buildHoneycombSlot(2, 17, 2),
      ],
    }
  },

  withCompletedHoneycombSlots(): SlotsResult {
    return {
      count: 8,
      next: null,
      previous: null,
      results: [
        { ...buildHoneycombSlot(1, 11, 2), available: false },
        buildHoneycombSlot(1, 13, 2),
        buildHoneycombSlot(1, 15, 2),
        buildHoneycombSlot(1, 17, 2),
        buildHoneycombSlot(2, 11, 2),
        buildHoneycombSlot(2, 13, 2),
        buildHoneycombSlot(2, 15, 2),
        buildHoneycombSlot(2, 17, 2),
      ],
    }
  },
}
