import PropTypes from 'prop-types'

import { withTranslate } from 'app/i18n/containers/i18n-provider'
import ModalInfo from 'components/modal-info'

const CheckoutPasswordRecovery = ({ t, email, onConfirm }) => (
  <ModalInfo
    title={t('checkout_remember_password.title')}
    description={t('checkout_remember_password.message', { email: email })}
    confirmButtonText={t('button.agreed')}
    onConfirm={onConfirm}
    onClose={onConfirm}
  />
)

CheckoutPasswordRecovery.propTypes = {
  email: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
}

export const ComposedCheckoutPasswordRecovery = withTranslate(
  CheckoutPasswordRecovery,
)

export { ComposedCheckoutPasswordRecovery as CheckoutPasswordRecovery }
