import { screen } from '@testing-library/react'

import {
  confirmChangePasswordDialog,
  confirmChangePasswordForm,
  fillPassword,
  openHelp,
} from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
import { Storage } from 'services/storage'
import { Support } from 'services/support'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Product - Private', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  const token = 'fake-password-recovery-token'

  afterEach(() => {
    vi.clearAllMocks()
    Storage.clear()
    localStorage.clear()
  })

  it('should display the password recovery page', async () => {
    wrap(App).atPath(`/password-recovery/${token}`).mount()

    await screen.findAllByText('Reset password')

    expect(
      screen.getByText('Reset password', { selector: 'h3' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Choose a new password to access your account'),
    ).toBeInTheDocument()
    expect(screen.getByText('New password')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(
      screen.getByText('Reset password', { selector: 'button' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Help')).toBeInTheDocument()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith('reset_password_view')
  })

  it('should open the zendesk help when clicks on help button', async () => {
    wrap(App).atPath(`/password-recovery/${token}`).mount()

    await screen.findAllByText('Reset password')
    openHelp()

    expect(Support.openWidget).toHaveBeenCalledTimes(1)
  })

  it('should allow the user to change the password', async () => {
    const responses = [
      {
        path: '/customers/actions/change-password/?lang=es&wh=vlc1',
        method: 'post',
        requestBody: { password: 'new_password', token },
        status: 204,
      },
    ]
    wrap(App)
      .atPath(`/password-recovery/${token}`)
      .withNetwork(responses)
      .mount()

    await screen.findAllByText('Reset password')
    fillPassword('new_password')

    expect(screen.getByText('Password')).not.toBeDisabled()

    confirmChangePasswordForm()
    const confirmationDialog = await screen.findByRole('dialog')

    expect(confirmationDialog).toHaveTextContent('Password reset')
    expect(confirmationDialog).toHaveTextContent(
      'Your new password has been correctly associated with your email.',
    )
    expect(confirmationDialog).toHaveTextContent('Start shopping')
  })

  it('should send reset_password_click metric when user submits the password form', async () => {
    const responses = [
      {
        path: '/customers/actions/change-password/?lang=es&wh=vlc1',
        method: 'post',
        requestBody: { password: 'new_password', token },
        status: 204,
      },
    ]
    wrap(App)
      .atPath(`/password-recovery/${token}`)
      .withNetwork(responses)
      .mount()

    await screen.findAllByText('Reset password')
    fillPassword('new_password')
    confirmChangePasswordForm()

    expect(Tracker.sendInteraction).toHaveBeenCalledWith('reset_password_click')
  })

  it('should show an error when the data is incorrect', async () => {
    const responses = [
      {
        path: '/customers/actions/change-password/?lang=es&wh=vlc1',
        method: 'post',
        requestBody: { password: 'new_password', token },
        responseBody: {
          errors: [{ code: 'invalid', detail: 'Must be a valid UUID.' }],
        },
        status: 400,
      },
    ]
    wrap(App)
      .atPath(`/password-recovery/${token}`)
      .withNetwork(responses)
      .mount()

    await screen.findAllByText('Reset password')
    fillPassword('new_password')
    confirmChangePasswordForm()

    const errorDialog = await screen.findByRole('dialog')

    expect(errorDialog).toHaveTextContent('Your request cannot be processed')
    expect(errorDialog).toHaveTextContent('Must be a valid UUID')
    expect(errorDialog).toHaveTextContent('OK')
    expect(errorDialog).not.toHaveTextContent('Password reset')
  })

  it('should display the sign in dialog after recover the password', async () => {
    const responses = [
      {
        path: '/customers/actions/change-password/?lang=es&wh=vlc1',
        method: 'post',
        requestBody: { password: 'new_password', token },
        status: 204,
      },
      { path: '/home/', responseBody: homeWithGrid },
    ]
    wrap(App)
      .atPath(`/password-recovery/${token}`)
      .withNetwork(responses)
      .mount()

    await screen.findByText('Choose a new password to access your account')
    fillPassword('new_password')
    confirmChangePasswordForm()
    await screen.findByRole('dialog')
    confirmChangePasswordDialog()
    await screen.findByText('Novedades')

    const signInDialog = screen.getByRole('dialog')
    expect(signInDialog).toBeInTheDocument()
    expect(signInDialog).toHaveTextContent('Enter your email')
  })
})
