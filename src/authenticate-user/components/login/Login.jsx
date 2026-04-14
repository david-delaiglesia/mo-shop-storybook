import { useEffect } from 'react'

import PropTypes from 'prop-types'

import { AuthMetrics } from 'app/authentication/AuthMetrics'
import { withTranslate } from 'app/i18n/containers/i18n-provider'
import Button, { ButtonWithFeedback } from 'components/button'
import logo from 'system-ui/assets/img/logo-horizontal.svg'
import { InputPassword } from 'system-ui/input'
import { TAB_INDEX } from 'utils/constants'

import './assets/Login.css'

const Login = ({
  goBack,
  email,
  onChange,
  onSubmit,
  onRecoverPassword,
  form,
  passwordRef,
  t,
}) => {
  const { password } = form.fields

  useEffect(() => {
    AuthMetrics.authLoginView({ email })
  }, [])

  return (
    <form className="login" onSubmit={onSubmit}>
      <img alt="logo" src={logo} />
      <h4 className="login__title title2-b">{t('login.title')}</h4>
      <input
        className="login__hidden-email"
        type="email"
        name="email"
        tabIndex={TAB_INDEX.DISABLED}
        aria-hidden="true"
        spellCheck="false"
        value={email}
        autoComplete="off"
        readOnly
      />
      <label>{t('login.label')}</label>
      <InputPassword
        validation={password.validation}
        label="input.password"
        password={password.value}
        onChange={onChange}
        autoComplete="current-password"
        passwordCanBeShown
        autoFocus
        reference={passwordRef}
      />
      <button
        className="footnote1-r login__remember-password"
        type="button"
        onClick={onRecoverPassword}
      >
        {t('login.remember_password')}
      </button>
      <ButtonWithFeedback
        buttonType="submit"
        text="button.enter"
        onClick={onSubmit}
        datatest="do-login"
      />
      <Button text="button.back" onClick={goBack} />
    </form>
  )
}

Login.propTypes = {
  email: PropTypes.string,
  goBack: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  onRecoverPassword: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  form: PropTypes.shape({
    fields: PropTypes.object.isRequired,
  }).isRequired,
  passwordRef: PropTypes.oneOfType([PropTypes.func, PropTypes.object])
    .isRequired,
}

const LoginWithTranslate = withTranslate(Login)

export { LoginWithTranslate as Login }
