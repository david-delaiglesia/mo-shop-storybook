import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { Modal, ModalSize } from '@mercadona/mo.library.shop-ui/modal'

import { AddressMetrics } from 'app/address/metrics'
import { useFlowIdContext } from 'app/shared/flow-id'
import defaultAlertImage from 'system-ui/assets/img/default-alert@2x.png'

interface PostalCodeWithoutServiceModalProps {
  onClick: () => void
}

export const PostalCodeWithoutServiceModal = ({
  onClick,
}: PostalCodeWithoutServiceModalProps) => {
  const { t } = useTranslation()
  const { flowId } = useFlowIdContext()

  const handleToggle = () => {
    AddressMetrics.alertNoServiceOkButtonClick(flowId, 'postal_code')
    onClick()
  }

  useEffect(() => {
    AddressMetrics.alertNoServiceView(flowId, 'postal_code')
  }, [])

  return (
    <Modal
      size={ModalSize.MEDIUM}
      title={t('address_modal_no_service_title')}
      primaryActionText={t('button.ok')}
      onPrimaryAction={handleToggle}
      imageSrc={defaultAlertImage}
      imageAlt={'no service postal code'}
      onClose={handleToggle}
      description={t('address_modal_no_service_body')}
    />
  )
}
