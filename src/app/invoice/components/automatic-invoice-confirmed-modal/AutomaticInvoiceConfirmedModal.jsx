import { useTranslation } from 'react-i18next'

import checkIllustration from '../../../assets/check.png'
import PropTypes from 'prop-types'

import { MediumModal } from '@mercadona/mo.library.shop-ui/modal'

export const AutomaticInvoiceConfirmedModal = ({
  onClose,
  onGoToPortalClick,
}) => {
  const { t } = useTranslation()

  return (
    <MediumModal
      title={t('automatic_invoice_accepted_dialog_title')}
      imageSrc={checkIllustration}
      imageAlt="Check icon"
      primaryActionText={t('button.ok')}
      primaryAction={onClose}
      secondaryActionText={t('invoices.requested_invoice.button')}
      secondaryAction={onGoToPortalClick}
      hideModal={onClose}
    />
  )
}

AutomaticInvoiceConfirmedModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onGoToPortalClick: PropTypes.func.isRequired,
}
