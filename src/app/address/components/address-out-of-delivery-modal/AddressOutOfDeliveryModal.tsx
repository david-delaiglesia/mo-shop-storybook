import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { Modal, ModalSize } from '@mercadona/mo.library.shop-ui/modal'

import { AddressMetrics } from 'app/address/metrics'
import { useFlowIdContext } from 'app/shared/flow-id'
import wrongPlaceImage from 'system-ui/assets/img/wrong-place.svg'

interface AddressOutOfDeliveryModalProps {
  onClick: () => void
}

export const AddressOutOfDeliveryModal = ({
  onClick,
}: AddressOutOfDeliveryModalProps) => {
  const { t } = useTranslation()
  const { flowId } = useFlowIdContext()

  const handleToggle = () => {
    AddressMetrics.alertNoServiceOkButtonClick(flowId, 'exclusion')
    onClick()
  }

  useEffect(() => {
    AddressMetrics.alertNoServiceView(flowId, 'exclusion')
  }, [])

  return (
    <Modal
      size={ModalSize.MEDIUM}
      title={t('alerts.no_service_exception.title')}
      primaryActionText={t('button.ok')}
      onPrimaryAction={handleToggle}
      imageSrc={wrongPlaceImage}
      imageAlt={'no service due to exclusion'}
      onClose={handleToggle}
      description={t('alerts.no_service_exception.message')}
    />
  )
}
