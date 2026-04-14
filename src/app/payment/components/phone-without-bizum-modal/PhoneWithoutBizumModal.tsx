import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { Modal, ModalSize } from '@mercadona/mo.library.shop-ui/modal'

import { PaymentMetrics } from 'app/payment/PaymentMetrics'
import alertImage from 'system-ui/assets/img/default-alert@2x.png'
import { PhoneUtils } from 'utils/phone'

interface PhoneWithoutBizumModalProps {
  phone: {
    countryCode: string
    nationalNumber: string
  }
  onClick: () => void
}

export const PhoneWithoutBizumModal = ({
  phone,
  onClick,
}: PhoneWithoutBizumModalProps) => {
  const { t } = useTranslation()

  useEffect(() => {
    PaymentMetrics.phoneWithoutBizumAlertView()
  }, [])

  return (
    <Modal
      size={ModalSize.MEDIUM}
      title={t('alerts.phone_without_bizum.title', {
        phone: PhoneUtils.formatPhoneNumber(phone),
      })}
      primaryActionText={t('button.ok')}
      onPrimaryAction={onClick}
      imageSrc={alertImage}
      imageAlt={'no bizum'}
      onClose={onClick}
      description={t('alerts.phone_without_bizum.message')}
      closeOnEscape={false}
    />
  )
}
