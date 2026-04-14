import { useTranslation } from 'react-i18next'

import { element, func, object } from 'prop-types'

import { Icon } from '@mercadona/mo.library.shop-ui/icon/Icon'
import { BaseModal } from '@mercadona/mo.library.shop-ui/modal'

import './TokenAuthnPaymentModal.css'

const TokenAuthnPaymentModal = ({ onClose, children, paymentMethod }) => {
  const { t } = useTranslation()

  return (
    <BaseModal
      className="token-authn-payment-modal"
      onClose={onClose}
      aria-label={
        paymentMethod === undefined
          ? t('token_authn_step_two_title')
          : t('commons.order.order_payment.payment_list.add_payment')
      }
    >
      <button
        type="button"
        className="token-authn-payment-modal__close-button"
        onClick={onClose}
        aria-label={t('alerts_close')}
      >
        <Icon icon="close" />
      </button>
      <h2 className="token-authn-payment-modal__title title2-b">
        {paymentMethod === undefined
          ? t('token_authn_step_two_title')
          : t('commons.order.order_payment.payment_list.add_payment')}
      </h2>
      {children}
    </BaseModal>
  )
}

TokenAuthnPaymentModal.propTypes = {
  children: element.isRequired,
  onClose: func.isRequired,
  paymentMethod: object,
}

export { TokenAuthnPaymentModal }
