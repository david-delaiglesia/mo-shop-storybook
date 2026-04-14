import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { Modal, ModalSize } from '@mercadona/mo.library.shop-ui/modal'

import checkImage from 'app/assets/check.png'

interface OrderPaymentMethodUpdatedModalProps {
  onClick: () => void
}

export const OrderPaymentMethodUpdatedModal = ({
  onClick,
}: OrderPaymentMethodUpdatedModalProps) => {
  const { t } = useTranslation()

  useEffect(() => {
    setTimeout(() => {
      onClick()
    }, 3000)
  }, [])

  return (
    <Modal
      size={ModalSize.SMALL}
      title={t('alerts.order_payment_method_updated.title')}
      imageSrc={checkImage}
      onClose={onClick}
      closeOnEscape={false}
    />
  )
}
