import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { Modal, ModalSize } from '@mercadona/mo.library.shop-ui/modal'

import { SlotMetrics } from 'app/shared/slot'

interface OrderSlotNotAvailableModalProps {
  orderId: number
  onClose: () => void
  onAction: () => void
}

export const OrderSlotNotAvailableModal = ({
  orderId,
  onAction,
  onClose,
}: OrderSlotNotAvailableModalProps) => {
  const { t } = useTranslation()

  useEffect(() => {
    SlotMetrics.slotNotAvailableView({
      userFlow: 'edit_order',
      orderId,
    })
  }, [orderId])

  return (
    <Modal
      size={ModalSize.SMALL}
      title={t('alerts.order_slot_not_available.title')}
      description={t('alerts.order_slot_not_available.subtitle')}
      primaryActionText={t('button.ok')}
      onPrimaryAction={onAction}
      onClose={onClose}
    />
  )
}
