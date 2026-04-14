import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import ambientIcon from './assets/ambient.svg'
import chilledIcon from './assets/chilled.svg'
import errorIndicator from './assets/error-indicator.svg'
import frozenIcon from './assets/frozen.svg'

import { Modal, ModalSize } from '@mercadona/mo.library.shop-ui/modal'

import { CartMetrics } from 'app/cart/CartMetrics'
import { TAB_INDEX } from 'utils/constants'

import './MaxSizeAreaExceededModal.css'

interface MaxSizeAreaExceededModalProps {
  areasExceeded: {
    ambient: boolean
    chilled: boolean
    frozen: boolean
  }
  onClose: () => void
}

export const MaxSizeAreaExceededModal = ({
  areasExceeded,
  onClose,
}: MaxSizeAreaExceededModalProps) => {
  const { t } = useTranslation()

  useEffect(() => {
    CartMetrics.orderSizeLimitAlertView(areasExceeded)
  }, [])

  return (
    <Modal
      size={ModalSize.SMALL}
      title={t('alerts.max_size_area_exceeded.title')}
      description={t('alerts.max_size_area_exceeded.subtitle')}
      primaryActionText={t('button.agreed')}
      onPrimaryAction={onClose}
      onClose={onClose}
    >
      <div className="max-size-area-exceeded-modal">
        <ul className="zones-list">
          <li
            className="zone-item"
            tabIndex={TAB_INDEX.ENABLED}
            aria-label={
              areasExceeded.ambient
                ? t('alerts.max_size_area_exceeded.ambient_exceeded')
                : t('alerts.max_size_area_exceeded.ambient_ok')
            }
          >
            <img className="zone-icon" src={ambientIcon} alt="" />
            <span
              className={`zone-name${areasExceeded.ambient ? ' zone-name--exceeded' : ''}`}
            >
              {t('alerts.max_size_area_exceeded.ambient')}
            </span>
            {areasExceeded.ambient && (
              <img
                className="zone-error-indicator"
                src={errorIndicator}
                alt=""
                aria-hidden="true"
              />
            )}
          </li>
          <li
            className="zone-item"
            tabIndex={TAB_INDEX.ENABLED}
            aria-label={
              areasExceeded.chilled
                ? t('alerts.max_size_area_exceeded.chilled_exceeded')
                : t('alerts.max_size_area_exceeded.chilled_ok')
            }
          >
            <img className="zone-icon" src={chilledIcon} alt="" />
            <span
              className={`zone-name${areasExceeded.chilled ? ' zone-name--exceeded' : ''}`}
            >
              {t('alerts.max_size_area_exceeded.chilled')}
            </span>
            {areasExceeded.chilled && (
              <img
                className="zone-error-indicator"
                src={errorIndicator}
                alt=""
                aria-hidden="true"
              />
            )}
          </li>
          <li
            className="zone-item"
            tabIndex={TAB_INDEX.ENABLED}
            aria-label={
              areasExceeded.frozen
                ? t('alerts.max_size_area_exceeded.frozen_exceeded')
                : t('alerts.max_size_area_exceeded.frozen_ok')
            }
          >
            <img className="zone-icon" src={frozenIcon} alt="" />
            <span
              className={`zone-name${areasExceeded.frozen ? ' zone-name--exceeded' : ''}`}
            >
              {t('alerts.max_size_area_exceeded.frozen')}
            </span>
            {areasExceeded.frozen && (
              <img
                className="zone-error-indicator"
                src={errorIndicator}
                alt=""
                aria-hidden="true"
              />
            )}
          </li>
        </ul>
        <p tabIndex={TAB_INDEX.ENABLED}>
          {t('alerts.max_size_area_exceeded.description')}
        </p>
      </div>
    </Modal>
  )
}
