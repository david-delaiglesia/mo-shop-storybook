import { Component } from 'react'
import { connect } from 'react-redux'

import ChangeFullNameModalMetrics from './ChangeFullNameModalMetrics'
import { func, number, shape, string } from 'prop-types'

import { AuthClient } from 'app/authentication/client'
import { setLoggedUser } from 'app/user/actions'
import ChangeFullNameModal from 'app/user/components/change-full-name-modal'
import {
  getDefaultValidation,
  getNameValidation,
  getPositiveValidation,
  getUpdatedFormValidation,
} from 'utils/input-validators'
import { withInteractionMetrics } from 'wrappers/metrics'

export class ChangeFullNameModalContainer extends Component {
  constructor(props) {
    super(props)

    this.state = {
      form: {
        fields: {
          name: {
            value: props.user.name,
            validation: getDefaultValidation(),
            getValidation: getNameValidation,
          },
          last_name: {
            value: props.user.last_name,
            validation: getPositiveValidation(),
            getValidation: getPositiveValidation,
          },
        },
        isValid: false,
      },
      httpError: null,
    }

    this.metrics = {
      component: withInteractionMetrics(ChangeFullNameModalMetrics)(
        ChangeFullNameModal,
      ),
    }

    this.onConfirm = this.onConfirm.bind(this)
    this.onChange = this.onChange.bind(this)
  }

  getUserWithLocalChanges() {
    const { name, last_name } = this.state.form.fields

    return {
      ...this.props.user,
      name: name.value.trim(),
      last_name: last_name.value.trim(),
    }
  }

  async onConfirm() {
    const userWithLocalChanges = this.getUserWithLocalChanges()
    const user = await AuthClient.editUserData(userWithLocalChanges)

    if (!user) {
      return
    }

    this.onConfirmSuccess(user)
  }

  onConfirmSuccess(user) {
    const { onClose, setLoggedUser } = this.props
    setLoggedUser({ ...user })
    this.setState((state) => ({
      form: {
        ...state.form,
        isValid: false,
      },
    }))
    onClose()
  }

  onChange(event) {
    const { name, value } = event.target

    this.setState((state) => ({
      form: getUpdatedFormValidation(state.form, name, value),
    }))
  }

  render() {
    const { form, httpError } = this.state
    const { onClose } = this.props
    const { component: ChangeFullNameModalWithMetrics } = this.metrics

    return (
      <ChangeFullNameModalWithMetrics
        httpError={httpError}
        onChange={this.onChange}
        onCancel={onClose}
        onConfirm={this.onConfirm}
        form={form}
        onEnterKeyPress={this.onConfirm}
        shouldPerformKeyPress={form.isValid}
      />
    )
  }
}

ChangeFullNameModalContainer.propTypes = {
  user: shape({
    id: number,
    uuid: string,
    name: string,
    last_name: string,
  }),
  onClose: func.isRequired,
  setLoggedUser: func.isRequired,
}

const mapDispatchToProps = {
  setLoggedUser: setLoggedUser,
}

export const ConnectedChangeFullNameModalContainer = connect(
  null,
  mapDispatchToProps,
)(ChangeFullNameModalContainer)

export default ConnectedChangeFullNameModalContainer
