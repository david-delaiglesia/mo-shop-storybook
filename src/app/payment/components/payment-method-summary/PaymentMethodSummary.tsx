import { useTranslation } from 'react-i18next'

import { PaymentMethodUtil } from 'app/payment/PaymentMethodUtil'
import { PaymentMethod } from 'app/payment/interfaces'
import { TAB_INDEX } from 'utils/constants'

import './PaymentMethodSummary.css'

interface PaymentMethodSummaryProps {
  paymentMethod: PaymentMethod
}

export const PaymentMethodSummary = ({
  paymentMethod,
}: PaymentMethodSummaryProps) => {
  const { t } = useTranslation()

  return (
    <div
      className="payment-method-summary"
      aria-label={`${t('commons.order.order_payment.payment_list.title')} ${PaymentMethodUtil.getAriaLabel(paymentMethod)}`}
      tabIndex={TAB_INDEX.ENABLED}
    >
      <img
        className="payment-method-summary__icon"
        src={paymentMethod.uiContent.icon.url}
      />
      <span className="payment-method-summary__title body1-b">
        {paymentMethod.uiContent.title}
      </span>
      <span className="payment-method-summary__subtitle subhead1-r">
        {paymentMethod.uiContent.subtitle}
      </span>
    </div>
  )
}
