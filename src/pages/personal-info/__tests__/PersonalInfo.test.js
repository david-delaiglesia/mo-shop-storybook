import {
  screen,
  waitForElementToBeRemoved,
  within,
} from '@testing-library/react'

import {
  closeChangeEmailModal,
  confirmAccountDeletion,
  deleteAccount,
  editEmail,
  editName,
  editNameOnKeyPress,
  editPassword,
  goBack,
  openChangeEmailModal,
  openDeleteModal,
  toggleDeleteAccountCheckbox,
} from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { expensiveCart } from 'app/cart/__scenarios__/cart'
import { CheckoutMother } from 'app/checkout/__scenarios__/CheckoutMother'
import { user } from 'app/user/__scenarios__/user'
import { createCheckout, openCart } from 'pages/helpers'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('User Area - Profile', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })
  const uuid = '1'

  afterEach(() => {
    Tracker.sendViewChange.mockClear()
    Tracker.sendInteraction.mockClear()
  })

  it('should allow the user to change the full name', async () => {
    const newName = 'Fransisco'
    const newSurname = 'Presencia'
    const responses = [
      {
        path: '/customers/1/',
        method: 'put',
        requestBody: { ...user, name: newName, last_name: newSurname },
        responseBody: { ...user, name: newName, last_name: newSurname },
      },
    ]
    wrap(App)
      .atPath('/user-area/personal-info')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Personal data', { selector: 'h1' })
    editName(newName, newSurname)
    await waitForElementToBeRemoved(() => screen.getByRole('dialog'))
    expect(screen.getByText(`${newName} ${newSurname}`)).toBeInTheDocument()
    expect(Tracker.sendViewChange).toHaveBeenCalledWith('personal_info')
  })

  it('should allow the user to change the full name when the user click on Intro key', async () => {
    const newName = 'Fransisco'
    const newSurname = 'Presencia'
    const responses = [
      {
        path: '/customers/1/',
        method: 'put',
        requestBody: { ...user, name: newName, last_name: newSurname },
        responseBody: { ...user, name: newName, last_name: newSurname },
      },
    ]
    wrap(App)
      .atPath('/user-area/personal-info')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Personal data', { selector: 'h1' })
    editNameOnKeyPress(newName, newSurname)
    await waitForElementToBeRemoved(() => screen.getByRole('dialog'))
    expect(screen.getByText(`${newName} ${newSurname}`)).toBeInTheDocument()
    expect(Tracker.sendViewChange).toHaveBeenCalledWith('personal_info')
  })

  it('should send events when opening and closing the modify email modal', async () => {
    const newEmail = 'fransisco@javascript-ninja.com'
    const responses = [
      {
        path: '/customers/1/actions/change-email/',
        method: 'post',
        requestBody: { email: newEmail, password: 'password' },
      },
    ]
    wrap(App)
      .atPath('/user-area/personal-info')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Personal data', { selector: 'h1' })

    openChangeEmailModal()
    closeChangeEmailModal()

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith('change_email_click', {
      email: 'johndoe@gmail.com',
    })
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'change_email_cancel_button_click',
    )
  })

  it('should allow the user to change the email', async () => {
    const newEmail = 'fransisco@javascript-ninja.com'
    const responses = [
      {
        path: '/customers/1/actions/change-email/',
        method: 'post',
        requestBody: { email: newEmail, password: 'password' },
      },
    ]
    wrap(App)
      .atPath('/user-area/personal-info')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Personal data', { selector: 'h1' })
    editEmail(newEmail, 'password')
    await waitForElementToBeRemoved(() => screen.getByRole('dialog'))

    expect(screen.getByText(newEmail)).toBeInTheDocument()
    expect(Tracker.setUserProperties).toHaveBeenCalledWith({ email: newEmail })
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'change_email_save_button_click',
      {
        new_email: newEmail,
      },
    )
  })

  it('should display the incorrect password message after changing the email', async () => {
    const newEmail = 'fransisco@javascript-ninja.com'
    const responses = [
      {
        path: '/customers/1/actions/change-email/',
        method: 'post',
        status: 403,
        requestBody: { email: newEmail, password: 'incorrect' },
        responseBody: { errors: [] },
      },
    ]

    wrap(App)
      .atPath('/user-area/personal-info')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Personal data', { selector: 'h1' })
    editEmail(newEmail, 'incorrect')
    const passwordErrorMessage = await screen.findByText(
      'The password is not valid.',
    )

    expect(passwordErrorMessage).toBeInTheDocument()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'change_email_save_button_click',
      {
        new_email: newEmail,
      },
    )
  })

  it('should allow the user to recover the password', async () => {
    const responses = [
      {
        path: '/customers/actions/recover-password/',
        method: 'post',
        requestBody: { email: 'johndoe@gmail.com' },
        status: 204,
      },
    ]
    wrap(App)
      .atPath('/user-area/personal-info')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Personal data', { selector: 'h1' })
    editPassword()
    const dialog = await screen.findByRole('dialog')

    expect(dialog).toHaveTextContent(
      'We have sent you an email to johndoe@gmail.com',
    )
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'reset_password_request_click',
    )
  })

  it('should set the default header', async () => {
    const responses = [
      { path: '/customers/1/cart/', responseBody: expensiveCart },
      {
        path: '/customers/1/checkouts/',
        method: 'post',
        requestBody: {
          cart: {
            id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
            lines: [{ quantity: 200, product_id: '8731', sources: [] }],
          },
        },
        responseBody: CheckoutMother.default(),
      },
      { path: '/customers/1/orders/', responseBody: { results: [] } },
      {
        path: '/customers/1/checkouts/5/',
        responseBody: CheckoutMother.default(),
      },
    ]
    wrap(App)
      .atPath('/user-area/personal-info')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Personal data', { selector: 'h1' })

    openCart()
    createCheckout()

    await screen.findByText('Summary')

    history.goBack()
    await screen.findByText('Personal data', { selector: 'h1' })

    expect(screen.getByLabelText('Show cart')).toBeInTheDocument()
  })

  describe('Delete account', () => {
    it('should display delete account button', async () => {
      const responses = [
        {
          path: `/customers/${uuid}/`,
          responseBody: user,
        },
      ]

      wrap(App)
        .atPath('/user-area/personal-info')
        .withNetwork(responses)
        .withLogin()
        .mount()

      await screen.findByRole('heading', { name: 'Personal data', level: 1 })

      expect(screen.getByText('Delete your user account')).toBeInTheDocument()
    })

    it('should display delete account modal with disabled button', async () => {
      const responses = [
        {
          path: `/customers/${uuid}/`,
          responseBody: user,
        },
      ]

      wrap(App)
        .atPath('/user-area/personal-info')
        .withNetwork(responses)
        .withLogin()
        .mount()

      await screen.findByRole('heading', { name: 'Personal data', level: 1 })

      openDeleteModal()

      expect(
        screen.getByRole('heading', {
          name: 'Don’t you want to continue shopping with us?',
          level: 3,
        }),
      ).toBeInTheDocument()
      expect(
        screen.getByText(
          'By deleting your user account, all your personal data, the history of your orders and your purchase receipts will be permanently deleted.',
        ),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'Delete my user account' }),
      ).toBeDisabled()
      expect(
        screen.getByRole('button', { name: 'Go back' }),
      ).toBeInTheDocument()
    })

    it('should close delete account modal', async () => {
      const responses = [
        {
          path: `/customers/${uuid}/`,
          responseBody: user,
        },
      ]

      wrap(App)
        .atPath('/user-area/personal-info')
        .withNetwork(responses)
        .withLogin()
        .mount()

      await screen.findByRole('heading', { name: 'Personal data', level: 1 })

      openDeleteModal()
      goBack()

      expect(screen.getByText('Delete your user account')).toBeInTheDocument()
    })

    it('should display account deletion process warning message on account deletion', async () => {
      const responses = [
        {
          path: `/customers/${uuid}/`,
          responseBody: user,
        },
        {
          path: `/customers/${uuid}/removal-request/`,
          method: 'post',
          status: 204,
        },
      ]

      wrap(App)
        .atPath('/user-area/personal-info')
        .withNetwork(responses)
        .withLogin()
        .mount()

      await screen.findByRole('heading', { name: 'Personal data', level: 1 })

      const nameSection = screen
        .getByRole('heading', { name: 'Delete your user account' })
        .closest('li')
      const deleteButton = within(nameSection).queryByRole('button', {
        name: 'Remove',
      })

      openDeleteModal()
      toggleDeleteAccountCheckbox()
      deleteAccount()
      confirmAccountDeletion()

      expect(deleteButton).not.toBeInTheDocument()
      expect(
        screen.getByText(
          'Your account is currently in the process of being deleted. You will receive an email informing you that the process has been completed.',
        ),
      )
    })

    it('should display account deletion process warning message', async () => {
      const responses = [
        {
          path: `/customers/${uuid}/`,
          responseBody: { ...user, has_requested_account_deletion: true },
        },
        {
          path: `/customers/${uuid}/removal-request/`,
          method: 'post',
          status: 204,
        },
      ]

      wrap(App)
        .atPath('/user-area/personal-info')
        .withNetwork(responses)
        .withLogin()
        .mount()

      await screen.findByRole('heading', { name: 'Personal data', level: 1 })

      const nameSection = screen
        .getByRole('heading', { name: 'Delete your user account' })
        .closest('li')
      const deleteButton = within(nameSection).queryByRole('button', {
        name: 'Remove',
      })

      expect(deleteButton).not.toBeInTheDocument()
      expect(
        screen.getByText(
          'Your account is currently in the process of being deleted. You will receive an email informing you that the process has been completed.',
        ),
      )
    })

    it('should send account_removal_request_view metric', async () => {
      const responses = [
        {
          path: `/customers/${uuid}/`,
          responseBody: user,
        },
      ]

      wrap(App)
        .atPath('/user-area/personal-info')
        .withNetwork(responses)
        .withLogin()
        .mount()

      await screen.findByRole('heading', { name: 'Personal data', level: 1 })

      openDeleteModal()

      expect(Tracker.sendInteraction).toHaveBeenCalledWith(
        'account_removal_request_view',
      )
    })

    it('should send account_removal_request_switch_click metric', async () => {
      const responses = [
        {
          path: `/customers/${uuid}/`,
          responseBody: user,
        },
        {
          path: `/customers/${uuid}/removal-request/`,
          method: 'post',
          status: 204,
        },
      ]

      wrap(App)
        .atPath('/user-area/personal-info')
        .withNetwork(responses)
        .withLogin()
        .mount()

      await screen.findByRole('heading', { name: 'Personal data', level: 1 })

      openDeleteModal()
      toggleDeleteAccountCheckbox()

      expect(Tracker.sendInteraction).toHaveBeenCalledWith(
        'account_removal_request_switch_click',
      )
    })

    it('should send account_removal_request_click metric', async () => {
      const responses = [
        {
          path: `/customers/${uuid}/`,
          responseBody: user,
        },
        {
          path: `/customers/${uuid}/removal-request/`,
          method: 'post',
          status: 204,
        },
      ]

      wrap(App)
        .atPath('/user-area/personal-info')
        .withNetwork(responses)
        .withLogin()
        .mount()

      await screen.findByRole('heading', { name: 'Personal data', level: 1 })

      openDeleteModal()
      toggleDeleteAccountCheckbox()
      deleteAccount()

      expect(Tracker.sendInteraction).toHaveBeenCalledWith(
        'account_removal_request_click',
      )
    })

    it('should send account_removal_request_confirmation_view metric', async () => {
      const responses = [
        {
          path: `/customers/${uuid}/`,
          responseBody: user,
        },
        {
          path: `/customers/${uuid}/removal-request/`,
          method: 'post',
          status: 204,
        },
      ]

      wrap(App)
        .atPath('/user-area/personal-info')
        .withNetwork(responses)
        .withLogin()
        .mount()

      await screen.findByRole('heading', { name: 'Personal data', level: 1 })

      openDeleteModal()
      toggleDeleteAccountCheckbox()
      deleteAccount()
      confirmAccountDeletion()

      expect(Tracker.sendInteraction).toHaveBeenCalledWith(
        'account_removal_request_confirmation_view',
      )
    })
  })
})
