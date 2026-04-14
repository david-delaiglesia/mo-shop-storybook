import { Component } from 'react'

import { func, object, shape } from 'prop-types'
import { compose } from 'redux'

import { VIEW_CHANGE_EVENTS } from 'app/delivery-area/constants'
import { withTranslate } from 'app/i18n/containers/i18n-provider'
import { ButtonWithFeedback } from 'components/button'
import Modal from 'components/modal'
import { Tracker } from 'services/tracker'
import logo from 'system-ui/assets/img/centered-logo.svg'
import Input from 'system-ui/input'
import { TAB_INDEX } from 'utils/constants'
import withEnterKeyPress from 'wrappers/enter-key-press'

import './styles/PostalCodeChecker.css'

class PostalCodeChecker extends Component {
  componentDidMount() {
    Tracker.sendViewChange(VIEW_CHANGE_EVENTS.VOYEUR_MODAL)
  }

  render() {
    const { onSave, onChange, form, onEnterKeyPress, t } = this.props
    const { postalCode } = form.fields

    return (
      <Modal clickout={false} blockScroll>
        <form
          className="postal-code-checker"
          data-testid="postal-code-checker"
          onKeyPress={onEnterKeyPress}
        >
          <img className="postal-code-checker__logo" alt="logo" src={logo} />
          <p
            className="body1-sb postal-code-checker__subtitle"
            tabIndex={TAB_INDEX.ENABLED}
          >
            {t('enter_postal_code_modal_title')}
          </p>
          <Input
            name="postalCode"
            label="input.postal_code"
            size="big"
            value={postalCode.value}
            datatest="postal-code-checker-input"
            validation={postalCode.validation}
            onChange={onChange}
            maxLength={5}
            autoFocus
          />
          <ButtonWithFeedback
            onClick={onSave}
            text="button.go_on"
            datatest="postal-code-checker-button"
            size="big"
            icon="forward-28"
            isAsync={form.isValid}
          />
        </form>
      </Modal>
    )
  }
}

PostalCodeChecker.propTypes = {
  onSave: func.isRequired,
  onEnterKeyPress: func.isRequired,
  onChange: func.isRequired,
  form: shape({
    fields: shape({
      postalCode: shape({
        validation: object.isRequired,
      }).isRequired,
    }).isRequired,
  }).isRequired,
  t: func.isRequired,
}

const ComposedPostalCodeChecker = compose(
  withEnterKeyPress,
  withTranslate,
)(PostalCodeChecker)

export { ComposedPostalCodeChecker as PostalCodeChecker }
