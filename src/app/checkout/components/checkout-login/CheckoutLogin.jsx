import { func, object, oneOfType, shape, string } from 'prop-types'

import { withTranslate } from 'app/i18n/containers/i18n-provider'
import { ButtonWithFeedback } from 'components/button'
import { InputPassword } from 'system-ui/input'
import { TAB_INDEX } from 'utils/constants'

import './styles/CheckoutLogin.css'

const CheckoutLogin = ({
  onSubmit,
  onChange,
  email,
  form,
  onRecoverPassword,
  passwordRef,
  t,
}) => {
  const { password } = form.fields

  return (
    <form
      className="checkout-login"
      aria-labelledby="checkout-login-title"
      onSubmit={onSubmit}
    >
      <h4
        id="checkout-login-title"
        className="checkout-login__title headline1-b"
      >
        {t('checkout_login.title')}
      </h4>
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
      <p className="checkout-login__message subhead1-sb">
        {t('checkout_login.message')}
      </p>
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
        className="checkout-login__recover-pass footnote1-r"
        type="button"
        onClick={onRecoverPassword}
      >
        {t('checkout_login.remember_password')}
      </button>
      <ButtonWithFeedback
        buttonType="submit"
        text="button.go_on"
        onClick={onSubmit}
      />
    </form>
  )
}

CheckoutLogin.propTypes = {
  email: string,
  onSubmit: func.isRequired,
  onChange: func.isRequired,
  onRecoverPassword: func.isRequired,
  t: func.isRequired,
  form: shape({
    fields: object.isRequired,
  }).isRequired,
  passwordRef: oneOfType([func, object]).isRequired,
}

const ComposedCheckoutLogin = withTranslate(CheckoutLogin)

export { ComposedCheckoutLogin as CheckoutLogin }
