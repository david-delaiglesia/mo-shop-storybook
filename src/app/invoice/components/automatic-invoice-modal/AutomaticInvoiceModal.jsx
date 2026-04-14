import { useTranslation } from 'react-i18next'

import PropTypes from 'prop-types'

import { SmallModal } from '@mercadona/mo.library.shop-ui/modal'

export const AutomaticInvoiceModal = ({ onConfirm, onCancel }) => {
  const { t } = useTranslation()

  return (
    <SmallModal
      title={t('automatic_invoice_dialog_title')}
      description={t('automatic_invoice_dialog_message')}
      primaryActionText={t('automatic_invoice_dialog_primary_button')}
      primaryAction={onConfirm}
      secondaryActionText={t('button.no')}
      secondaryAction={onCancel}
      hideModal={onCancel}
    />
  )
}

AutomaticInvoiceModal.propTypes = {
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
}
