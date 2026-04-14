import { PureComponent } from 'react'

import { getDiffDays, getToday } from '../../utils/dates'
import { clampValues } from '../../utils/maths'
import { SlotsCalendarDay } from '../slots-calendar-day'
import i18next from 'i18next'

import { Icon } from '@mercadona/mo.library.shop-ui/icon'

import { FocusedElementWithInitialFocus } from 'app/accessibility'
import { TAB_INDEX } from 'utils/constants'

import './assets/SlotsCalendar.css'

export const CALENDAR_STYLE = {
  DAY_WIDTH: 56,
  DAYS_PER_ROW: 5,
  INITIAL_PAGE: 1,
} as const

interface SlotsCalendarProps {
  postalCode: string
  days: Array<{ day: string; activeSlots: boolean }>
  selectedDay?: string
  onClick: (day: string) => void
}

interface SlotsCalendarState {
  pageIndex: number
  daysMargin: number
}

export class SlotsCalendar extends PureComponent<
  SlotsCalendarProps,
  SlotsCalendarState
> {
  private resizeRafTimer: number | null = null
  private maxPages: number | null = null
  private slotDayReference: Element | null = null

  constructor(props: SlotsCalendarProps) {
    super(props)

    this.state = {
      pageIndex: CALENDAR_STYLE.INITIAL_PAGE,
      daysMargin: 0,
    }

    this.moveForward = this.moveForward.bind(this)
    this.moveBackward = this.moveBackward.bind(this)
    this.setDayReference = this.setDayReference.bind(this)
    this.handleResize = this.handleResize.bind(this)
    this.setMarginBetweenDays = this.setMarginBetweenDays.bind(this)
  }

  componentDidMount() {
    this.setMaxPages()
    this.setPageActive()
    this.handleResize()
    window.addEventListener('resize', this.handleResize)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize)
    if (this.resizeRafTimer) {
      cancelAnimationFrame(this.resizeRafTimer)
    }
  }

  handleResize() {
    if (this.resizeRafTimer) {
      cancelAnimationFrame(this.resizeRafTimer)
    }
    this.resizeRafTimer = requestAnimationFrame(this.setMarginBetweenDays)
  }

  setMarginBetweenDays() {
    if (!this.slotDayReference) {
      return
    }
    const style = window.getComputedStyle(this.slotDayReference)
    const { marginRight } = style

    this.setState({ daysMargin: parseFloat(marginRight) })
  }

  setMaxPages() {
    const days = this.props.days.length
    this.maxPages = days / CALENDAR_STYLE.DAYS_PER_ROW
  }

  moveForward() {
    if (this.maxPages === null) return

    if (this.state.pageIndex < this.maxPages) {
      this.setState({ pageIndex: this.state.pageIndex + 1 })
    }
  }

  moveBackward() {
    this.setState({ pageIndex: this.state.pageIndex - 1 })
  }

  setPageActive() {
    const { selectedDay } = this.props
    const { DAYS_PER_ROW, INITIAL_PAGE } = CALENDAR_STYLE

    const today = getToday()

    const diffDays = getDiffDays(today, selectedDay)
    const dayPage = Math.ceil(diffDays / DAYS_PER_ROW)

    const page = clampValues(dayPage, INITIAL_PAGE, this.maxPages)

    this.setState({ pageIndex: page })
  }

  calculatePosition() {
    const PERCENTAGE_PER_PAGE = 100 / this.getPageCount()

    return (this.state.pageIndex - 1) * PERCENTAGE_PER_PAGE
  }

  getPageCount() {
    const TOTAL_DAYS = this.props.days.length - 1
    const { DAYS_PER_ROW } = CALENDAR_STYLE

    return Math.ceil(TOTAL_DAYS / DAYS_PER_ROW)
  }

  getHorizontalPosition() {
    return { transform: `translateX(-${this.calculatePosition()}%)` }
  }

  renderBackArrow() {
    return (
      <button
        onClick={this.moveBackward}
        className="slots-calendar__left-arrow"
        tabIndex={TAB_INDEX.DISABLED}
        aria-hidden="true"
      >
        <Icon icon="back-28" />
        <span className="caption2-sb">
          {i18next.t('commons.order.order_delivery.slots_calendar.prev_days')}
        </span>
      </button>
    )
  }

  renderForwardArrow() {
    return (
      <button
        onClick={this.moveForward}
        className="slots-calendar__right-arrow"
        tabIndex={TAB_INDEX.DISABLED}
        aria-hidden="true"
        disabled={this.state.pageIndex > 1}
      >
        <Icon icon="forward-28" />
        <span className="caption2-sb">
          {i18next.t('commons.order.order_delivery.slots_calendar.more_days')}
        </span>
      </button>
    )
  }

  setDayReference(node: HTMLElement | null) {
    if (this.slotDayReference) {
      return
    }
    this.slotDayReference = node
  }

  render() {
    const { days, selectedDay, postalCode, onClick } = this.props

    return (
      <FocusedElementWithInitialFocus>
        <section
          className="slots-calendar"
          aria-labelledby="slots-calendar-title"
          aria-describedby="slots-calendar-description"
          tabIndex={TAB_INDEX.ENABLED}
        >
          <div
            id="slots-calendar-title"
            className="slots-calendar__title headline1-b"
          >
            {`${i18next.t(
              'commons.order.order_delivery.slots_calendar.avaliable_days',
            )} ${postalCode}`}
          </div>
          <div
            id="slots-calendar-description"
            className="slots-calendar__description subhead1-r"
          >
            {i18next.t('day_selection_help_hint')}
          </div>
          <div className="slots-calendar__content">
            {this.state.pageIndex === 1 ? null : this.renderBackArrow()}

            <div className="slots-calendar__days-wrapper">
              <div
                style={this.getHorizontalPosition()}
                role="group"
                aria-orientation="horizontal"
                className="slots-calendar__days"
                aria-labelledby="slots-calendar-description"
              >
                {days.map(({ day, activeSlots }) => (
                  <SlotsCalendarDay
                    key={day}
                    innerRef={this.setDayReference}
                    day={day}
                    onClick={() => onClick(day)}
                    disabled={!activeSlots}
                    isSelected={day === selectedDay}
                  />
                ))}
              </div>
            </div>

            {this.renderForwardArrow()}
          </div>
        </section>
      </FocusedElementWithInitialFocus>
    )
  }
}
