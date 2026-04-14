import { Component } from 'react'
import { connect } from 'react-redux'

import { bool, func, shape, string } from 'prop-types'

import { createThunk } from '@mercadona/mo.library.dashtil'

import { AuthMetrics } from 'app/authentication/AuthMetrics'
import { AuthClient } from 'app/authentication/client'
import { register } from 'app/authentication/commands'
import { SOURCES } from 'app/authentication/metrics'
import { showAlert } from 'app/shared/alert/actions'
import { HTTP_STATUS, NetworkError } from 'services/http'
import { Tracker } from 'services/tracker'
import {
  getDefaultValidation,
  getNameValidation,
  getPasswordValidation,
  getPositiveValidation,
  getUpdatedFormValidation,
} from 'utils/input-validators'
import { clearPendingAction } from 'wrappers/feedback/actions'

class SignUpContainer extends Component {
  state = {
    form: {
      fields: {
        username: {
          value: '',
          validation: getDefaultValidation(),
          getValidation: getNameValidation,
        },
        password: {
          value: '',
          validation: getDefaultValidation(),
          getValidation: getPasswordValidation,
        },
        last_name: {
          value: '',
          validation: getPositiveValidation(),
          getValidation: getPositiveValidation,
        },
      },
      isValid: false,
    },
    didAcceptTerms: false,
  }

  onChange = (event) => {
    const { name, value } = event.target
    this.setState((state) => ({
      form: getUpdatedFormValidation(state.form, name, value),
    }))
  }

  onCheckTerms = () => {
    this.setState((state) => ({ didAcceptTerms: !state.didAcceptTerms }))
  }

  signUp = async () => {
    const { username, password, last_name } = this.state.form.fields
    const { email, session } = this.props
    const lastName = last_name.value
    const name = username.value.trim()
    const userInfo = {
      name,
      password: password.value.trim(),
      email,
      current_postal_code: session.postalCode,
      last_name: lastName,
    }

    const source = this.props.isBeingAuthorizedFromCheckout
      ? SOURCES.CHECKOUT
      : SOURCES.PROFILE
    AuthMetrics.authCreateAccountClick({ email, source })

    try {
      const { user, auth } = await AuthClient.register(userInfo)
      this.onSignUpSuccess(user, auth)
    } catch (error) {
      this.onSignUpError(error)
    }
  }

  onSignUpSuccess = (user, auth) => {
    const { email, register, close } = this.props

    AuthMetrics.authCreateAccountSuccess({ email })
    register(user, auth)
    this.updateMetricsProperties(user)
    close()
  }

  updateMetricsProperties = (user) => {
    const { uuid, email } = user

    Tracker.setUserProperties({ email, created: new Date() })
    Tracker.setSuperProperties()
    Tracker.registerNewUser(uuid)
  }

  onSignUpError = (error) => {
    const { email } = this.props
    this.props.clearPendingAction()

    AuthMetrics.authCreateAccountError({ email, error_type: 'unknown' })

    if (error.status === HTTP_STATUS.CONFLICT) {
      const alert = {
        title: 'alerts.409.signup.title',
        description: 'alerts.409.signup.message',
      }
      this.props.showAlert(alert)
      return
    }

    NetworkError.publish(error)
  }

  render() {
    const { goBack, email, signUpComponent: SignUpComponent } = this.props
    const { form, didAcceptTerms } = this.state

    return (
      <SignUpComponent
        goBack={goBack}
        onSubmit={this.signUp}
        onChange={this.onChange}
        onCheck={this.onCheckTerms}
        onEnterKeyPress={this.signUp}
        shouldPerformKeyPress={form.isValid && didAcceptTerms}
        form={form}
        email={email}
        didAcceptTerms={didAcceptTerms}
      />
    )
  }
}

SignUpContainer.propTypes = {
  email: string.isRequired,
  isBeingAuthorizedFromCheckout: bool,
  goBack: func,
  close: func.isRequired,
  signUpComponent: func.isRequired,
  session: shape({
    postalCode: string.isRequired,
  }).isRequired,
  clearPendingAction: func.isRequired,
  register: func.isRequired,
  showAlert: func.isRequired,
}

const mapStateToProps = ({ session }) => ({ session })

const mapDispatchToProps = {
  register: createThunk(register),
  clearPendingAction,
  showAlert,
}

const ConnectedSignUpContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(SignUpContainer)

export { ConnectedSignUpContainer as SignUpContainer }
