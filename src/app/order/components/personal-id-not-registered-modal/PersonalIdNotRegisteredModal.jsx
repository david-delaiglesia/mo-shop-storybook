import { useTranslation } from 'react-i18next'

import { func } from 'prop-types'

import { Button } from '@mercadona/mo.library.shop-ui/button'

import Modal from 'components/modal'

import './PersonalIdNotRegisteredModal.css'

const PersonalIdNotRegisteredModal = ({
  onClose,
  sendInvoicesPortalMetrics,
}) => {
  const { VITE_INVOICES_PORTAL_REGISTRATION } = import.meta.env

  const { t } = useTranslation()

  return (
    <Modal
      ariaLabelModal={t('invoices.personal_id_not_registered_modal.title')}
    >
      <div className="personal-id-not-registered-modal__container">
        <h3 className="personal-id-not-registered-modal__title title2-b">
          {t('invoices.personal_id_not_registered_modal.title')}
        </h3>
        <p className="personal-id-not-registered-modal__description body1-r">
          {t('invoices.personal_id_not_registered_modal.subtitle')}
        </p>
        <a
          className="personal-id-not-registered-modal__link subhead1-sb"
          role="link"
          href={VITE_INVOICES_PORTAL_REGISTRATION}
          onClick={sendInvoicesPortalMetrics}
          target="_blank"
          rel="noreferrer"
        >
          {t('invoices.personal_id_not_registered_modal.button')}
        </a>
        <Button
          text={t('invoices.cancel')}
          onClick={onClose}
          variant="text"
          className="personal-id-not-registered-modal__button"
        >
          {t('invoices.cancel')}
        </Button>
      </div>
    </Modal>
  )
}

PersonalIdNotRegisteredModal.propTypes = {
  onClose: func,
  sendInvoicesPortalMetrics: func,
}

export { PersonalIdNotRegisteredModal }
