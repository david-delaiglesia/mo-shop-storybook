import StrengthBar from '../../components/strength-bar'
import { Support } from '../../services/support'
import Logo from '../../system-ui/assets/img/logo-horizontal.svg'
import { InputPassword } from '../../system-ui/input'
import withEnterKeyPress from '../../wrappers/enter-key-press'
import { bool, func, shape, string } from 'prop-types'

import { Button } from '@mercadona/mo.library.shop-ui/button'

import { useChatContext } from 'app/chat/contexts/useChatContext'
import { ChatHelpSources } from 'app/chat/metrics'
import { withTranslate } from 'app/i18n/containers/i18n-provider'
import { knownFeatureFlags, useFlag } from 'services/feature-flags'

import './assets/PasswordRecoveryLayout.css'

const PasswordRecoveryLayout = ({
  form,
  onChange,
  onSubmit,
  recoverPassword,
  t,
}) => {
  const { password } = form.fields
  const isActiveNewChat = useFlag(knownFeatureFlags.NEW_SUPPORT_CHAT)
  const chatContext = useChatContext()

  const openSupportChat = () => {
    if (!isActiveNewChat) {
      Support.openWidget()
      return
    }

    chatContext?.open(ChatHelpSources.RESTORE_PASSWORD)
  }

  return (
    <div className="password-recovery-layout" data-testid="password-recovery">
      <img src={Logo} alt="" className="password-recovery-layout__logo" />
      <h3 className="password-recovery-layout__title title2-b">
        {t('reset_password_title')}
      </h3>
      <p className="password-recovery-layout__description body1-r">
        {t('reset_password_subtitle')}
      </p>
      <form className="password-recovery-layout__form" onSubmit={onSubmit}>
        <label className="password-recovery-layout__label">
          {t('reset_password_new_password_title')}
        </label>
        <InputPassword
          label="reset_password_new_password_placeholder"
          onChange={onChange}
          password={password.value}
          validation={password.validation}
          passwordCanBeShown
        />
        <StrengthBar password={password.value} />
        <Button
          variant="primary"
          fullWidth
          onClick={recoverPassword}
          disabled={!form.isValid}
        >
          {t('reset_password_cta_button')}
        </Button>
      </form>
      <div className="password-recovery-layout__contact">
        <button onClick={openSupportChat}>
          {t('reset_password_help_button')}
        </button>
      </div>
    </div>
  )
}

PasswordRecoveryLayout.propTypes = {
  form: shape({
    fields: shape({
      password: shape({
        value: string,
        validation: shape({
          message: string,
          type: string.isRequired,
        }).isRequired,
      }).isRequired,
    }).isRequired,
    isValid: bool.isRequired,
  }).isRequired,
  onChange: func.isRequired,
  onSubmit: func.isRequired,
  recoverPassword: func.isRequired,
  t: func.isRequired,
}

export const PlainPasswordRecoveryLayout = PasswordRecoveryLayout

const PasswordRecoveryLayoutWithEnterKeyPress = withEnterKeyPress(
  PasswordRecoveryLayout,
)

export default withTranslate(PasswordRecoveryLayoutWithEnterKeyPress)
