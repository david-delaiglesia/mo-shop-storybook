import { Fragment, useRef, useState } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'
import { useDispatch } from 'react-redux'
import { useLocation } from 'react-router-dom'

import { monitoring } from 'monitoring'
import PropTypes from 'prop-types'

import { createThunk } from '@mercadona/mo.library.dashtil'

import { AuthMetrics } from 'app/authentication/AuthMetrics'
import { AuthClient } from 'app/authentication/client'
import {
  login as loginCommand,
  loginSuggestion as loginSuggestionCommand,
} from 'app/authentication/commands'
import { SOURCES, sendRecaptchaErrorMetrics } from 'app/authentication/metrics'
import { enableHighlightCart } from 'app/cart/containers/cart-button-container/actions'
import { knownFeatureFlags, useFlag } from 'services/feature-flags'
import { HTTP_STATUS } from 'services/http'
import { Recaptcha } from 'services/recaptcha'
import { Session } from 'services/session'
import { Tracker } from 'services/tracker'
import {
  getDefaultValidation,
  getLengthValidation,
  getPasswordValidation,
  getUpdatedFormValidation,
} from 'utils/input-validators'
import { clearPendingAction, setPendingAction } from 'wrappers/feedback/actions'

export const LoginContainer = ({
  isBeingAuthorizedFromCheckout,
  email,
  close,
  goBack,
  passwordRecoveryComponent: PasswordRecoveryComponent,
  loginComponent: LoginComponent,
}) => {
  const dispatch = useDispatch()

  const [state, setState] = useState({
    form: {
      fields: {
        password: {
          value: '',
          validation: getDefaultValidation(),
          getValidation: getPasswordValidation,
        },
      },
    },
    shouldShowPasswordRecovery: false,
  })

  const location = useLocation()

  const isActiveRecaptchaV2Fallback = useFlag(
    knownFeatureFlags.RECAPTCHA_V2_FALLBACK,
  )

  const flagLoginMonitoring = useFlag(knownFeatureFlags.LOGIN_MONITORING)

  const passwordRef = useRef()
  const recaptchaRef = useRef()

  const getSource = () => {
    const {
      isBeingAuthorizedFromSuggestion,
      isBeingAuthorizedFromRecommendations,
    } = location.state || {}

    if (isBeingAuthorizedFromCheckout) return SOURCES.CHECKOUT
    if (isBeingAuthorizedFromSuggestion) return SOURCES.DIALOG
    if (isBeingAuthorizedFromRecommendations) return SOURCES.RECOMMENDATIONS
    return SOURCES.PROFILE
  }

  const login = async (actionUuid) => {
    AuthMetrics.authLoginClick({ email, source: getSource() })

    const { password } = state.form.fields

    const loginParams = {
      username: email,
      password: password.value,
    }

    try {
      const recaptchaToken = await Recaptcha.getLoginToken()
      loginParams.recaptcha_token = recaptchaToken
    } catch (error) {
      AuthMetrics.authLoginError({ email, errorType: 'recaptcha' })
      monitoring.captureError(error)
      if (flagLoginMonitoring) {
        monitoring.sendMessage('login_error_recaptcha_library', {
          reason: error.toString(),
        })
      }
      sendRecaptchaErrorMetrics({ email, error })
    }

    try {
      const { token, uuid } = await AuthClient.login(loginParams)
      try {
        Session.saveUser({ uuid, token })
      } catch (saveError) {
        if (flagLoginMonitoring) {
          monitoring.sendMessage('login_error_session_save', {
            reason: saveError.toString(),
          })
        }
        return
      }
      let user
      try {
        user = await AuthClient.getUserData(uuid)
      } catch (getUserError) {
        if (flagLoginMonitoring) {
          monitoring.sendMessage('login_error_get_user_data', {
            status: getUserError.status,
            reason: getUserError.statusText || '',
          })
        }
        return
      }
      onLoginSuccess(user)
    } catch (error) {
      if (error.status === HTTP_STATUS.PRECONDITION_FAILED) {
        if (flagLoginMonitoring) {
          monitoring.sendMessage('login_error_recaptcha_required', {
            has_v2_fallback_active: Boolean(isActiveRecaptchaV2Fallback),
          })
        }
        if (isActiveRecaptchaV2Fallback) {
          invokeRecaptcha(loginParams, actionUuid)
          return
        }
      }
      onLoginError(error)
    } finally {
      dispatch(clearPendingAction())
    }
  }

  const invokeRecaptcha = async (loginParams, actionUuid) => {
    const loginParamsCopy = { ...loginParams }
    const recaptchaV2Token = await recaptchaRef.current.executeAsync()
    loginParamsCopy.recaptcha_token_fallback = recaptchaV2Token

    dispatch(setPendingAction(actionUuid))

    try {
      const { token, uuid } = await AuthClient.login(loginParamsCopy)
      Session.saveUser({ uuid, token })
      const user = await AuthClient.getUserData(uuid)
      return onLoginSuccess(user)
    } catch (error) {
      if (recaptchaRef.current) recaptchaRef.current.reset()

      onLoginError(error)
    } finally {
      dispatch(clearPendingAction())
    }
  }

  const onLoginSuccess = async (user) => {
    if (isActiveRecaptchaV2Fallback) {
      if (recaptchaRef.current) recaptchaRef.current.reset()
    }

    const { uuid, email } = user

    AuthMetrics.authLoginSuccess({ email })
    Tracker.setUserProperties({ email })
    Tracker.identifyExistingUser(uuid)

    const { isBeingAuthorizedFromSuggestion } = location.state || {}

    if (isBeingAuthorizedFromSuggestion) {
      await dispatch(createThunk(loginSuggestionCommand)(user))
      dispatch(enableHighlightCart())
      close()
      return
    }

    dispatch(createThunk(loginCommand)(user))
    close()
  }

  const onLoginError = (error) => {
    if (error.status === HTTP_STATUS.BAD_REQUEST) {
      AuthMetrics.authLoginError({ email, errorType: 'wrong_password' })
      setState((currentState) => ({
        ...currentState,
        form: {
          fields: {
            password: {
              value: '',
              getValidation: getLengthValidation,
              validation: {
                type: 'error',
                message: 'sign_up.error',
              },
            },
          },
        },
      }))
      if (flagLoginMonitoring) {
        monitoring.sendMessage('login_error_credentials')
      }
      passwordRef.current.blur()
      return
    }

    AuthMetrics.authLoginError({ email, errorType: 'unknown' })
    if (flagLoginMonitoring) {
      monitoring.sendMessage('login_error_unexpected', {
        status: error.status,
        reason: error.statusText || '',
      })
    }
  }

  const onChange = (event) => {
    const { name, value } = event.target
    setState((currentState) => ({
      ...currentState,
      form: getUpdatedFormValidation(currentState.form, name, value),
    }))
  }

  const recoverPassword = async (event) => {
    event && event.preventDefault()

    AuthMetrics.forgotPasswordClick({ authEmail: email })
    await AuthClient.recoverPassword({ email })
    togglePasswordRecovery()
  }

  const togglePasswordRecovery = () => {
    setState((currentState) => ({
      ...currentState,
      shouldShowPasswordRecovery: !currentState.shouldShowPasswordRecovery,
    }))
  }

  const getLoginVisibility = () => {
    if (isBeingAuthorizedFromCheckout) {
      return true
    }

    return !state.shouldShowPasswordRecovery
  }

  const { form, shouldShowPasswordRecovery } = state

  const shouldShowLogin = getLoginVisibility()

  return (
    <Fragment>
      {shouldShowLogin && (
        <LoginComponent
          goBack={goBack}
          onSubmit={login}
          onChange={onChange}
          form={form}
          email={email}
          shouldPerformKeyPress={form.isValid}
          onRecoverPassword={recoverPassword}
          passwordRef={passwordRef}
        />
      )}
      {shouldShowPasswordRecovery && (
        <PasswordRecoveryComponent
          email={email}
          onConfirm={togglePasswordRecovery}
        />
      )}
      {isActiveRecaptchaV2Fallback && (
        <ReCAPTCHA
          ref={recaptchaRef}
          sitekey={import.meta.env.VITE_GOOGLE_RECAPTCHA_V2_KEY}
          size="invisible"
          isolated
        />
      )}
    </Fragment>
  )
}

LoginContainer.propTypes = {
  email: PropTypes.string.isRequired,
  isBeingAuthorizedFromCheckout: PropTypes.bool.isRequired,
  goBack: PropTypes.func,
  close: PropTypes.func.isRequired,
  loginComponent: PropTypes.func.isRequired,
  passwordRecoveryComponent: PropTypes.func.isRequired,
}
