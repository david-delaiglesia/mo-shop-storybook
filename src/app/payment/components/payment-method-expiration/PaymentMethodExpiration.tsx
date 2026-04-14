import { useTranslation } from 'react-i18next'

import classNames from 'classnames'

import { PaymentMethod } from 'app/payment/interfaces'
import { Card } from 'domain/card'

import './PaymentMethodExpiration.css'

interface PaymentMethodExpirationProps {
  paymentMethod: Pick<
    PaymentMethod,
    'expirationStatus' | 'expiresMonth' | 'expiresYear'
  >
  className?: string
}

export const PaymentMethodExpiration = ({
  paymentMethod,
  className,
}: PaymentMethodExpirationProps) => {
  const { t } = useTranslation()
  const expiryDate = Card.getExpiryDateMMYY(paymentMethod)

  return (
    <span
      className={classNames(
        'payment-method-expiration subhead1-r',
        `payment-method-expiration--${paymentMethod.expirationStatus}`,
        className,
      )}
    >
      {t(`cells.payment.${paymentMethod.expirationStatus}`, { expiryDate })}
    </span>
  )
}
