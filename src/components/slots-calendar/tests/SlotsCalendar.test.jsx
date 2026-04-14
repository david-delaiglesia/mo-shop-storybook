import { CALENDAR_STYLE, SlotsCalendar } from '../SlotsCalendar'
import moment from 'moment'
import { vi } from 'vitest'

const today = new Date().toISOString().slice(0, 10)
const tomorrow = moment().add(1, 'days').format('YYYY-MM-DD')

const baseProps = {
  onClick: vi.fn(),
  selectedDay: tomorrow,
  days: [
    { day: today, activeSlots: false },
    { day: tomorrow, activeSlots: true },
    { day: moment().add(2, 'days').format('YYYY-MM-DD'), activeSlots: true },
    { day: moment().add(3, 'days').format('YYYY-MM-DD'), activeSlots: true },
    { day: moment().add(4, 'days').format('YYYY-MM-DD'), activeSlots: true },
  ],
  postalCode: '46010',
}

const wrapSetState = (instance) => {
  instance.setState = (update) => {
    const newState =
      typeof update === 'function'
        ? update(instance.state, instance.props)
        : update
    instance.state = { ...instance.state, ...newState }
  }
}

const createInstance = (overrideProps = {}) => {
  const props = {
    ...baseProps,
    ...overrideProps,
  }
  const instance = new SlotsCalendar(props)
  wrapSetState(instance)
  return { instance }
}

describe('<SlotsCalendar />', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render correctly', () => {
    const { instance } = createInstance()
    expect(instance.render()).toBeDefined()
  })

  it('moveForward method should increase pageIndex if IS NOT last Page', () => {
    const { instance } = createInstance()
    instance.maxPages = 4
    instance.state.pageIndex = 1

    instance.moveForward()

    expect(instance.state.pageIndex).toBe(2)
  })

  it('moveForward method should NOT increase pageIndex if IS last Page', () => {
    const { instance } = createInstance()
    instance.maxPages = 1
    instance.state.pageIndex = 1

    instance.moveForward()

    expect(instance.state.pageIndex).toBe(1)
  })

  it('moveBackward method should decrease pageIndex', () => {
    const { instance } = createInstance()
    instance.state.pageIndex = 2

    instance.moveBackward()

    expect(instance.state.pageIndex).toBe(1)
  })

  describe('setPageActive method', () => {
    it('setPageActive return correct page', () => {
      const selectedDay = moment().add(9, 'days').format('YYYY-MM-DD')
      const { instance } = createInstance({ selectedDay })
      const expectedPage = 2
      instance.maxPages = 3

      instance.setPageActive()

      expect(instance.state.pageIndex).toBe(expectedPage)
    })

    it('setPageActive return min page', () => {
      const selectedDay = moment().subtract(1, 'days').format('YYYY-MM-DD')
      const { instance } = createInstance({ selectedDay })
      instance.maxPages = 3

      instance.setPageActive()

      expect(instance.state.pageIndex).toBe(CALENDAR_STYLE.INITIAL_PAGE)
    })

    it('setPageActive return max page', () => {
      const selectedDay = moment().add(999, 'days').format('YYYY-MM-DD')
      const { instance } = createInstance({ selectedDay })
      const expectedPage = 3
      instance.maxPages = expectedPage

      instance.setPageActive()

      expect(instance.state.pageIndex).toBe(expectedPage)
    })
  })

  describe('setMarginBetweenDays method', () => {
    it('should not change state if slotDayReference is null', () => {
      const { instance } = createInstance()
      instance.slotDayReference = null
      const spy = vi.spyOn(instance, 'setState')

      instance.setMarginBetweenDays()

      expect(spy).not.toHaveBeenCalled()
    })

    it('should change daysMargin state if slotDayReference is NOT null', () => {
      const { instance } = createInstance()
      const marginRight = 50
      instance.slotDayReference = {}
      window.getComputedStyle = vi.fn().mockImplementation(() => ({
        marginRight,
      }))

      instance.setMarginBetweenDays()

      expect(instance.state.daysMargin).toBe(marginRight)
    })
  })

  describe('componentWillUnmount method', () => {
    it('should remove resize event listener', () => {
      const { instance } = createInstance()
      const method = instance.handleResize
      const spy = vi.spyOn(window, 'removeEventListener')

      instance.componentWillUnmount()

      expect(spy).toHaveBeenCalledWith('resize', method)
    })
  })

  describe('setDayReference method', () => {
    it('should set slotDayReference reference', () => {
      const { instance } = createInstance()
      const mockReference = <div></div>
      instance.slotDayReference = null

      instance.setDayReference(mockReference)

      expect(instance.slotDayReference).toBe(mockReference)
    })

    it('should not set slotDayReference reference if is already defined', () => {
      const { instance } = createInstance()
      const mockReference = <p></p>
      instance.slotDayReference = {}

      instance.setDayReference(mockReference)

      expect(instance.slotDayReference).not.toBe(mockReference)
    })
  })
})
