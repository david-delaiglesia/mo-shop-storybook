import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { Modal, ModalSize } from '@mercadona/mo.library.shop-ui/modal'

import { Checkout } from 'app/checkout/interfaces'
import { SlotMetrics } from 'app/shared/slot'
import alertImage from 'system-ui/assets/img/default-alert@2x.png'

interface CheckoutSlotNotAvailableModalProps {
  checkoutId: Checkout['id']
  onClose: () => void
  onAction: () => void
}

export const CheckoutSlotNotAvailableModal = ({
  checkoutId,
  onAction,
  onClose,
}: CheckoutSlotNotAvailableModalProps) => {
  const { t } = useTranslation()

  useEffect(() => {
    SlotMetrics.slotNotAvailableView({
      userFlow: 'checkout',
      checkoutId,
    })
  }, [checkoutId])

  return (
    <Modal
      size={ModalSize.MEDIUM}
      title={t('alerts.checkout_slot_not_available.title')}
      description={t('alerts.checkout_slot_not_available.subtitle')}
      primaryActionText={t('alerts.checkout_slot_not_available.action')}
      onPrimaryAction={onAction}
      imageSrc={alertImage}
      onClose={onClose}
    />
  )
}
