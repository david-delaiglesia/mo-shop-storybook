import { Component } from 'react'

import { func } from 'prop-types'

import { AuthMetrics } from 'app/authentication'
import { AuthClient } from 'app/authentication/client'
import {
  getDefaultValidation,
  getEmailValidation,
  getUpdatedFormValidation,
} from 'utils/input-validators'

class CheckUserContainer extends Component {
  defaultValidation = getDefaultValidation()
  state = {
    isLoading: false,
    form: {
      fields: {
        email: {
          value: '',
          validation: this.defaultValidation,
          getValidation: getEmailValidation,
        },
      },
      isValid: false,
    },
  }

  checkUser = async () => {
    const { onCheckUserSuccess } = this.props
    const { email } = this.state.form.fields
    AuthMetrics.authContinueClick({ email: email.value })
    this.setState({ isLoading: true })

    const response = await AuthClient.checkEmail({ email: email.value })

    if (!response) return

    const { account_exists: accountExists } = response
    this.setState({ isLoading: false })
    onCheckUserSuccess(email.value, accountExists)
  }

  onChange = (event) => {
    const { name, value } = event.target
    this.setState((state) => ({
      form: getUpdatedFormValidation(state.form, name, value),
    }))
  }

  render = () => {
    const { form, isLoading } = this.state
    const { checkUserComponent: CheckUserComponent } = this.props

    return (
      <CheckUserComponent
        onCancel={this.props.onCancel}
        onSubmit={this.checkUser}
        onChange={this.onChange}
        form={form}
        shouldPerformKeyPress={form.isValid}
        isLoading={isLoading}
      />
    )
  }
}

CheckUserContainer.propTypes = {
  onCancel: func.isRequired,
  onCheckUserSuccess: func.isRequired,
  checkUserComponent: func.isRequired,
}

export { CheckUserContainer }
