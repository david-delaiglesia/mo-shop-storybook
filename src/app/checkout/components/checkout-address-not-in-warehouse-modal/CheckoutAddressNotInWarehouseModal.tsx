import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import warehouseChangedIcon from './assets/warehouse-changed.jpg'

import { Modal, ModalSize } from '@mercadona/mo.library.shop-ui/modal'

import { AddressMetrics } from 'app/address/metrics'

interface CheckoutAddressNotInWarehouseModalProps {
  onAction: () => void
}

export const CheckoutAddressNotInWarehouseModal = ({
  onAction,
}: CheckoutAddressNotInWarehouseModalProps) => {
  const { t } = useTranslation()

  useEffect(() => {
    AddressMetrics.changeHiveAlertView('unnecessary')
  }, [])

  return (
    <Modal
      size={ModalSize.SMALL}
      title={t('change_hive_alert_title_legacy')}
      description={t('change_hive_on_address_alert_message')}
      primaryActionText={t('change_hive_on_address_alert_button')}
      imageSrc={warehouseChangedIcon}
      onPrimaryAction={onAction}
      onClose={onAction}
    />
  )
}
