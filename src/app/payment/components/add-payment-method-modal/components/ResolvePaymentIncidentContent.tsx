import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { PaymentMethodSummary } from '../../payment-method-summary'

import { StatusWarningIcon } from '@mercadona/mo.library.icons'
import { Button } from '@mercadona/mo.library.shop-ui/button'
import { Card } from '@mercadona/mo.library.shop-ui/card'
import { Loader } from '@mercadona/mo.library.shop-ui/loader'

import { Order, OrderMetrics, OrderPaymentStatus } from 'app/order'
import { useOrderContext } from 'app/order/contexts/OrderContext'
import { PaymentMetrics } from 'app/payment/PaymentMetrics'
import { usePaymentIncidentDetails } from 'app/payment/hooks'
import { PaymentIncidentReason } from 'app/payment/interfaces'
import { useId } from 'hooks/useId'
import { TAB_INDEX } from 'utils/constants'

import './ResolvePaymentIncidentContent.css'

const paymentIncidentReasonKeyMap: Record<
  Exclude<PaymentIncidentReason, PaymentIncidentReason.UNKNOWN>,
  string
> = {
  [PaymentIncidentReason.INSUFFICIENT_FUNDS]:
    'order.detail.status.payment_disrupted.declined.insufficient_funds.reason',
  [PaymentIncidentReason.INACTIVE_CARD]:
    'order.detail.status.payment_disrupted.declined.inactive_card.reason',
  [PaymentIncidentReason.ONLINE_PAYMENT_DISABLED]:
    'order.detail.status.payment_disrupted.declined.online_payment_disabled.reason',
} as const

function getReasonTextKey(
  paymentStatus: Order['paymentStatus'] | undefined,
  reason: PaymentIncidentReason | undefined,
): string {
  const defaultErrorKey =
    paymentStatus === OrderPaymentStatus.REPREPARED_WITH_PENDING_PAYMENT
      ? 'order.detail.status.payment_disrupted.reprepared_unknown.reason'
      : 'order.detail.status.payment_disrupted.unknown.reason'

  if (
    !reason ||
    reason === PaymentIncidentReason.UNKNOWN ||
    !paymentIncidentReasonKeyMap[reason]
  )
    return defaultErrorKey

  return paymentIncidentReasonKeyMap[reason]
}

export const ResolveOrderPaymentIncidentContent = ({
  onChangePaymentMethod,
  onClickResolvePaymentIncident,
}: {
  onChangePaymentMethod: () => void
  onClickResolvePaymentIncident: () => void
}) => {
  const { isLoading, order } = useOrderContext()
  const {
    details: paymentIncidentDetails,
    isLoading: isLoadingPaymentIncidentDetails,
  } = usePaymentIncidentDetails()
  const { t } = useTranslation()
  const id = useId()

  const reasonTextKey = getReasonTextKey(
    order?.paymentStatus,
    paymentIncidentDetails?.reason,
  )

  useEffect(() => {
    if (isLoading || !paymentIncidentDetails) return

    OrderMetrics.solvePaymentIssueView({
      orderId: order?.id,
      errorDescriptionDisplayed: t(reasonTextKey),
      errorType: paymentIncidentDetails.reason,
    })
  }, [isLoading, order?.id, t, reasonTextKey, paymentIncidentDetails])

  if (isLoadingPaymentIncidentDetails || !paymentIncidentDetails) {
    return <Loader />
  }

  const handleRetryPaymentClick = () => {
    PaymentMetrics.paymentRetryClick({
      orderId: order?.id,
    })
    onClickResolvePaymentIncident()
  }

  return (
    <div className="resolve-payment-incident-content">
      <Card
        className="resolve-payment-incident-content-section"
        as="section"
        aria-labelledby={`${id}-title`}
      >
        <div className="resolve-payment-incident-content__incident">
          <div className="resolve-payment-incident-content__incident-header">
            <h3 className="title2-b" id={`${id}-title`}>
              {t('order.detail.status.payment_disrupted.declined.title')}
            </h3>
          </div>

          <p className="body1-r" tabIndex={TAB_INDEX.ENABLED}>
            {t(reasonTextKey)}
          </p>

          <div className="resolve-payment-incident-content__incident-divider" />
          <p
            className="subhead1-r resolve-payment-incident-content-subheader"
            tabIndex={TAB_INDEX.ENABLED}
          >
            {t('order.detail.status.payment_disrupted.declined.subtitle')}
          </p>
        </div>
        <StatusWarningIcon size={24} aria-hidden="true" />
      </Card>
      <Card
        className="resolve-payment-incident-content-card"
        as="section"
        aria-labelledby={`${id}-payment-method`}
        hover
      >
        <div className="resolve-payment-incident-content__incident-header">
          <h3 className="title2-b" id={`${id}-payment-method`}>
            {t('commons.order.order_payment.payment')}
          </h3>
        </div>
        <PaymentMethodSummary
          paymentMethod={paymentIncidentDetails.paymentMethod}
        />
        <Button
          variant="text"
          className="resolve-payment-incident-content-card__modify-button subhead1-r"
          onClick={onChangePaymentMethod}
          aria-label={t('cells.common.edit')}
        >
          {t('cells.common.edit')}
        </Button>
      </Card>
      <div className="resolve-payment-incident-content__actions">
        <Button onClick={handleRetryPaymentClick} variant="primary">
          {t('order.detail.status.payment_disrupted.retry_payment')}
        </Button>
      </div>
    </div>
  )
}
