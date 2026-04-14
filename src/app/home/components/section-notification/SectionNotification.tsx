import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import houseIcon from './assets/house_icon.svg'
import warningIcon from './assets/warning_icon.svg'
import { useNotificationState } from './useNotificationState'
import classNames from 'classnames'

import { Loader } from '@mercadona/mo.library.shop-ui/loader'

import { HomeSectionNotificationContent } from 'app/home/interfaces'
import { useId } from 'hooks/useId'
import { Tracker } from 'services/tracker'
import { TAB_INDEX } from 'utils/constants'

import './SectionNotification.css'

const NOTIFICATION_PROPERTIES: Record<
  HomeSectionNotificationContent['type'],
  { ALT: string; ICON: string } | undefined
> = {
  warning: {
    ALT: 'alt_warning_image',
    ICON: warningIcon,
  },
  info: {
    ALT: '',
    ICON: houseIcon,
  },
}

interface SectionNotificationProps {
  notification: HomeSectionNotificationContent
}

export const SectionNotification = ({
  notification,
}: SectionNotificationProps) => {
  const { t } = useTranslation()
  const id = useId()

  const { state, isLoading } = useNotificationState(notification)

  const notificationImage = NOTIFICATION_PROPERTIES[state.type]

  useEffect(() => {
    if (state.eventKey) {
      Tracker.sendInteraction(state.eventKey, {
        message: state.title,
      })
    }
  }, [state.eventKey, state.title])

  const handleClick = () => {
    Tracker.sendInteraction(`${state.eventKey}_click`, {
      message: state.title,
    })
  }

  const getNotificationClassNames = () => {
    return classNames('home-section-notification', {
      'home-section-notification--warning': state.type === 'warning',
      'home-section-notification--info': state.type === 'info',
    })
  }

  if (isLoading) {
    return (
      <div
        role="marquee"
        tabIndex={TAB_INDEX.ENABLED}
        aria-label={t('aria_loading')}
        className={getNotificationClassNames()}
        aria-live="polite"
        aria-busy={true}
      >
        <div className="home-section-notification__icon">
          <img
            src={notificationImage?.ICON}
            alt={notificationImage?.ALT ? t(notificationImage.ALT) : ''}
          />
        </div>
        <Loader />
      </div>
    )
  }

  return (
    <div
      role="marquee"
      aria-labelledby={`${id}-title`}
      aria-label={state.title}
      className={getNotificationClassNames()}
      onClick={handleClick}
      tabIndex={TAB_INDEX.ENABLED}
    >
      <div className="home-section-notification__icon">
        <img
          src={notificationImage?.ICON}
          alt={notificationImage?.ALT ? t(notificationImage.ALT) : ''}
        />
      </div>
      <p
        aria-hidden={true}
        id={`${id}-title`}
        className="home-section-notification__title subhead1-sb"
      >
        {state.title}
      </p>
    </div>
  )
}
