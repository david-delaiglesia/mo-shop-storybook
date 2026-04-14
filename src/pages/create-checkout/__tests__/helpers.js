import { screen } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'

export const fillEmailInput = (email) => {
  userEvent.type(screen.getByLabelText('Email'), email)
}

export const fillNameInput = (name) => {
  userEvent.type(screen.getByLabelText('Name'), name)
}

export const fillSurnameInput = (surname) => {
  userEvent.type(screen.getByLabelText('Surname(s)'), surname)
}

export const fillPasswordInput = (password) => {
  userEvent.type(screen.getByLabelText('Password'), password)
}

export const confirmEmail = () => {
  userEvent.click(screen.getByText('Continue'))
}

export const confirmPassword = () => {
  userEvent.click(screen.getByText('Continue'))
}

export const confirmSignUp = () => {
  userEvent.click(screen.getByText('Continue'))
}

export const acceptPolicyTerms = () => {
  userEvent.click(screen.getByLabelText('input.policy'))
}

export const goBack = () => {
  userEvent.click(screen.getByLabelText('Back'))
}

export const createCheckout = () => {
  userEvent.click(screen.getByText('Checkout'))
}
