import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { PaymentMethodCell } from '../../payment-method-cell'

import { AddIcon } from '@mercadona/mo.library.icons'
import { Button } from '@mercadona/mo.library.shop-ui/button'
import { Loader } from '@mercadona/mo.library.shop-ui/loader'

import { useOrderContext } from 'app/order/contexts/OrderContext'
import { PaymentMetrics } from 'app/payment/PaymentMetrics'
import { useUserPaymentMethods } from 'app/payment/hooks'
import { PaymentMethod } from 'app/payment/interfaces'
import { getUniqueById } from 'utils/collections'

import './ResolvePaymentIncidentPaymentMethodListContent.css'

interface ResolvePaymentIncidentPaymentMethodListContentProps {
  currentPaymentMethod?: PaymentMethod
  selectedPaymentMethodId: PaymentMethod['id'] | null
  onSelectPaymentMethod: (paymentMethodId: PaymentMethod['id']) => void
  onGoBack: () => void
  onRetryPayment: () => void
  onAddPaymentMethod: () => void
}

export const ResolvePaymentIncidentPaymentMethodListContent = ({
  currentPaymentMethod,
  selectedPaymentMethodId,
  onSelectPaymentMethod,
  onGoBack,
  onRetryPayment,
  onAddPaymentMethod,
}: ResolvePaymentIncidentPaymentMethodListContentProps) => {
  const { t } = useTranslation()
  const { paymentMethods: availablePaymentMethods, isLoading } =
    useUserPaymentMethods()

  const { order } = useOrderContext()

  const paymentMethods = getUniqueById([
    ...availablePaymentMethods,
    ...(currentPaymentMethod ? [currentPaymentMethod] : []),
  ])

  useEffect(() => {
    if (isLoading) {
      return
    }

    PaymentMetrics.paymentMethodsModalView({
      paymentMethodIds: paymentMethods.map((pm) => pm.id),
    })
  }, [paymentMethods, isLoading])

  if (isLoading || !paymentMethods) {
    return <Loader />
  }

  const handleRetryPaymentClick = () => {
    PaymentMetrics.paymentRetryClick({
      orderId: order?.id,
    })
    onRetryPayment()
  }

  return (
    <>
      <div
        className="resolve-payment-incident-payment-method-list-content__payment-methods"
        role="radiogroup"
        aria-label={t('commons.order.order_payment.payment_list.options')}
      >
        {paymentMethods.map((paymentMethod) => (
          <PaymentMethodCell
            key={paymentMethod.id}
            paymentMethod={paymentMethod}
            onSelect={() => onSelectPaymentMethod(paymentMethod.id)}
            isSelected={selectedPaymentMethodId === paymentMethod.id}
          />
        ))}
      </div>
      <button
        className="resolve-payment-incident-payment-method-list-content__add-new"
        onClick={onAddPaymentMethod}
      >
        <span
          className="resolve-payment-incident-payment-method-list-content__add-new__icon"
          aria-hidden
        >
          <AddIcon size={20} />
        </span>
        <span className="subhead1-sb">
          {t('payment_method.add_new_payment_method.title')}
        </span>
      </button>
      <div className="resolve-payment-incident-payment-method-list-content__actions">
        <Button onClick={onGoBack} variant="secondary">
          {t('button.go_back')}
        </Button>
        <Button onClick={handleRetryPaymentClick} variant="primary">
          {t('order.detail.status.payment_disrupted.retry_payment')}
        </Button>
      </div>
    </>
  )
}
