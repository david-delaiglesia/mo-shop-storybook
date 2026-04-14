import { bool, func, object } from 'prop-types'

import { compose } from '@mercadona/mo.library.dashtil'
import { Button } from '@mercadona/mo.library.shop-ui/button'

import { withTranslate } from 'app/i18n/containers/i18n-provider'
import Input from 'system-ui/input'

import './styles/CheckoutCheckUser.css'

const CheckoutCheckUser = ({ onSubmit, onChange, isLoading, form, t }) => {
  const { email } = form.fields

  const onSubmitForm = (event) => {
    event.preventDefault()
    onSubmit(event)
  }

  return (
    <form
      className="checkout-check-user"
      aria-labelledby="checkout-check-user-title"
      onSubmit={onSubmitForm}
    >
      <h4
        id="checkout-check-user-title"
        className="checkout-check-user__title headline1-b"
      >
        {t('checkout_check_user.title')}
      </h4>
      <p className="checkout-check-user__message subhead1-sb">
        {t('checkout_check_user.message')}
      </p>
      <label className="checkout-check-user__label subhead1-r">
        {t('checkout_check_user.label')}
      </label>
      <Input
        name="email"
        label="input.email"
        value={email.value}
        onChange={onChange}
        validation={email.validation}
        autoFocus
      />
      <Button
        variant="primary"
        type="submit"
        disabled={!form.isValid}
        loading={isLoading}
        loadingText={t('aria_loading')}
      >
        {t('button.go_on')}
      </Button>
    </form>
  )
}

CheckoutCheckUser.propTypes = {
  onSubmit: func.isRequired,
  onChange: func.isRequired,
  isLoading: bool.isRequired,
  t: func.isRequired,
  form: object,
}

const ComposedCheckoutCheckUser = compose(withTranslate)(CheckoutCheckUser)

export { ComposedCheckoutCheckUser as CheckoutCheckUser }
