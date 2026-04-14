import { useEffect } from 'react'
import { Trans, useTranslation } from 'react-i18next'

import { Modal, ModalSize } from '@mercadona/mo.library.shop-ui/modal'
import { Notifier } from '@mercadona/mo.library.shop-ui/notifier'

import paymentImage from 'app/order/containers/edit-products-container/assets/payment.png'
import { PaymentMetrics } from 'app/payment/PaymentMetrics'
import { TAB_INDEX } from 'utils/constants'

interface MITTermsModalProps {
  onConfirm: () => void
  onClose: () => void
}

const MITTermsModal = ({ onConfirm, onClose }: MITTermsModalProps) => {
  const { t } = useTranslation()

  useEffect(() => {
    PaymentMetrics.mitTermView()
  }, [])

  const handleConfirm = () => {
    PaymentMetrics.mitTermAcceptClick()
    onConfirm()
  }

  const handleClose = () => {
    PaymentMetrics.mitTermCancelClick()
    onClose()
  }

  return (
    <Modal
      size={ModalSize.MEDIUM}
      title={t('mit_term_title')}
      primaryActionText={t('mit_term_accept_button')}
      onPrimaryAction={handleConfirm}
      secondaryActionText={t('mit_term_cancel_button')}
      onSecondaryAction={handleClose}
      onClose={handleClose}
      imageSrc={paymentImage}
      closeOnEscape={false}
    >
      <Notifier icon="lock" variant="inline">
        {t('mit_term_reminder')}
      </Notifier>
      <p className="mit-terms-modal__description" tabIndex={TAB_INDEX.ENABLED}>
        <Trans>{'mit_term_explanation'}</Trans>
      </p>
    </Modal>
  )
}

export { MITTermsModal }
