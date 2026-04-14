import { useTranslation } from 'react-i18next'

import paymentMethodsImage from './payment-methods.png'

import { Button } from '@mercadona/mo.library.shop-ui/button'

import { TAB_INDEX } from 'utils/constants'

import './PaymentMethodCTA.css'

interface PaymentMethodCTAProps {
  onClick: () => void
}

export const PaymentMethodCTA = ({ onClick }: PaymentMethodCTAProps) => {
  const { t } = useTranslation()

  return (
    <div className="payment-method-cta">
      <img
        className="payment-method-cta__image"
        src={paymentMethodsImage}
        aria-hidden
        width={120}
        height={120}
      />
      <div className="payment-method-cta__description">
        <h2
          className="payment-method-cta__title title2-b"
          tabIndex={TAB_INDEX.ENABLED}
        >
          {t('payment_method.empty.title')}
        </h2>
        <p
          className="payment-method-cta__message body1-r"
          tabIndex={TAB_INDEX.ENABLED}
        >
          {t('payment_method.empty.message')}
        </p>
      </div>
      <Button variant="secondary" onClick={onClick}>
        {t('payment_method.empty.action')}
      </Button>
    </div>
  )
}
