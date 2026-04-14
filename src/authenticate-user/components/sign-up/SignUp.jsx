import { useEffect } from 'react'

import PropTypes from 'prop-types'

import { AuthMetrics } from 'app/authentication/AuthMetrics'
import { withTranslate } from 'app/i18n/containers/i18n-provider'
import Button, { ButtonWithFeedback } from 'components/button'
import StrengthBar from 'components/strength-bar'
import { TermsAndConditions } from 'components/terms-and-conditions'
import Checkbox from 'system-ui/checkbox'
import Input, { InputPassword } from 'system-ui/input'
import { TAB_INDEX } from 'utils/constants'
import withEnterKeyPress from 'wrappers/enter-key-press'

import './assets/SignUp.css'

const SignUp = ({
  onEnterKeyPress,
  goBack,
  onSubmit,
  onChange,
  onCheck,
  form,
  email,
  didAcceptTerms = false,
  t,
}) => {
  const { username, last_name, password } = form.fields

  useEffect(() => {
    AuthMetrics.authCreateAccountView({ email })
  }, [email])

  return (
    <form className="sign-up" onKeyPress={onEnterKeyPress}>
      <h1 className="sign-up__title title2-b" tabIndex={TAB_INDEX.ENABLED}>
        {t('sign_up.title')}
      </h1>
      <label>{t('sign_up.label')}</label>
      <Input
        name="username"
        label="input.name"
        value={username.value}
        onChange={onChange}
        validation={username.validation}
      />
      <label>{t('sign_up.surname')}</label>
      <Input
        name="last_name"
        label="input.surname"
        value={last_name.value}
        onChange={onChange}
        validation={last_name.validation}
      />
      <label tabIndex={TAB_INDEX.ENABLED}>{t('sign_up.password')}</label>
      <InputPassword
        label="input.password"
        password={password.value}
        onChange={onChange}
        validation={password.validation}
        passwordCanBeShown
      />
      <StrengthBar password={password.value} email={email} />
      <label className="terms-conditions">
        <Checkbox
          inputLabel={t('button.accept')}
          onChange={onCheck}
          checked={didAcceptTerms}
        />
        <TermsAndConditions flow="signup" />
      </label>
      <ButtonWithFeedback
        datatest="sign-up"
        disabled={!form.isValid || !didAcceptTerms}
        text="button.go_on"
        onClick={onSubmit}
      />
      <Button text="button.back" onClick={goBack} />
    </form>
  )
}

SignUp.propTypes = {
  goBack: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  onCheck: PropTypes.func.isRequired,
  onEnterKeyPress: PropTypes.func.isRequired,
  form: PropTypes.shape({
    fields: PropTypes.object.isRequired,
    isValid: PropTypes.bool,
  }),
  email: PropTypes.string.isRequired,
  didAcceptTerms: PropTypes.bool,
  t: PropTypes.func.isRequired,
}

export const PlainSignUp = SignUp

const SignUpWithEnterKeyPress = withEnterKeyPress(SignUp)

export default withTranslate(SignUpWithEnterKeyPress)
