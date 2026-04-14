import * as dateUtils from '../../dates'
import {
  INCLUSIVE_DIFFERENCE_OFFSET,
  getAvailableSlotsFromDay,
  getDefaultDay,
  getInclusiveDiffDays,
  getLastDayFromSlots,
  sortSlotsByDate,
} from '../slots'
import { expectedGetAvailableSlotsFromDay, mockedSlots } from './mocks'

describe('slots test', () => {
  describe('getAvailableSlotsFromDay method', () => {
    it('should return available slots with activeSlots if date have slots and is a working day', () => {
      const [{ start: mockFirstDay }] = mockedSlots

      const result = getAvailableSlotsFromDay(mockFirstDay, mockedSlots, 0)

      expect(result).toEqual(expectedGetAvailableSlotsFromDay)
    })

    it('should return available slots without activeSlots if date not have slots', () => {
      const expectedSlotsFromDay = {
        activeSlots: false,
        day: '2018-02-10',
        slots: [],
      }
      const mockFirstDay = '2018-02-10T07:00:00Z'

      const result = getAvailableSlotsFromDay(mockFirstDay, mockedSlots, 0)

      expect(result).toEqual(expectedSlotsFromDay)
    })
  })

  it('should getLastDayFromSlots return last slot from slots', () => {
    const lastPosition = mockedSlots.length - 1
    const lastSlot = mockedSlots[lastPosition]

    const result = getLastDayFromSlots(mockedSlots)

    expect(result).toEqual(lastSlot.start)
  })

  it('should sortSlotsByDate sort slots', () => {
    const unsortedSlots = [mockedSlots[1], mockedSlots[0]]
    const sortedSlots = [mockedSlots[0], mockedSlots[1]]

    const result = sortSlotsByDate(unsortedSlots)

    expect(result).toEqual(sortedSlots)
  })

  describe('getInclusiveDiffDays method', () => {
    it('should return INCLUSIVE_DIFFERENCE_OFFSET if diffDays is less than INCLUSIVE_DIFFERENCE_OFFSET', () => {
      const result = getInclusiveDiffDays()
      expect(result).toBe(INCLUSIVE_DIFFERENCE_OFFSET)
    })

    it('should return diffDays plus INCLUSIVE_DIFFERENCE_OFFSET if diffdays is more than INCLUSIVE_DIFFERENCE_OFFSET', () => {
      const result = getInclusiveDiffDays('2000-01-01', '2000-01-03')

      expect(result).toBe(3)
    })
  })

  describe('getDefaultDay method', () => {
    it('return first slot if dont match defaultDay by no have available slot', () => {
      const mockedNotAvailableSlots = [
        { ...mockedSlots[0], available: false },
        { ...mockedSlots[1], available: false },
      ]
      const expectedResult = dateUtils.getDay(mockedNotAvailableSlots[0].start)

      const result = getDefaultDay(mockedNotAvailableSlots)

      expect(result).toBe(expectedResult)
    })

    it('return first slot if it does not match with defaultDay by no have valid date', () => {
      const getTodayResponse = '2018-01-01'
      vi.spyOn(dateUtils, 'getToday').mockReturnValueOnce(getTodayResponse)

      const mockedNotAvailableSlots = [
        { ...mockedSlots[0] },
        { ...mockedSlots[1] },
      ]
      const expectedResult = dateUtils.getDay(mockedNotAvailableSlots[0].start)

      const result = getDefaultDay(mockedNotAvailableSlots)

      expect(result).toBe(expectedResult)
    })

    it('return first slot available if have valid date', () => {
      const getTodayResponse = '2018-12-01'
      vi.spyOn(dateUtils, 'getToday').mockReturnValueOnce(getTodayResponse)

      const mockedNotAvailableSlots = [
        { ...mockedSlots[0] },
        { ...mockedSlots[1] },
      ]
      const expectedResult = dateUtils.getDay(mockedSlots[0].start)

      const result = getDefaultDay(mockedNotAvailableSlots)

      expect(result).toBe(expectedResult)
    })
  })
})
