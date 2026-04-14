import { PureComponent, createRef } from 'react'
import { connect } from 'react-redux'

import ChangeEmailModal from '../../components/change-email-modal'
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux'

import { AuthClient } from 'app/authentication/client'
import { withTranslate } from 'app/i18n/containers/i18n-provider'
import { modifyLoggedUser } from 'app/user/actions'
import {
  sendChangeEmailCancelClickMetrics,
  sendChangeEmailSaveClickMetrics,
} from 'app/user/metrics'
import { HTTP_STATUS, NetworkError } from 'services/http'
import { Tracker } from 'services/tracker'
import {
  getDefaultValidation,
  getEmailValidation,
  getPasswordValidation,
  getUpdatedFormValidation,
} from 'utils/input-validators'

class ChangeEmailModalContainer extends PureComponent {
  constructor(props) {
    super(props)

    this.defaultValidation = getDefaultValidation()

    this.state = {
      form: {
        fields: {
          email: {
            value: undefined,
            validation: this.defaultValidation,
            getValidation: getEmailValidation,
          },
          password: {
            value: undefined,
            validation: this.defaultValidation,
            getValidation: getPasswordValidation,
          },
        },
        isValid: false,
      },
      httpError: null,
    }

    this.passwordRef = createRef()

    this.changeEmail = this.changeEmail.bind(this)
    this.onChange = this.onChange.bind(this)
    this.handlePasswordError = this.handlePasswordError.bind(this)
    this.handleEmailError = this.handleEmailError.bind(this)
  }

  async changeEmail(event) {
    event.preventDefault()
    const { form } = this.state
    if (!form.isValid) {
      return
    }

    sendChangeEmailSaveClickMetrics(form.fields.email.value)

    try {
      const { email, password } = form.fields
      const { userUuid, onClose, actions } = this.props
      await AuthClient.changeUserEmail(userUuid, email.value, password.value)
      actions.modifyLoggedUser('email', email.value)
      Tracker.setUserProperties({ email: email.value })
      onClose()
    } catch (error) {
      if (error.status === HTTP_STATUS.FORBIDDEN) {
        return this.handlePasswordError()
      }

      if (error.status === HTTP_STATUS.CONFLICT) {
        return this.handleEmailError()
      }

      NetworkError.publish(error)
    }
  }

  handlePasswordError() {
    this.setState(({ form: { fields } }) => ({
      form: {
        isValid: false,
        fields: {
          ...fields,
          password: {
            ...fields.password,
            validation: {
              type: 'error',
              message: this.props.t('sign_up.error'),
            },
          },
        },
      },
    }))

    this.passwordRef.current.blur()
  }

  handleEmailError() {
    this.setState(({ form: { fields } }) => ({
      form: {
        isValid: false,
        fields: {
          ...fields,
          email: {
            ...fields.email,
            validation: {
              type: 'error',
              message: this.props.t('validation_errors.wrong_email_format'),
            },
          },
        },
      },
    }))
  }

  onChange(event) {
    const { name, value } = event.target
    this.setState({
      form: getUpdatedFormValidation(this.state.form, name, value),
    })
  }

  onCloseWithMetrics = () => {
    sendChangeEmailCancelClickMetrics()
    this.props.onClose()
  }

  render() {
    const { form, httpError } = this.state

    return (
      <ChangeEmailModal
        httpError={httpError}
        onChange={this.onChange}
        onCancel={this.onCloseWithMetrics}
        onConfirm={this.changeEmail}
        form={form}
        shouldPerformKeyPress={form.isValid}
        passwordRef={this.passwordRef}
      />
    )
  }
}

ChangeEmailModalContainer.propTypes = {
  userUuid: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  actions: PropTypes.shape({
    modifyLoggedUser: PropTypes.func.isRequired,
  }).isRequired,
  t: PropTypes.func.isRequired,
}

const mapStateToProps = ({ session }) => ({
  userUuid: session.uuid,
})

const mapDispatchToProps = (dispatch) => ({
  actions: {
    modifyLoggedUser: bindActionCreators(modifyLoggedUser, dispatch),
  },
})

const ConnectedChangeEmailModalContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ChangeEmailModalContainer)

const ComposedChangeEmailModalContainer = withTranslate(
  ConnectedChangeEmailModalContainer,
)

export { ComposedChangeEmailModalContainer as ChangeEmailModalContainer }
