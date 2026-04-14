import moment from 'moment'

function generateSlot(gap, hour) {
  return {
    id: `${gap}`,
    start: `${moment().add(gap, 'd').format('YYYY-MM-DD')}T${hour}:00:00Z`,
    end: `${moment().add(gap, 'd').format('YYYY-MM-DD')}T${hour}:00:00Z`,
    price: '6.00',
    available: true,
    open: true,
  }
}

function generateSlots(days, hours) {
  let slots = []

  const startHour = 10
  for (let gap = 1; gap < days; gap += 1) {
    for (let hour = startHour; hour < startHour + hours; hour += 1) {
      const slot = generateSlot(gap, hour)
      slots.push(slot)
    }
  }

  return slots
}

function generateSlotsWithOffset(offset, days, hours) {
  let slots = []

  const startHour = 10
  for (let gap = offset; gap < days + offset; gap += 1) {
    for (let hour = startHour; hour < startHour + hours; hour += 1) {
      const slot = generateSlot(gap, hour)
      slots.push(slot)
    }
  }

  return slots
}

function generateSlotsForNextWeek() {
  const days = 7
  const hours = 12
  let [first, second, ...rest] = generateSlots(days, hours)

  first.available = false
  first.open = true

  return [first, second, ...rest]
}

function generateSlotsForTwoWeeks() {
  const days = 14
  const hours = 12
  let [first, ...rest] = generateSlots(days, hours)

  first.available = false
  first.open = true

  return [first, ...rest]
}

function generateSlotsWithTwoPerDay() {
  const days = 3
  const hours = 2
  let [first, second, ...rest] = generateSlots(days, hours)

  first.available = false
  first.open = true

  second.available = false
  second.open = false

  return [first, second, ...rest]
}

function generateSlotsWithHolidays() {
  const days = 3
  const hours = 2
  const [, , ...slots] = generateSlots(days, hours)

  return slots
}

function generateNotAvailableSlots() {
  const days = 3
  const hours = 2
  const [first, second] = generateSlots(days, hours)
  first.available = false
  first.open = true
  second.available = false
  second.open = true

  return [first, second]
}

function generateSlotsForFurtherWeek() {
  const days = 7
  const hours = 2
  const offset = 7
  const [first, second, ...rest] = generateSlotsWithOffset(offset, days, hours)
  first.available = false
  first.open = true

  return [first, second, ...rest]
}

function generateSlotsWithTodayAvailable() {
  const days = 3
  const hours = 2
  const offset = 0

  return generateSlotsWithOffset(offset, days, hours)
}

export const generateBankHoliday = (slots) => ({
  ...generateSlotsForNextWeek(),
  results: slots.results.map((slot) => {
    const holidayDay = moment().add(1, 'd').format('YYYY-MM-DD')

    if (slot.start.includes(holidayDay)) {
      return { ...slot, open: false }
    }

    return { ...slot }
  }),
})

export const slotsMockForTwoWeeks = {
  count: 105,
  next: null,
  previous: null,
  results: generateSlotsForTwoWeeks(),
}

export const slotsMock = {
  count: 105,
  next: null,
  previous: null,
  results: generateSlotsForNextWeek(),
}

export const slotsUnavailableTomorrowMock = {
  count: 105,
  next: null,
  previous: null,
  results: generateSlotsWithTwoPerDay(),
}

export const slotsHolidaysTomorrowMock = {
  count: 105,
  next: null,
  previous: null,
  results: generateSlotsWithHolidays(),
}

export const emptySlots = {
  count: 105,
  next: null,
  previous: null,
  results: [],
}

export const notAvailableSlots = {
  count: 105,
  next: null,
  previous: null,
  results: generateNotAvailableSlots(),
}

export const slotForFurtherWeek = {
  count: 105,
  next: null,
  previous: null,
  results: generateSlotsForFurtherWeek(),
}

export const slotsWithTodayAvailable = {
  count: 105,
  next: null,
  previous: null,
  results: generateSlotsWithTodayAvailable(),
}

export default {
  count: 105,
  next: null,
  previous: null,
  results: generateSlotsForNextWeek(),
}
