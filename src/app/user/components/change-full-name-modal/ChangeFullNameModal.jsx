import { bool, func, shape, string } from 'prop-types'

import { withTranslate } from 'app/i18n/containers/i18n-provider'
import Button from 'components/button'
import Modal from 'components/modal'
import Input from 'system-ui/input'
import withEnterKeyPress from 'wrappers/enter-key-press'

import './styles/ChangeFullNameModal.css'

const ChangeFullNameModal = ({
  onChange,
  onEnterKeyPress,
  onCancel,
  onConfirm,
  form,
  t,
}) => {
  const { name, last_name: lastName } = form.fields

  return (
    <form className="change-full-name-modal" onKeyPress={onEnterKeyPress}>
      <Modal onClose={onCancel}>
        <h3 className="change-full-name-modal__title title2-b">
          {t('user_area.personal_info.name.label')}
        </h3>
        <Input
          name="name"
          label="input.name"
          value={name.value}
          validation={name.validation}
          onChange={onChange}
          autoFocus
        />
        <Input
          name="last_name"
          label="input.surname"
          value={lastName.value}
          validation={lastName.validation}
          onChange={onChange}
        />
        <div className="change-full-name-modal__buttons">
          <Button
            text="button.cancel"
            onClick={onCancel}
            type="secondary"
            className="change-full-name-modal__cancel-button"
          />
          <Button
            text="button.save_changes"
            onClick={onConfirm}
            disabled={!form.isValid}
          />
        </div>
      </Modal>
    </form>
  )
}

ChangeFullNameModal.propTypes = {
  form: shape({
    fields: shape({
      name: shape({
        validation: shape({
          message: string,
          type: string.isRequired,
        }).isRequired,
      }).isRequired,
      last_name: shape({
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
  onEnterKeyPress: func.isRequired,
  onCancel: func.isRequired,
  onConfirm: func.isRequired,
  t: func.isRequired,
}

export const PlainChangeFullNameModal = ChangeFullNameModal

const ChangeFullNameModalWithEnterKeyPress =
  withEnterKeyPress(ChangeFullNameModal)

export default withTranslate(ChangeFullNameModalWithEnterKeyPress)
