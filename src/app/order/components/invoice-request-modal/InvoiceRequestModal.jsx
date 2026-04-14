import { useTranslation } from 'react-i18next'

import { InvoiceRequestModalButtons } from './InvoiceRequestModalButtons'
import { bool, func, string } from 'prop-types'

import { Icon } from '@mercadona/mo.library.shop-ui/icon'

import { getInvoiceModalTitle } from 'app/order/containers/order-detail-container/utils'
import Button from 'components/button'
import Modal from 'components/modal'
import Input from 'system-ui/input'

import './InvoiceRequestModal.css'

const InvoiceRequestModal = ({
  onClose,
  onConfirm,
  onConfirmEdition,
  documentNumber,
  setDocumentNumber,
  isInvoiceRequestButtonLoading,
  isBillRequested,
  isPaymentOk,
  isEditionModeActive,
  sendInvoicesPortalMetrics,
  onEditClick,
}) => {
  const { VITE_INVOICES_PORTAL } = import.meta.env

  const { t } = useTranslation()

  const modalTitle = getInvoiceModalTitle({
    isEditionModeActive,
    isBillRequested,
    t,
  })

  const isInvoiceModified = !isBillRequested || isEditionModeActive
  const isInvoiceRequested = isBillRequested && !isEditionModeActive
  const showEditButton = isInvoiceRequested && !isPaymentOk
  const isButtonDisabled = isBillRequested && isPaymentOk

  return (
    <Modal ariaLabelModal={modalTitle}>
      <div className="invoice-request-modal__container">
        <h3 className="invoice-request-modal__title title2-b">{modalTitle}</h3>
        <div className="invoice-request-modal__content">
          {isInvoiceModified && (
            <p className="invoice-request-modal__input-label body1-r">
              {t('invoices.request_invoice.subtitle')}
            </p>
          )}
          <div className="invoice-request-modal__input">
            <Input
              value={documentNumber}
              label={t('invoices.request_invoice.label')}
              onChange={(event) => setDocumentNumber(event.target.value)}
              onClick={onEditClick}
              disabled={isButtonDisabled}
            >
              {showEditButton && <Button text="Editar" type="text" />}
            </Input>
          </div>
          <p className="invoice-request-modal__description subhead1-r">
            {t('invoices.request_invoice.info')}
          </p>
          {isInvoiceRequested && (
            <div className="invoice-request-modal__link-container">
              <a
                className="invoice-request-modal__link subhead1-sb"
                href={VITE_INVOICES_PORTAL}
                target="_blank"
                onClick={sendInvoicesPortalMetrics}
                rel="noreferrer"
              >
                {t('invoices.requested_invoice.button')}
              </a>
              <Icon icon="open-right" />
            </div>
          )}
        </div>
        <InvoiceRequestModalButtons
          documentNumber={documentNumber}
          isInvoiceRequestButtonLoading={isInvoiceRequestButtonLoading}
          isInvoiceModified={isInvoiceModified}
          isInvoiceRequested={isInvoiceRequested}
          onConfirm={isEditionModeActive ? onConfirmEdition : onConfirm}
          onClose={onClose}
        />
      </div>
    </Modal>
  )
}

InvoiceRequestModal.propTypes = {
  onClose: func.isRequired,
  onConfirm: func,
  onConfirmEdition: func,
  documentNumber: string,
  setDocumentNumber: func,
  isInvoiceRequestButtonLoading: bool,
  isBillRequested: bool,
  isPaymentOk: bool,
  isEditionModeActive: bool,
  sendInvoicesPortalMetrics: func,
  onEditClick: func,
}

export { InvoiceRequestModal }
