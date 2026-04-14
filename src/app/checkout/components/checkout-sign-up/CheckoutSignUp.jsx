import { bool, func, object, shape, string } from 'prop-types'

import { compose } from '@mercadona/mo.library.dashtil'

import { withTranslate } from 'app/i18n/containers/i18n-provider'
import { ButtonWithFeedback } from 'components/button'
import StrengthBar from 'components/strength-bar'
import { TermsAndConditions } from 'components/terms-and-conditions'
import Checkbox from 'system-ui/checkbox'
import Input, { InputPassword } from 'system-ui/input'
import withEnterKeyPress from 'wrappers/enter-key-press'

import './styles/CheckoutSignUp.css'

const CheckoutSignUp = ({
  onEnterKeyPress,
  onSubmit,
  onChange,
  onCheck,
  form,
  email,
  didAcceptTerms = false,
  t,
}) => {
  const { username, last_name, password } = form.fields

  return (
    <form
      className="checkout-sign-up"
      aria-labelledby="checkout-sign-up-title"
      onKeyPress={onEnterKeyPress}
    >
      <h4
        id="checkout-sign-up-title"
        className="checkout-sign-up__title headline1-b"
      >
        {t('checkout_sign_up.title')}
      </h4>
      <p className="checkout-sign-up__message subhead1-sb">
        {t('checkout_sign_up.message')}
      </p>
      <label className="subhead1-r checkout-sign-up__name">
        {t('checkout_sign_up.name')}
      </label>
      <Input
        name="username"
        label="input.name"
        value={username.value}
        validation={username.validation}
        onChange={onChange}
        autoFocus
      />
      <label className="subhead1-r checkout-sign-up__surname">
        {t('checkout_sign_up.surname')}
      </label>
      <Input
        name="last_name"
        label="input.surname"
        value={last_name.value}
        validation={last_name.validation}
        onChange={onChange}
      />
      <label className="subhead1-r checkout-sign-up__password">
        {t('checkout_sign_up.password')}
      </label>
      <InputPassword
        label="input.password"
        password={password.value}
        validation={password.validation}
        onChange={onChange}
        passwordCanBeShown
      />
      <StrengthBar password={password.value} email={email} />
      <label className="checkout-sign-up__warning">
        <Checkbox
          inputLabel="input.policy"
          onChange={onCheck}
          checked={didAcceptTerms}
        />
        <TermsAndConditions flow="checkout-signup" />
      </label>
      <ButtonWithFeedback
        disabled={!form.isValid || !didAcceptTerms}
        text="button.go_on"
        onClick={onSubmit}
      />
    </form>
  )
}

CheckoutSignUp.propTypes = {
  onSubmit: func.isRequired,
  onChange: func.isRequired,
  onCheck: func.isRequired,
  onEnterKeyPress: func.isRequired,
  form: shape({
    fields: object.isRequired,
    isValid: bool,
  }),
  email: string.isRequired,
  didAcceptTerms: bool,
  t: func.isRequired,
}

export const PlainCheckoutSignUp = CheckoutSignUp

const ComposedCheckoutSignUp = compose(
  withEnterKeyPress,
  withTranslate,
)(CheckoutSignUp)

export { ComposedCheckoutSignUp as CheckoutSignUp }
