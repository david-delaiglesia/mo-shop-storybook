import { useTranslation } from 'react-i18next'

import warningImage from '../../../assets/warning.png'
import { func } from 'prop-types'

import { Button } from '@mercadona/mo.library.shop-ui/button'

import Modal from 'components/modal'

import './PersonalIdStillNotRegisteredModal.css'

const PersonalIdStillNotRegisteredModal = ({ onClose, onRetry }) => {
  const { t } = useTranslation()

  return (
    <Modal
      ariaLabelModal={t(
        'invoices.personal_id_not_registered_modal_warning.title',
      )}
    >
      <div className="personal-id-still-not-registered-modal__container">
        <img
          src={warningImage}
          alt="Warning icon"
          className="personal-id-still-not-registered-modal__image"
        />
        <h3 className="personal-id-still-not-registered-modal__title title2-b">
          {t('invoices.personal_id_not_registered_modal_warning.title')}
        </h3>
        <p className="personal-id-still-not-registered-modal__description body1-r">
          {t('invoices.personal_id_not_registered_modal_warning.subtitle')}
        </p>
        <Button
          text={t('invoices.personal_id_not_registered_modal_warning.button')}
          onClick={onRetry}
          className="personal-id-still-not-registered-modal__retry-button"
        >
          {t('invoices.personal_id_not_registered_modal_warning.button')}
        </Button>
        <Button
          text={t(
            'invoices.personal_id_not_registered_modal_warning.close_button',
          )}
          onClick={onClose}
          variant="text"
          className="personal-id-still-not-registered-modal__cancel-button"
        >
          {t('invoices.personal_id_not_registered_modal_warning.close_button')}
        </Button>
      </div>
    </Modal>
  )
}

PersonalIdStillNotRegisteredModal.propTypes = {
  onClose: func,
  onRetry: func,
}

export { PersonalIdStillNotRegisteredModal }
