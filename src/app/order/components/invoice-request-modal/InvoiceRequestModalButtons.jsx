import { useTranslation } from 'react-i18next'

import { bool, func, string } from 'prop-types'

import Button from 'components/button'

const InvoiceRequestModalButtons = ({
  documentNumber,
  isInvoiceRequestButtonLoading,
  isInvoiceModified,
  isInvoiceRequested,
  onClose,
  onConfirm,
}) => {
  const { t } = useTranslation()

  return (
    <>
      {isInvoiceModified && (
        <div className="invoice-request-modal__buttons-container">
          <Button
            text={t('invoices.cancel')}
            type="secondary"
            onClick={onClose}
          >
            {t('invoices.cancel')}
          </Button>
          <Button
            text={t('invoices.confirm')}
            disabled={!documentNumber}
            onClick={onConfirm}
            activeFeedback={isInvoiceRequestButtonLoading}
          >
            {t('invoices.confirm')}
          </Button>
        </div>
      )}
      {isInvoiceRequested && (
        <Button
          text={t('invoices.accept')}
          onClick={onClose}
          className="invoice-request-moda__accept-button"
        >
          {t('invoices.accept')}
        </Button>
      )}
    </>
  )
}

InvoiceRequestModalButtons.propTypes = {
  onClose: func.isRequired,
  onConfirm: func.isRequired,
  documentNumber: string,
  isInvoiceRequestButtonLoading: bool,
  isInvoiceModified: bool,
  isInvoiceRequested: bool,
}

export { InvoiceRequestModalButtons }
