import { screen } from '@testing-library/react'

import {
  confirmForm,
  confirmSignUpForm,
  fillEmail,
  fillSignUpForm,
  goBackFromLogin,
  toggleTermsCheckbox,
} from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { newUser } from 'app/authentication/__scenarios__/user'
import {
  homeWithGrid,
  homeWithRecommendations,
} from 'app/catalog/__scenarios__/home'
import { Storage } from 'services/storage'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Authenticate - signUp', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  const email = 'la_de_consum@consum.es'

  afterEach(() => {
    vi.clearAllMocks()
    Storage.clear()
    localStorage.clear()
  })

  it('should show sign up step to new users', async () => {
    const responses = [
      {
        path: '/home/',
        responseBody: homeWithGrid,
      },
      {
        method: 'post',
        path: '/customers/actions/check-email/',
        requestBody: { email },
        responseBody: { account_exists: false },
        status: 200,
      },
    ]
    wrap(App).atPath('/?authenticate-user').withNetwork(responses).mount()

    await screen.findAllByText('Sign in')
    fillEmail(email)
    confirmForm()
    const signUpTitle = await screen.findByText('Create account')

    expect(signUpTitle).toBeInTheDocument()
  })

  it('should go back to add email', async () => {
    const responses = [
      {
        path: '/home/',
        responseBody: homeWithGrid,
      },
      {
        method: 'post',
        path: '/customers/actions/check-email/',
        requestBody: { email },
        responseBody: { account_exists: false },
        status: 200,
      },
    ]
    wrap(App).atPath('/?authenticate-user').withNetwork(responses).mount()

    await screen.findAllByText('Sign in')
    fillEmail(email)
    confirmForm()
    await screen.findByText('Create account')
    goBackFromLogin()

    expect(screen.getByText('Sign in', { selector: 'h1' })).toBeInTheDocument()
  })

  it('should allow to sign up', async () => {
    const uuid = newUser.customer.uuid
    const responses = [
      {
        path: '/home/',
        responseBody: homeWithGrid,
      },
      {
        path: `/customers/${uuid}/home/`,
        responseBody: homeWithRecommendations,
      },
      {
        method: 'post',
        path: '/customers/actions/check-email/',
        requestBody: { email: 'juanroig@mercadona.es' },
        responseBody: { account_exists: false },
        status: 200,
      },
      {
        method: 'post',
        path: '/customers/actions/create_and_authenticate/',
        requestBody: {
          name: 'juan',
          last_name: 'roig',
          password: 'supersecret',
          email: 'juanroig@mercadona.es',
          current_postal_code: '46010',
        },
        responseBody: newUser,
      },
    ]
    wrap(App).atPath('/?authenticate-user').withNetwork(responses).mount()

    await screen.findAllByText('Sign in')
    fillEmail('juanroig@mercadona.es')
    confirmForm()
    await screen.findByText('Create account')
    fillSignUpForm({
      name: 'juan',
      lastname: 'roig',
      password: 'supersecret',
    })
    confirmSignUpForm()
    const newArrivalsTitle = await screen.findByText('Recomendado para ti')

    expect(newArrivalsTitle).toBeInTheDocument()
    expect(Tracker.setUserProperties).toHaveBeenCalledWith({
      email: 'juanroig@mercadona.es',
      created: expect.any(Date),
    })
    expect(Tracker.setSuperProperties).toHaveBeenCalled()
    expect(Tracker.registerNewUser).toHaveBeenCalledWith(uuid)
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'auth_create_account_click',
      {
        email: 'juanroig@mercadona.es',
        source: 'profile',
      },
    )
    expect(`/customers/${uuid}/cart/`).toHaveBeenFetchedWith({
      method: 'PUT',
      body: { id: '10000000-1000-4000-8000-100000000000', lines: [] },
    })
  })

  it('should display an alert if the email is already registered', async () => {
    const uuid = newUser.customer.uuid
    const responses = [
      {
        path: '/home/',
        responseBody: homeWithGrid,
      },
      {
        path: `/customers/${uuid}/home/`,
        responseBody: homeWithRecommendations,
      },
      {
        method: 'post',
        path: '/customers/actions/check-email/',
        requestBody: { email: 'juanroig@mercadona.es' },
        responseBody: { account_exists: false },
        status: 200,
      },
      {
        method: 'post',
        path: '/customers/actions/create_and_authenticate/',
        status: 409,
        requestBody: {
          name: 'juan',
          last_name: 'roig',
          password: 'supersecret',
          email: 'juanroig@mercadona.es',
          current_postal_code: '46010',
        },
      },
    ]
    wrap(App).atPath('/?authenticate-user').withNetwork(responses).mount()

    await screen.findAllByText('Sign in')
    fillEmail('juanroig@mercadona.es')
    confirmForm()
    await screen.findByText('Create account')
    fillSignUpForm({
      name: 'juan',
      lastname: 'roig',
      password: 'supersecret',
    })
    confirmSignUpForm()
    const alert = await screen.findByRole('dialog', {
      name: 'Operation not completed. Sign up is not available for this email right now. Please contact User Support.',
    })

    expect(alert).toHaveTextContent('Operation not completed')
    expect(alert).toHaveTextContent(
      'Sign up is not available for this email right now. Please contact User Support.',
    )
  })

  it('should not allow to sign up if the terms and conditions are not accepted', async () => {
    const uuid = newUser.customer.uuid
    const responses = [
      {
        path: '/home/',
        responseBody: homeWithGrid,
      },
      {
        path: `/customers/${uuid}/home/`,
        responseBody: homeWithRecommendations,
      },
      {
        method: 'post',
        path: '/customers/actions/check-email/',
        requestBody: { email: 'juanroig@mercadona.es' },
        responseBody: { account_exists: false },
        status: 200,
      },
      {
        method: 'post',
        path: '/customers/actions/create_and_authenticate/',
        requestBody: {
          name: 'juan',
          last_name: 'roig',
          password: 'supersecret',
          email: 'juanroig@mercadona.es',
          current_postal_code: '46010',
        },
        responseBody: newUser,
      },
    ]
    wrap(App).atPath('/?authenticate-user').withNetwork(responses).mount()

    await screen.findAllByText('Sign in')
    fillEmail('juanroig@mercadona.es')
    confirmForm()
    await screen.findByText('Create account')
    fillSignUpForm({
      name: 'juan',
      lastname: 'roig',
      password: 'supersecret',
      terms: false,
    })

    const continueButton = screen.getByRole('button', { name: 'Continue' })
    expect(continueButton).toBeDisabled()

    toggleTermsCheckbox()
    expect(continueButton).toBeEnabled()
  })
})
