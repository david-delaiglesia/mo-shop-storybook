import { screen, within } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'

const editName = (newName, newSurname) => {
  const nameSection = screen
    .getByRole('heading', { name: 'Name' })
    .closest('li')
  const modifyButton = within(nameSection).getByRole('button', {
    name: 'Modify',
  })
  userEvent.click(modifyButton)
  fillNameForm(newName, newSurname)

  const saveButton = within(screen.getByRole('dialog')).getByRole('button', {
    name: 'Save',
  })
  userEvent.click(saveButton)
}

const editNameOnKeyPress = (newName, newSurname) => {
  const nameSection = screen
    .getByRole('heading', { name: 'Name' })
    .closest('li')
  const modifyButton = within(nameSection).getByRole('button', {
    name: 'Modify',
  })
  userEvent.click(modifyButton)
  fillNameForm(newName, newSurname)

  userEvent.keyboard('{Enter}')
}

const editEmail = (newEmail, password) => {
  openChangeEmailModal()
  fillEmailForm(newEmail, password)
  const saveButton = within(screen.getByRole('dialog')).getByRole('button', {
    name: 'Accept',
  })
  userEvent.click(saveButton)
}

const closeChangeEmailModal = () => {
  const saveAddressButton = screen.getByText('Cancel')
  userEvent.click(saveAddressButton)
}

const openChangeEmailModal = () => {
  const nameSection = screen
    .getByRole('heading', { name: 'Email' })
    .closest('li')
  const modifyButton = within(nameSection).getByRole('button', {
    name: 'Modify',
  })
  userEvent.click(modifyButton)
}

const fillEmailForm = (email, password) => {
  const mailInput = screen.getByLabelText('Email')
  userEvent.type(mailInput, email)

  const passwordInput = screen.getByLabelText('Password')
  userEvent.type(passwordInput, password)
}

const fillNameForm = (name, surname) => {
  const nameInput = screen.getByLabelText('Name')
  userEvent.clear(nameInput)
  userEvent.type(nameInput, name)

  const surnameInput = screen.getByLabelText('Surname(s)')
  userEvent.clear(surnameInput)
  userEvent.type(surnameInput, surname)
}

const editPassword = () => {
  const nameSection = screen
    .getByRole('heading', { name: 'Password' })
    .closest('li')
  const modifyButton = within(nameSection).getByRole('button', {
    name: 'Modify',
  })
  userEvent.click(modifyButton)
}

const openDeleteModal = () => {
  const nameSection = screen
    .getByRole('heading', { name: 'Delete your user account' })
    .closest('li')
  const deleteButton = within(nameSection).getByRole('button', {
    name: 'Remove',
  })
  userEvent.click(deleteButton)
}

const toggleDeleteAccountCheckbox = () => {
  const modal = screen.getByRole('dialog')
  userEvent.click(within(modal).getByRole('checkbox'))
}

const goBack = () => {
  const modal = screen.getByRole('dialog')
  userEvent.click(within(modal).getByRole('button', { name: 'Go back' }))
}

const deleteAccount = () => {
  const modal = screen.getByRole('dialog')
  userEvent.click(
    within(modal).getByRole('button', { name: 'Delete my user account' }),
  )
}

const confirmAccountDeletion = () => {
  const modal = screen.getByRole('dialog')
  userEvent.click(within(modal).getByRole('button', { name: 'Understood' }))
}

export {
  openChangeEmailModal,
  closeChangeEmailModal,
  editName,
  editEmail,
  editPassword,
  editNameOnKeyPress,
  openDeleteModal,
  toggleDeleteAccountCheckbox,
  goBack,
  deleteAccount,
  confirmAccountDeletion,
}
