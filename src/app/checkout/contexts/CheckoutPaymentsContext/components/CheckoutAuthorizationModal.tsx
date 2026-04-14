import { useTranslation } from 'react-i18next'

import { Modal, ModalSize } from '@mercadona/mo.library.shop-ui/modal'

import { SCACheckoutModalInfo } from 'app/payment/components/SCA-checkout-modal-info'
import {
  sendAuthenticationRequiredAlertCloseClickMetrics,
  sendAuthenticationRequiredAlertContinueClickMetrics,
} from 'app/payment/metrics'
import { Storage } from 'services/storage'

interface CheckoutAuthorizationModalProps {
  onClose: () => void
  onConfirm: () => void
}

export const CheckoutAuthorizationModal = ({
  onClose,
  onConfirm,
}: CheckoutAuthorizationModalProps) => {
  const { t } = useTranslation()

  const handleClose = () => {
    sendAuthenticationRequiredAlertCloseClickMetrics({ flow: 'checkout' })
    onClose()
  }

  const handleConfirm = () => {
    sendAuthenticationRequiredAlertContinueClickMetrics({ flow: 'checkout' })
    Storage.setFailedAuthPaymentModal()
    Storage.setCheckoutSCAModalAsSeen()
    onConfirm()
  }

  return (
    <Modal
      onClose={handleClose}
      size={ModalSize.MEDIUM}
      title={t('checkout_payment_changes_alert_title')}
      primaryActionText={t(
        'checkout_payment_changes_alert_explanation_continue_button',
      )}
      onPrimaryAction={handleConfirm}
      secondaryActionText={t(
        'checkout_payment_changes_alert_explanation_back_button',
      )}
      onSecondaryAction={handleClose}
    >
      <SCACheckoutModalInfo />
    </Modal>
  )
}
