import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { AddIcon } from '@mercadona/mo.library.icons'
import { Button } from '@mercadona/mo.library.shop-ui/button'

import { useOrderContext } from 'app/order/contexts/OrderContext'
import {
  PaymentMethod,
  PaymentMethodCell,
  useUserPaymentMethods,
} from 'app/payment'
import { getUniqueById } from 'utils/collections'

import './OrderPaymentList.css'

interface OrderPaymentListProps {
  currentSelectedPaymentId?: number
  onAddNewPaymentMethodClick: () => void
  onPaymentMethodConfirm: (paymentMethod: PaymentMethod) => void
  onClose: () => void
}

export const OrderPaymentList = ({
  currentSelectedPaymentId,
  onAddNewPaymentMethodClick,
  onPaymentMethodConfirm,
  onClose,
}: OrderPaymentListProps) => {
  const { t } = useTranslation()

  const { order } = useOrderContext()

  const { paymentMethods: availablePaymentMethods, isLoading } =
    useUserPaymentMethods()

  const [selectedPaymentId, setSelectedPaymentId] = useState(
    currentSelectedPaymentId,
  )

  const paymentMethods = getUniqueById([
    ...availablePaymentMethods,
    ...(order ? [order.paymentMethod] : []),
  ])

  const handlePaymentMethodSelect = (payment: PaymentMethod) => {
    setSelectedPaymentId(payment.id)
  }

  const handleConfirm = () => {
    if (selectedPaymentId) {
      const paymentMethodSelected = paymentMethods.find(
        (pm) => pm.id === selectedPaymentId,
      )
      if (paymentMethodSelected) {
        onPaymentMethodConfirm(paymentMethodSelected)
      }
    }
  }

  if (!selectedPaymentId) {
    return null
  }

  return (
    <div
      className="order-payment-list order-payment-list--new"
      data-testid="order-payment-list"
    >
      {!isLoading && (
        <div
          className="order-payment-list__options"
          role="radiogroup"
          aria-label={t('commons.order.order_payment.payment_list.options')}
        >
          {paymentMethods.map((payment) => (
            <PaymentMethodCell
              key={payment.id}
              paymentMethod={payment}
              onSelect={() => handlePaymentMethodSelect(payment)}
              isSelected={selectedPaymentId === payment.id}
            />
          ))}

          <button
            className="order-payment-list__add-new"
            onClick={onAddNewPaymentMethodClick}
          >
            <span className="order-payment-list__add-new__icon" aria-hidden>
              <AddIcon size={20} />
            </span>
            <span className="subhead1-sb">
              {t('payment_method.add_new_payment_method.title')}
            </span>
          </button>
        </div>
      )}

      <div className="order-payment-list-buttons">
        <Button onClick={handleConfirm} variant="primary">
          {t('button.save_changes')}
        </Button>
        <Button onClick={onClose} variant="secondary">
          {t('button.cancel')}
        </Button>
      </div>
    </div>
  )
}
