import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { Modal, ModalSize } from '@mercadona/mo.library.shop-ui/modal'

import { useOrderContext } from 'app/order/contexts/OrderContext'
import { PaymentMetrics } from 'app/payment/PaymentMetrics'
import { PaymentIncidentReason } from 'app/payment/interfaces'
import alertImage from 'system-ui/assets/img/default-alert@2x.png'
import { TAB_INDEX } from 'utils/constants'

interface PaymentFailedModalProps {
  onRetry: () => void
  onClose: () => void
  reason: PaymentIncidentReason | null
}

const subtitleKeyByReason: Record<PaymentIncidentReason, string | undefined> = {
  [PaymentIncidentReason.INSUFFICIENT_FUNDS]:
    'order.detail.status.payment_disrupted.declined.insufficient_funds.reason',
  [PaymentIncidentReason.INACTIVE_CARD]:
    'order.detail.status.payment_disrupted.declined.inactive_card.reason',
  [PaymentIncidentReason.ONLINE_PAYMENT_DISABLED]:
    'order.detail.status.payment_disrupted.declined.online_payment_disabled.reason',
  [PaymentIncidentReason.UNKNOWN]: undefined,
} as const

const getSubtitleKey = (reason: PaymentIncidentReason | null) => {
  if (!reason) return undefined

  const subtitleKey = subtitleKeyByReason[reason]

  if (!subtitleKey) return undefined

  return subtitleKey
}

export const PaymentFailedModal = ({
  onRetry,
  onClose,
  reason,
}: PaymentFailedModalProps) => {
  const { isLoading, order } = useOrderContext()

  const { t } = useTranslation()

  const subtitleKey = getSubtitleKey(reason)
  const subtitle = subtitleKey ? t(subtitleKey) : undefined

  useEffect(() => {
    if (isLoading) return

    PaymentMetrics.paymentErrorView({
      orderId: order?.id,
      errorType: reason || 'payment_failed',
      errorHeaderDisplayed: subtitle || t('alerts.payment_failed.title'),
    })
  }, [isLoading, reason, order?.id, subtitle, t])

  return (
    <Modal
      size={ModalSize.MEDIUM}
      title={t('alerts.payment_failed.title')}
      primaryActionText={t('button.retry')}
      onPrimaryAction={onRetry}
      secondaryActionText={t('dialog_close')}
      onSecondaryAction={onClose}
      imageSrc={alertImage}
      imageAlt={'payment failed'}
      onClose={onClose}
      closeOnEscape={false}
    >
      {subtitle && (
        <span role="status" tabIndex={TAB_INDEX.ENABLED}>
          {subtitle}
        </span>
      )}
    </Modal>
  )
}
