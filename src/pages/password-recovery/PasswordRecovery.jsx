import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'

import { func, object, shape } from 'prop-types'

import { AuthMetrics } from 'app/authentication'
import { AuthClient } from 'app/authentication/client'
import { hideAlert, showAlert } from 'app/shared/alert/actions'
import { ALERT_SIZES } from 'app/shared/alert/components/alert'
import { setHeaderType } from 'components/header-switch/actions'
import { LayoutHeaderType } from 'components/header-switch/constants'
import PasswordRecoveryLayout from 'components/password-recovery-layout'
import { PATHS, URL_PARAMS } from 'pages/paths'
import {
  getDefaultValidation,
  getPasswordValidation,
  getUpdatedFormValidation,
} from 'utils/input-validators'

const PasswordRecovery = ({ match, history }) => {
  const [form, setForm] = useState({
    fields: {
      password: {
        value: undefined,
        validation: getDefaultValidation(),
        getValidation: getPasswordValidation,
      },
    },
    isValid: false,
  })
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(setHeaderType(LayoutHeaderType.NONE))
    AuthMetrics.resetPasswordView()
  }, [])

  const redirectToLogin = () => {
    const searchParams = new URLSearchParams(history.location.search)
    searchParams.set(URL_PARAMS.AUTHENTICATE_USER, '')

    history.push({
      pathname: PATHS.HOME,
      search: searchParams.toString(),
    })

    dispatch(hideAlert())
  }

  const showConfirmationAlert = () => {
    const alert = {
      size: ALERT_SIZES.SMALL,
      title: 'reset_password_restablished_title',
      description: 'reset_password_restablished_description',
      confirmButtonText: 'reset_password_restablished_identify_button',
      confirmButtonAction: redirectToLogin,
    }
    dispatch(showAlert(alert))
  }

  const onSubmit = (event) => {
    event.preventDefault()

    if (!form.isValid) return

    recoverPassword()
  }

  const onChange = (event) => {
    const { name, value } = event.target
    setForm(getUpdatedFormValidation(form, name, value))
  }

  const recoverPassword = async () => {
    AuthMetrics.resetPasswordClick()
    const { password } = form.fields
    const newCredentials = {
      password: password.value,
      token: match.params.token,
    }

    const response = await AuthClient.changePassword(newCredentials)
    if (!response) return

    showConfirmationAlert()
  }

  return (
    <PasswordRecoveryLayout
      form={form}
      onChange={onChange}
      onSubmit={onSubmit}
      recoverPassword={recoverPassword}
    />
  )
}

PasswordRecovery.propTypes = {
  match: object.isRequired,
  history: shape({
    push: func.isRequired,
  }).isRequired,
}

export { PasswordRecovery }
