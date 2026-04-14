import { useTranslation } from 'react-i18next'

import {
  ChevronRightIcon,
  IconComponentType,
} from '@mercadona/mo.library.icons'

import { BizumIcon } from 'app/payment/bizum-icon'
import { CreditCardIcon } from 'app/payment/credit-card-icon'
import { PaymentMethodType } from 'app/payment/interfaces'

import './PaymentMethodTypeButton.css'

interface PaymentMethodTypeButtonProps {
  paymentMethodType: PaymentMethodType
  onClick: () => void
}

const paymentMethodTypeIcon: Record<PaymentMethodType, IconComponentType> = {
  [PaymentMethodType.CREDIT_CARD]: CreditCardIcon,
  [PaymentMethodType.BIZUM]: BizumIcon,
}

export const PaymentMethodTypeButton = ({
  paymentMethodType,
  onClick,
}: PaymentMethodTypeButtonProps) => {
  const { t } = useTranslation()

  const IconComponent = paymentMethodTypeIcon[paymentMethodType]

  return (
    <button onClick={onClick} className="payment-method-type-button body1-sb">
      <div className="payment-method-type-button__content">
        <IconComponent size={32} />
        {t(`payment_method_type.${paymentMethodType}`)}
      </div>
      <ChevronRightIcon
        size={16}
        className="payment-method-type-button__chevron"
      />
    </button>
  )
}
