import { useTranslation } from 'react-i18next'

import classNames from 'classnames'
import PropTypes from 'prop-types'

import { Order } from 'domain/order'
import { useCountdown } from 'hooks/useCountdown'
import { getNumberDay, getStringMonthDay } from 'utils/dates'
import { DateTime } from 'utils/slots'

import './Countdown.css'

const Countdown = ({ cutoffTime, hideCutoffText = false, title, timezone }) => {
  const { t } = useTranslation()

  const { hours, minutes, seconds } = useCountdown(cutoffTime)

  const lessThanAnHourLeft = hours < 1
  const timePlusOneMinute = DateTime.getTimePlusOneMinute(cutoffTime, timezone)

  const ongoingDate = {
    time: timePlusOneMinute,
    day: getNumberDay(cutoffTime),
    month: getStringMonthDay(cutoffTime),
  }

  const renderCutoffText = (cutoffTime) => {
    if (hideCutoffText) {
      return null
    }

    return Order.isMorningCutoff(cutoffTime) ? (
      <span className="countdown__subtitle footnote1-r">
        {t(
          'user_area.order_detail.status_msg.on_going_content_morning',
          ongoingDate,
        )}{' '}
      </span>
    ) : (
      <span className="countdown__subtitle footnote1-r">
        {t(
          'user_area.order_detail.status_msg.on_going_content_new_2',
          ongoingDate,
        )}{' '}
      </span>
    )
  }

  return (
    <div>
      <span className="subhead1-r">{title}</span>
      <div
        className={classNames('countdown__counter', {
          'countdown__counter--last-hour': lessThanAnHourLeft,
        })}
        role="timer"
      >
        <div className="countdown__indicator">
          <span className="countdown__indicator--title title2-r">{hours}</span>
          <span className="footnote1-sb countdown__indicator--subtitle">
            {t('countdown_hours')}
          </span>
        </div>
        <div className="countdown__indicator">
          <span className="countdown__indicator--title title2-r">
            {minutes}
          </span>
          <span className="footnote1-sb countdown__indicator--subtitle">
            {t('countdown_minutes')}
          </span>
        </div>
        <div className="countdown__indicator">
          <span className="countdown__indicator--title title2-r">
            {seconds}
          </span>
          <span className="footnote1-sb countdown__indicator--subtitle">
            {t('countdown_seconds')}
          </span>
        </div>
      </div>
      {renderCutoffText(ongoingDate.time)}
    </div>
  )
}

Countdown.propTypes = {
  cutoffTime: PropTypes.string.isRequired,
  hideCutoffText: PropTypes.bool,
  title: PropTypes.node.isRequired,
  timezone: PropTypes.string.isRequired,
}

export { Countdown }
