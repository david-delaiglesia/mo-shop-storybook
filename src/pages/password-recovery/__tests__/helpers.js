import { fireEvent, screen } from '@testing-library/dom'

export const confirmChangePasswordForm = () => {
  const button = screen.getByText('Reset password', {
    selector: 'button',
  })
  fireEvent.click(button)
}

export const confirmChangePasswordDialog = () => {
  fireEvent.click(screen.queryByText('Start shopping'))
}

export const fillPassword = (password) => {
  fireEvent.change(screen.getByLabelText('Password'), {
    target: { name: 'password', value: password },
  })
}

export const openHelp = () => {
  fireEvent.click(screen.getByText('Help'))
}
