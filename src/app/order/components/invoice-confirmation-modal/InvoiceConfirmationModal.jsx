import { useTranslation } from 'react-i18next'

import checkIllustration from '../../../assets/check.png'
import { func } from 'prop-types'

import Button from 'components/button'
import Modal from 'components/modal'

import './InvoiceConfirmationModal.css'

const InvoiceConfirmationModal = ({ onConfirm }) => {
  const { t } = useTranslation()

  return (
    <Modal ariaLabelModal={t('invoices.requested_invoice.title')}>
      <div className="invoice-confirmation-modal__container">
        <img
          src={checkIllustration}
          alt="Check icon"
          className="invoice-confirmation-modal__image"
        />
        <h3 className="invoice-confirmation-modal__title title2-b">
          {t('invoices.requested_invoice.title')}
        </h3>
        <p className="invoice-confirmation-modal__description body1-r">
          {t('invoices.request_invoice.info')}
        </p>
        <Button
          text="button.agreed"
          onClick={onConfirm}
          className="invoice-confirmation-modal__button"
        />
      </div>
    </Modal>
  )
}

InvoiceConfirmationModal.propTypes = {
  onConfirm: func.isRequired,
}

export { InvoiceConfirmationModal }
