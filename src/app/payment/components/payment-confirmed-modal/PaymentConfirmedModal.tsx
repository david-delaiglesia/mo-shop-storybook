import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import checkImage from './repeat-check.png'

import { Modal, ModalSize } from '@mercadona/mo.library.shop-ui/modal'

import { PaymentMetrics } from 'app/payment/PaymentMetrics'

interface PaymentConfirmedModalProps {
  orderId?: string | number
  onClick: () => void
}

export const PaymentConfirmedModal = ({
  orderId,
  onClick,
}: PaymentConfirmedModalProps) => {
  const { t } = useTranslation()

  useEffect(() => {
    PaymentMetrics.paymentSuccessView({ orderId })

    setTimeout(() => {
      onClick()
    }, 6000)
  }, [])

  return (
    <Modal
      size={ModalSize.SMALL}
      title={t('alerts.payment_confirmed.title')}
      imageSrc={checkImage}
      onClose={onClick}
      closeOnEscape={false}
    />
  )
}
