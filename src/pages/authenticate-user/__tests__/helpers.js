import { act } from '@testing-library/react'

import { fireEvent, screen, within } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'

export const fillEmail = (email) => {
  userEvent.type(screen.queryByLabelText('Email'), email)
}

export const confirmForm = () => {
  userEvent.click(screen.queryByText('Continue'))
}

export const fillPassword = (password) => {
  const event = { target: { name: 'password', value: password } }

  fireEvent.change(screen.queryByLabelText('Password'), event)
}

export const fillSignUpForm = ({ name, lastname, password, terms = true }) => {
  fireEvent.change(screen.getByLabelText('Name'), {
    target: { name: 'username', value: name },
  })
  fireEvent.change(screen.getByLabelText('Surname(s)'), {
    target: { name: 'last_name', value: lastname },
  })
  fireEvent.change(screen.getByLabelText('Password'), {
    target: { name: 'password', value: password },
  })
  if (terms) {
    toggleTermsCheckbox()
  }
}

export const toggleTermsCheckbox = () => {
  userEvent.click(screen.getByRole('checkbox', { name: 'Accept' }))
}

export const confirmSignUpForm = () => {
  fireEvent.click(screen.getByText('Continue'))
}

export const doLogin = () => {
  fireEvent.click(screen.queryByLabelText('Enter'))
}

export const submitLoginForm = () => {
  fireEvent.submit(screen.queryByLabelText('Enter').closest('form'))
}

export const openUserMenu = (userName) => {
  fireEvent.click(screen.getByText(`Hello ${userName}`))
}

export const logout = () => {
  fireEvent.click(screen.getByText('Logout'))
}

export const confirmLogoutAlert = () => {
  fireEvent.click(
    within(screen.getByRole('dialog')).getByText('Logout', {
      selector: 'button',
    }),
  )
}

export const recoverPassword = () => {
  fireEvent.click(screen.getByText('Forgot password?'))
}

export const continueWithRecoveredPassword = () => {
  fireEvent.click(screen.getByText('OK'))
}

export const acceptLoginSuggestion = async () => {
  const loginSuggestionDialog = screen.getByLabelText(
    'Do you already have an account?',
  )
  await act(
    async () =>
      await fireEvent.click(within(loginSuggestionDialog).getByText('Sign in')),
  )
}

export const cancelLoginSuggestion = () => {
  const loginSuggestionDialog = screen.getByLabelText(
    'Do you already have an account?',
  )
  fireEvent.click(within(loginSuggestionDialog).getByText('Not now'))
}

export const closeLogin = () => {
  const cancelButton = screen.getByText('Cancel')
  fireEvent.click(cancelButton)
}

export const goBackFromLogin = () => {
  const backButton = screen.getByText('Back')
  fireEvent.click(backButton)
}

export const loadRecaptchaScript = () => {
  const script = document.querySelector('#google-recaptcha')
  fireEvent.load(script)
}

export const showMoreRecaptchaInfo = () => {
  const moreInfo = screen.getByRole('button', { name: 'More information.' })
  userEvent.click(moreInfo)
}

export const closePopoverDialog = () => {
  userEvent.click(screen.getByRole('button', { name: 'Close' }))
}
