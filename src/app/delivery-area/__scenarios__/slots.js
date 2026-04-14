import MockDate from 'mockdate'
import moment from 'moment'

function generateSlot({ gap, hour, duration }) {
  return {
    id: `${gap}${hour}`,
    start: `${moment().add(gap, 'd').format('YYYY-MM-DD')}T${hour}:00:00Z`,
    end: `${moment().add(gap, 'd').format('YYYY-MM-DD')}T${
      hour + duration
    }:00:00Z`,
    price: '6.00',
    available: true,
    open: true,
  }
}

function generateSlots({ days, hours, duration }) {
  const slots = Array.from({ length: days }).map((_, dayIndex) => {
    const day = dayIndex + 1
    const startHour = 10
    const slotsQuantity = hours / duration

    return Array.from({ length: slotsQuantity }).map((_, hourIndex) => {
      const hour = startHour + hourIndex * duration
      return generateSlot({ gap: day, hour, duration: duration })
    })
  })

  return slots.flatMap((x) => x)
}

export const slots = {
  count: 30,
  next: null,
  previous: null,
  results: generateSlots({ days: 2, hours: 15, duration: 1 }),
}

const staticSlots = {
  results: [
    {
      id: '1',
      start: '2021-01-02T10:00:00Z', // Saturday
      end: '2021-01-02T11:00:00Z',
      price: '6.00',
      available: true,
      open: true,
      cutoff_time: '2021-01-01T18:59:00Z', // TODO: Should update other slots to reflect this change
    },
    {
      id: '2',
      start: '2021-01-02T11:00:00Z',
      end: '2021-01-02T12:00:00Z',
      price: '6.00',
      available: true,
      open: true,
    },
    {
      id: '3',
      start: '2021-01-02T12:00:00Z',
      end: '2021-01-02T13:00:00Z',
      price: '6.00',
      available: true,
      open: true,
    },
    {
      id: '4',
      start: '2021-01-02T13:00:00Z',
      end: '2021-01-02T14:00:00Z',
      price: '6.00',
      available: true,
      open: true,
    },
    {
      id: '5',
      start: '2021-01-02T14:00:00Z',
      end: '2021-01-02T15:00:00Z',
      price: '6.00',
      available: true,
      open: true,
    },
    {
      id: '6',
      start: '2021-01-02T15:00:00Z',
      end: '2021-01-02T16:00:00Z',
      price: '6.00',
      available: true,
      open: true,
    },
    {
      id: '7',
      start: '2021-01-02T16:00:00Z',
      end: '2021-01-02T17:00:00Z',
      price: '6.00',
      available: true,
      open: true,
    },
    {
      id: '8',
      start: '2021-01-02T17:00:00Z',
      end: '2021-01-02T18:00:00Z',
      price: '6.00',
      available: true,
      open: true,
    },
    {
      id: '9',
      start: '2021-01-02T18:00:00Z',
      end: '2021-01-02T19:00:00Z',
      price: '6.00',
      available: true,
      open: true,
    },
    {
      id: '10',
      start: '2021-01-02T19:00:00Z',
      end: '2021-01-02T20:00:00Z',
      price: '6.00',
      available: true,
      open: true,
    },
    {
      id: '11',
      start: '2021-01-03T10:00:00Z', // Sunday
      end: '2021-01-03T11:00:00Z',
      price: '6.00',
      available: true,
      open: true,
    },
    {
      id: '12',
      start: '2021-01-03T11:00:00Z',
      end: '2021-01-03T12:00:00Z',
      price: '6.00',
      available: true,
      open: true,
    },
    {
      id: '13',
      start: '2021-01-03T12:00:00Z',
      end: '2021-01-03T13:00:00Z',
      price: '6.00',
      available: true,
      open: true,
    },
    {
      id: '14',
      start: '2021-01-03T13:00:00Z',
      end: '2021-01-03T14:00:00Z',
      price: '6.00',
      available: true,
      open: true,
    },
    {
      id: '15',
      start: '2021-01-03T14:00:00Z',
      end: '2021-01-03T15:00:00Z',
      price: '6.00',
      available: true,
      open: true,
    },
    {
      id: '16',
      start: '2021-01-03T15:00:00Z',
      end: '2021-01-03T16:00:00Z',
      price: '6.00',
      available: true,
      open: true,
    },
    {
      id: '17',
      start: '2021-01-03T16:00:00Z',
      end: '2021-01-03T17:00:00Z',
      price: '6.00',
      available: true,
      open: true,
    },
    {
      id: '18',
      start: '2021-01-03T17:00:00Z',
      end: '2021-01-03T18:00:00Z',
      price: '6.00',
      available: true,
      open: true,
    },
    {
      id: '19',
      start: '2021-01-03T18:00:00Z',
      end: '2021-01-03T19:00:00Z',
      price: '6.00',
      available: true,
      open: true,
    },
    {
      id: '20',
      start: '2021-01-03T19:00:00Z',
      end: '2021-01-03T20:00:00Z',
      price: '6.00',
      available: true,
      open: true,
    },
  ],
}

