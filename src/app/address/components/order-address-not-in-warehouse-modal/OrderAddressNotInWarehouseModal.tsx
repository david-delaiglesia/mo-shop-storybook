import { useTranslation } from 'react-i18next'

import { Modal, ModalSize } from '@mercadona/mo.library.shop-ui/modal'

interface OrderAddressNotInWarehouseModalProps {
  onClose: () => void
}

export const OrderAddressNotInWarehouseModal = ({
  onClose,
}: OrderAddressNotInWarehouseModalProps) => {
  const { t } = useTranslation()

  return (
    <Modal
      size={ModalSize.SMALL}
      title={t('alerts.order_address_not_in_warehouse.title')}
      description={t('alerts.order_address_not_in_warehouse.subtitle')}
      primaryActionText={t('button.ok')}
      onPrimaryAction={onClose}
      onClose={onClose}
    />
  )
}
