import { camelCaseToSnakeCase } from '@mercadona/mo.library.dashtil'

import { Tracker } from 'services/tracker'

export const AuthMetrics = {
  authContinueClick(payload: { email: string }) {
    Tracker.sendInteraction('auth_continue_click', payload)
  },

  authLoginView(payload: { email: string }) {
    Tracker.sendInteraction('auth_login_view', payload)
  },

  authLoginClick(payload: { email: string; source: string }) {
    Tracker.sendInteraction('auth_login_click', payload)
  },

  authLoginError(payload: {
    email: string
    errorType: 'wrong_password' | 'recaptcha' | 'unknown'
  }) {
    Tracker.sendInteraction('auth_login_error', camelCaseToSnakeCase(payload))
  },

  authLoginSuccess(payload: { email: string }) {
    Tracker.sendInteraction('auth_login_success', payload)
  },

  authCreateAccountView(payload: { email: string }) {
    Tracker.sendInteraction('auth_create_account_view', payload)
  },

  authCreateAccountClick(payload: { email: string; source: string }) {
    Tracker.sendInteraction('auth_create_account_click', payload)
  },

  authCreateAccountError(payload: { email: string; error_type: 'unknown' }) {
    Tracker.sendInteraction('auth_create_account_error', payload)
  },

  authCreateAccountSuccess(payload: { email: string }) {
    Tracker.sendInteraction('auth_create_account_success', payload)
  },

  forgotPasswordClick(payload: { authEmail: string }) {
    Tracker.sendInteraction(
      'forgot_password_click',
      camelCaseToSnakeCase(payload),
    )
  },

  resetPasswordRequestClick() {
    Tracker.sendInteraction('reset_password_request_click')
  },

  resetPasswordClick() {
    Tracker.sendInteraction('reset_password_click')
  },

  resetPasswordView() {
    Tracker.sendInteraction('reset_password_view')
  },
}