export const slotsAvailableOnlyTomorrow = {
  results: [
    {
      id: '1',
      start: '2021-01-02T10:00:00Z', // Saturday
      end: '2021-01-02T11:00:00Z',
      price: '6.00',
      available: true,
      open: true,
    },
    {
      id: '2',
      start: '2021-01-02T11:00:00Z',
      end: '2021-01-02T12:00:00Z',
      price: '6.00',
      available: true,
      open: true,
    },
    {
      id: '3',
      start: '2021-01-02T12:00:00Z',
      end: '2021-01-02T13:00:00Z',
      price: '6.00',
      available: true,
      open: true,
    },
    {
      id: '4',
      start: '2021-01-02T13:00:00Z',
      end: '2021-01-02T14:00:00Z',
      price: '6.00',
      available: true,
      open: true,
    },
    {
      id: '5',
      start: '2021-01-02T14:00:00Z',
      end: '2021-01-02T15:00:00Z',
      price: '6.00',
      available: true,
      open: true,
    },
    {
      id: '6',
      start: '2021-01-02T15:00:00Z',
      end: '2021-01-02T16:00:00Z',
      price: '6.00',
      available: true,
      open: true,
    },
    {
      id: '7',
      start: '2021-01-02T16:00:00Z',
      end: '2021-01-02T17:00:00Z',
      price: '6.00',
      available: true,
      open: true,
    },
    {
      id: '8',
      start: '2021-01-02T17:00:00Z',
      end: '2021-01-02T18:00:00Z',
      price: '6.00',
      available: true,
      open: true,
    },
    {
      id: '9',
      start: '2021-01-02T18:00:00Z',
      end: '2021-01-02T19:00:00Z',
      price: '6.00',
      available: true,
      open: true,
    },
    {
      id: '10',
      start: '2021-01-02T19:00:00Z',
      end: '2021-01-02T20:00:00Z',
      price: '6.00',
      available: true,
      open: true,
    },
  ],
}

export const slotsMockDate = new Date(2021, 0, 1, 10) // UTC+1, Friday 2021-01-01T09:00:00Z

export function mockDate() {
  MockDate.set(slotsMockDate)
  return {
    slots: staticSlots,
    resetMockDate: MockDate.reset,
  }
}

export const slotsAllAvailableTomorrow = staticSlots

export const slotsSomeAvailableDayAfterTomorrow = {
  results: [
    {
      id: '1',
      start: '2021-01-02T10:00:00Z', // Saturday
      end: '2021-01-02T11:00:00Z',
      price: '6.00',
      available: false,
      open: false,
    },
    {
      id: '2',
      start: '2021-01-02T11:00:00Z',
      end: '2021-01-02T12:00:00Z',
      price: '6.00',
      available: false,
      open: false,
    },
    {
      id: '3',
      start: '2021-01-02T12:00:00Z',
      end: '2021-01-02T13:00:00Z',
      price: '6.00',
      available: false,
      open: false,
    },
    // Sunday
    {
      id: '11',
      start: '2021-01-04T10:00:00Z', // Monday
      end: '2021-01-04T11:00:00Z',
      price: '6.00',
      available: true,
      open: true,
    },
    {
      id: '12',
      start: '2021-01-04T11:00:00Z',
      end: '2021-01-04T12:00:00Z',
      price: '6.00',
      available: true,
      open: true,
    },
    {
      id: '13',
      start: '2021-01-04T12:00:00Z',
      end: '2021-01-04T13:00:00Z',
      price: '6.00',
      available: false,
      open: false,
    },
  ],
}

export const slotsNoneAvailable = {
  results: [
    {
      id: '1',
      start: '2021-01-02T10:00:00Z', // Saturday
      end: '2021-01-02T11:00:00Z',
      price: '6.00',
      available: false,
      open: false,
    },
    {
      id: '2',
      start: '2021-01-02T11:00:00Z',
      end: '2021-01-02T12:00:00Z',
      price: '6.00',
      available: false,
      open: false,
    },
    {
      id: '3',
      start: '2021-01-02T12:00:00Z',
      end: '2021-01-02T13:00:00Z',
      price: '6.00',
      available: false,
      open: false,
    },
    {
      id: '11',
      start: '2021-01-03T10:00:00Z', // Sunday
      end: '2021-01-03T11:00:00Z',
      price: '6.00',
      available: false,
      open: false,
    },
    {
      id: '12',
      start: '2021-01-03T11:00:00Z',
      end: '2021-01-03T12:00:00Z',
      price: '6.00',
      available: false,
      open: false,
    },
    {
      id: '13',
      start: '2021-01-03T12:00:00Z',
      end: '2021-01-03T13:00:00Z',
      price: '6.00',
      available: false,
      open: false,
    },
  ],
}
