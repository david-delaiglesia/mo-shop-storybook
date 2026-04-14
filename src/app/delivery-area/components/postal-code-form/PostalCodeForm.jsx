import { useTranslation } from 'react-i18next'

import { bool, func, shape, string } from 'prop-types'

import { Button } from '@mercadona/mo.library.shop-ui/button'

import Modal from 'components/modal'
import Input from 'system-ui/input'

import './PostalCodeForm.css'

const PostalCodeForm = ({
  form,
  available,
  onChange,
  onSave,
  onSaveButtonText,
  onCancel,
  isLoading,
}) => {
  const { t } = useTranslation()
  const { postalCode } = form.fields
  return (
    <form className="postal-code-form" onSubmit={onSave}>
      <Modal onClose={onCancel} isFocusDisabled>
        <h3 className="title2-b">{t('commons.postal_code_form.title')}</h3>
        <div className="posta-code-form__input">
          <Input
            name="postalCode"
            label="input.postal_code"
            value={postalCode.value}
            validation={postalCode.validation}
            onChange={onChange}
            maxLength={5}
            autoFocus
            datatest="postal-code-field"
          />
          {!available ? (
            <p className="postal-code-form__error">
              {t('commons.postal_code_form.error')}
            </p>
          ) : (
            <p className="postal-code-form__error"></p>
          )}
        </div>
        <div className="postal-code-form__buttons">
          <Button onClick={onCancel} variant="secondary" fullWidth>
            {t('button.cancel')}
          </Button>
          <Button
            datatest="change-postal-code"
            disabled={!form.isValid}
            fullWidth
            loading={isLoading}
            type="submit"
            variant="primary"
          >
            {t(onSaveButtonText)}
          </Button>
        </div>
      </Modal>
    </form>
  )
}

PostalCodeForm.propTypes = {
  onSave: func.isRequired,
  onSaveButtonText: string.isRequired,
  onCancel: func.isRequired,
  onChange: func.isRequired,
  form: shape({
    fields: shape({
      postalCode: shape({
        validation: shape({
          message: string,
          type: string.isRequired,
        }).isRequired,
      }).isRequired,
    }).isRequired,
    isValid: bool.isRequired,
  }).isRequired,
  available: bool,
  isLoading: bool,
}

export default PostalCodeForm
