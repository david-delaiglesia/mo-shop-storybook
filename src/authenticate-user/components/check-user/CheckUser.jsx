import { useTranslation } from 'react-i18next'

import { bool, func, object, shape } from 'prop-types'

import { Button } from '@mercadona/mo.library.shop-ui/button'

import logo from 'system-ui/assets/img/logo-horizontal.svg'
import Input from 'system-ui/input'
import { TAB_INDEX } from 'utils/constants'

import './assets/CheckUser.css'

const CheckUser = ({ onSubmit, onChange, onCancel, isLoading, form }) => {
  const { t } = useTranslation()
  const { email } = form.fields

  const onSubmitForm = (event) => {
    event.preventDefault()
    onSubmit(event)
  }

  return (
    <form className="check-user" onSubmit={onSubmitForm}>
      <img src={logo} alt="" />
      <h1 className="check-user__title title2-b" tabIndex={TAB_INDEX.ENABLED}>
        {t('login.check_user.title')}
      </h1>
      <h2 tabIndex={TAB_INDEX.ENABLED}>{t('login.check_user.label')}</h2>
      <Input
        name="email"
        label="input.email"
        value={email.value}
        onChange={onChange}
        validation={email.validation}
      />
      <Button
        variant="primary"
        type="submit"
        disabled={!form.isValid}
        loading={isLoading}
        loadingText={t('aria_loading')}
        fullWidth
        data-testid="check-user"
      >
        {t('button.next')}
      </Button>
      <Button
        variant="quaternary"
        mood="neutral"
        onClick={onCancel}
        fullWidth
        data-testid="cancel-check-user"
      >
        {t('button.cancel')}
      </Button>
    </form>
  )
}

CheckUser.propTypes = {
  onSubmit: func.isRequired,
  onChange: func.isRequired,
  onCancel: func.isRequired,
  form: shape({
    fields: object.isRequired,
    isValid: bool.isRequired,
  }).isRequired,
  isLoading: bool.isRequired,
}

export default CheckUser
