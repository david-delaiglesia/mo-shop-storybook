import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import orderConfirmedImage from './assets/order-confirmed.svg'
import orderPaymentImage from './assets/order-payment.svg'

import { Modal, ModalSize } from '@mercadona/mo.library.shop-ui/modal'

import { OrderMetrics } from 'app/order'

import './PaymentTimingModal.css'

interface PaymentTimingModalProps {
  onClick: () => void
}

export const PaymentTimingModal = ({ onClick }: PaymentTimingModalProps) => {
  const { t } = useTranslation()

  useEffect(() => {
    OrderMetrics.orderPaymentTimelineModalView()
  }, [])

  const handleClick = () => {
    OrderMetrics.orderPaymentTimelineModalClick()
    onClick()
  }

  return (
    <Modal
      size={ModalSize.SMALL}
      title={t('alerts.payment_timing.title')}
      primaryActionText={t('button.ok')}
      onPrimaryAction={handleClick}
      onClose={handleClick}
      closeOnEscape={false}
    >
      <div className="payment-timing-modal__timeline">
        <div className="payment-timing-modal__timeline-item">
          <img
            src={orderConfirmedImage}
            alt={t('alerts.payment_timing.order_confirmed')}
          />
          <span className="subhead1-r">
            {t('alerts.payment_timing.order_confirmed')}
          </span>{' '}
          <span className="title2-b payment-timing-modal__time">
            {t('alerts.payment_timing.today')}
          </span>
        </div>
        <div className="payment-timing-modal__timeline-item">
          <img
            src={orderPaymentImage}
            alt={t('alerts.payment_timing.order_payment')}
          />
          <span className="subhead1-r">
            {t('alerts.payment_timing.order_payment')}
          </span>{' '}
          <span className="title2-b payment-timing-modal__time">
            {t('alerts.payment_timing.delivery_day')}
          </span>
        </div>

        <span className="payment-timing-modal__timeline-connector" />
      </div>
      <p className="body1-r">{t('alerts.payment_timing.message')}</p>
    </Modal>
  )
}
