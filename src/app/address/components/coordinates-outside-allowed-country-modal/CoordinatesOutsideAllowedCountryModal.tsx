import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { Modal, ModalSize } from '@mercadona/mo.library.shop-ui/modal'

import { AddressMetrics } from 'app/address/metrics'
import { useFlowIdContext } from 'app/shared/flow-id'
import wrongPlaceImage from 'system-ui/assets/img/wrong-place.svg'

interface CoordinatesOutsideAllowedCountryModalProps {
  onClick: () => void
}

/**
 * @deprecated This modal will be removed when ADDRESS_POSTAL_CODE_CORRECTION feature flag is retired.
 * The backend no longer throws CoordinatesOutsideAllowedCountryException with the new accuracy endpoint.
 */
export const CoordinatesOutsideAllowedCountryModal = ({
  onClick,
}: CoordinatesOutsideAllowedCountryModalProps) => {
  const { t } = useTranslation()
  const { flowId } = useFlowIdContext()

  const handleToggle = () => {
    AddressMetrics.alertNoServiceOkButtonClick(flowId, 'country')
    onClick()
  }

  useEffect(() => {
    AddressMetrics.alertNoServiceView(flowId, 'country')
  }, [])

  return (
    <Modal
      size={ModalSize.MEDIUM}
      title={t('alerts.no_service_country.title')}
      primaryActionText={t('button.ok')}
      onPrimaryAction={handleToggle}
      imageSrc={wrongPlaceImage}
      imageAlt={'no service country'}
      onClose={handleToggle}
      description={t('alerts.no_service_country.message')}
    />
  )
}
