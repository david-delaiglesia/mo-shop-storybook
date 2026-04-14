import { useTranslation } from 'react-i18next'

import bankImage from './assets/bank.png'
import orderImage from './assets/order.png'
import weightImage from './assets/weight.png'

import './SCACheckoutModalInfo.css'

export const SCACheckoutModalInfo = () => {
  const { t } = useTranslation()

  return (
    <div className="sca-checkout-modal">
      <div className="sca-checkout-modal__info">
        <img alt="" className="sca-checkout-modal__image" src={bankImage} />
        <p className="body1-r">
          {t('checkout_payment_changes_alert_explanation_1')}
        </p>
      </div>
      <div className="sca-checkout-modal__info">
        <img alt="" className="sca-checkout-modal__image" src={weightImage} />
        <p className="body1-r">
          {t('checkout_payment_changes_alert_explanation_2')}
        </p>
      </div>
      <div className="sca-checkout-modal__info">
        <img alt="" className="sca-checkout-modal__image" src={orderImage} />
        <p className="body1-r">
          {t('checkout_payment_changes_alert_explanation_3')}
        </p>
      </div>
    </div>
  )
}
