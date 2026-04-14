import { useEffect } from 'react'
import { Trans, useTranslation } from 'react-i18next'

import bankImage from './assets/bank.png'
import prepushImage from './assets/prepush.png'

import { Modal, ModalSize } from '@mercadona/mo.library.shop-ui/modal'

import { PaymentMetrics } from 'app/payment'
import { TAB_INDEX } from 'utils/constants'

import './BizumNeedsModal.css'

interface BizumNeedsModalProps {
  onClose: () => void
}

export const BizumNeedsModal = ({ onClose }: BizumNeedsModalProps) => {
  const { t } = useTranslation()

  useEffect(() => {
    PaymentMetrics.bizumRequirementsModal()
  }, [])

  return (
    <Modal
      size={ModalSize.SMALL}
      title={t('alerts.bizum_needs.title')}
      onClose={onClose}
      primaryActionText={t('button.ok')}
      onPrimaryAction={onClose}
      closeOnEscape={false}
    >
      <div className="bizum-needs-dialog__content">
        <p className="bizum-needs-dialog__message">
          <img
            src={bankImage}
            className="bizum-needs-dialog__message-image"
            aria-hidden
          />
          <span className="body1-r" tabIndex={TAB_INDEX.ENABLED}>
            <Trans
              t={t}
              i18nKey="alerts.bizum_needs.app_installed"
              components={{ b: <span className="body1-b" /> }}
            />
          </span>
        </p>
        <p className=" bizum-needs-dialog__message">
          <img
            src={prepushImage}
            className="bizum-needs-dialog__message-image"
            aria-hidden
          />
          <span className="body1-r" tabIndex={TAB_INDEX.ENABLED}>
            <Trans
              t={t}
              i18nKey="alerts.bizum_needs.phone_with_bizum"
              components={{ b: <span className="body1-b" /> }}
            />
          </span>
        </p>
      </div>
    </Modal>
  )
}
