import PropTypes from 'prop-types'

import { withTranslate } from 'app/i18n/containers/i18n-provider'
import Button from 'components/button'
import { TAB_INDEX } from 'utils/constants'

import './assets/PasswordRecovery.css'

const PasswordRecovery = ({ email, onConfirm, t }) => (
  <div className="password-recovery">
    <h1
      className="password-recovery__title title2-b"
      tabIndex={TAB_INDEX.ENABLED}
    >
      {t('login.recovery_password.title')}
    </h1>
    <p className="password-recovery__message" tabIndex={TAB_INDEX.ENABLED}>
      {t('login.recovery_password.text', { email: email })}
    </p>
    <Button text={t('button.agreed')} onClick={onConfirm}></Button>
  </div>
)

PasswordRecovery.propTypes = {
  email: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
}

export const PlainPasswordRecovery = PasswordRecovery

export default withTranslate(PasswordRecovery)
