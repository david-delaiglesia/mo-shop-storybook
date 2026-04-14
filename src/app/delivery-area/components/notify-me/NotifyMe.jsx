import { func, object, shape } from 'prop-types'

import { withTranslate } from 'app/i18n/containers/i18n-provider'
import Button, { ButtonWithFeedback } from 'components/button'
import Input from 'system-ui/input'
import { TAB_INDEX } from 'utils/constants'
import withEnterKeyPress from 'wrappers/enter-key-press'

import './styles/NotifyMe.css'

const NotifyMe = ({
  onEnterKeyPress,
  form,
  notifyMe,
  cancelNotifyMe,
  onChange,
  t,
}) => {
  const { email, postalCode } = form.fields

  return (
    <div className="notify-me" data-testid="notify-me">
      <p className="notify-me__title" tabIndex={TAB_INDEX.ENABLED}>
        {t('onboarding_notify_me_title')}
      </p>
      <form onKeyPress={onEnterKeyPress}>
        <Input
          name="email"
          label="input.email"
          datatest="notify-me-email-input"
          value={email.value}
          validation={email.validation}
          onChange={onChange}
          autoFocus
        />
        <Input
          name="postalCode"
          label="input.postal_code"
          datatest="notify-me-postal-code-input"
          value={postalCode.value}
          validation={postalCode.validation}
          onChange={onChange}
          maxLength={5}
        />
        <div className="notify-me__buttons">
          <Button
            className="notify-me__cancel"
            type="secondary"
            text="button.cancel"
            onClick={cancelNotifyMe}
          />
          <ButtonWithFeedback
            text="onboarding_notify_me_send_button"
            datatest="notify-me-send-button"
            onClick={notifyMe}
            isAsync={form.isValid}
          />
        </div>
      </form>
    </div>
  )
}

NotifyMe.propTypes = {
  form: shape({
    fields: shape({
      email: object.isRequired,
      postalCode: object.isRequired,
    }).isRequired,
  }).isRequired,
  notifyMe: func.isRequired,
  cancelNotifyMe: func.isRequired,
  onChange: func.isRequired,
  onEnterKeyPress: func.isRequired,
  t: func.isRequired,
}

const ComposedNotifyMe = withTranslate(withEnterKeyPress(NotifyMe))

export { ComposedNotifyMe as NotifyMe }
