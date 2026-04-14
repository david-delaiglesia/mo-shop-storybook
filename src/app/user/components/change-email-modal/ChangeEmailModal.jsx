import { bool, func, object, oneOfType, shape, string } from 'prop-types'

import { withTranslate } from 'app/i18n/containers/i18n-provider'
import Button from 'components/button'
import Modal from 'components/modal'
import Input, { InputPassword } from 'system-ui/input'
import withEnterKeyPress from 'wrappers/enter-key-press'

import './assets/ChangeEmailModal.css'

const ChangeEmailModal = ({
  onChange,
  onCancel,
  onConfirm,
  form,
  passwordRef,
  t,
}) => {
  const { email, password } = form.fields
  return (
    <form
      className="change-email-modal"
      aria-labelledby="change-email-modal-title"
      onSubmit={onConfirm}
    >
      <Modal onClose={onCancel}>
        <h3
          id="change-email-modal-title"
          className="change-email-modal__title title2-b"
        >
          {t('user_area.personal_info.change_email_modal.title')}
        </h3>
        <label className="change-email-modal__label body1-r">
          {t('user_area.personal_info.change_email_modal.email_label')}
        </label>
        <Input
          name="email"
          label="input.email"
          value={email.value}
          validation={email.validation}
          onChange={onChange}
          datatest="change-email-form-email"
          autoFocus
        />
        <label className="change-email-modal__label body1-r">
          {t('user_area.personal_info.change_email_modal.password_label')}
        </label>
        <InputPassword
          label="input.password"
          onChange={onChange}
          password={password.value}
          validation={password.validation}
          passwordCanBeShown
          reference={passwordRef}
          datatest="change-email-form-password"
        />
        <div className="change-email-modal__buttons">
          <Button text="button.cancel" onClick={onCancel} type="tertiary" />
          <Button
            buttonType="submit"
            text="user_area.personal_info.change_email_modal.confirm_button"
            onClick={onConfirm}
            disabled={!form.isValid}
            datatest="change-email-form-accept"
          />
        </div>
      </Modal>
    </form>
  )
}

ChangeEmailModal.propTypes = {
  form: shape({
    fields: shape({
      email: shape({
        validation: shape({
          message: string,
          type: string.isRequired,
        }).isRequired,
      }).isRequired,
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
  onCancel: func.isRequired,
  onConfirm: func.isRequired,
  passwordRef: oneOfType([func, object]).isRequired,
  t: func.isRequired,
}

export const PlainChangeEmailModal = ChangeEmailModal

const ChangeEmailModalWithEnterKeyPress = withEnterKeyPress(ChangeEmailModal)

export default withTranslate(ChangeEmailModalWithEnterKeyPress)
