import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { Modal, ModalSize } from '@mercadona/mo.library.shop-ui/modal'

import { PaymentMetrics } from 'app/payment/PaymentMetrics'
import alertImage from 'system-ui/assets/img/default-alert@2x.png'

interface PaymentAuthenticationFailedModalProps {
  onRetry: () => void
  onClose: () => void
}

export const PaymentAuthenticationFailedModal = ({
  onRetry,
  onClose,
}: PaymentAuthenticationFailedModalProps) => {
  const { t } = useTranslation()

  useEffect(() => {
    PaymentMetrics.authenticationFailedAlertView()
  }, [])

  const handleRetry = () => {
    PaymentMetrics.authenticationFailedAlertRetryClick()
    onRetry()
  }

  const handleClose = () => {
    PaymentMetrics.authenticationFailedAlertDismiss()
    onClose()
  }

  return (
    <Modal
      size={ModalSize.MEDIUM}
      title={t('alerts.payment_failed.title')}
      primaryActionText={t('button.retry')}
      onPrimaryAction={handleRetry}
      secondaryActionText={t('dialog_close')}
      onSecondaryAction={handleClose}
      imageSrc={alertImage}
      onClose={handleClose}
      closeOnEscape={false}
    />
  )
}
