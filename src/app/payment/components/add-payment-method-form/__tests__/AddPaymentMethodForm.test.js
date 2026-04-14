import { render, screen } from '@testing-library/react'

import { AddPaymentMethodForm } from '../AddPaymentMethodForm'
import { configure, wrap } from 'wrapito'

import { cecaIframe, redsysIframe } from 'app/payment/__scenarios__/payments'
import { onTokenizationError, onTokenizationSuccess } from 'pages/helpers'

describe('AddPaymentMethodForm', () => {
  configure({ mount: render })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should render the payment provider form with the proper params', async () => {
    const responses = {
      path: '/customers/user-uuid/payment-cards/new/',
      responseBody: cecaIframe,
    }
    wrap(AddPaymentMethodForm)
      .withProps({
        uuid: 'user-uuid',
        title: 'Accepted cards',
        description: 'This card will be saved in your account',
        helpMessage: 'When you save, we will redirect you to your bank’s page',
      })
      .withNetwork(responses)
      .mount()

    const form = await screen.findByRole('form')

    expect(screen.getByTitle('add-payment-method-iframe')).toBeInTheDocument()
    expect(form).toBeInTheDocument()
    expect(form).toHaveAttribute('method', 'POST')
    expect(form).toHaveAttribute(
      'action',
      'https://tpv.ceca.es/estpvweb/tpv/registroTarjeta.action?&lang=es',
    )
    expect(form).toHaveAttribute('target', 'add-payment-method-iframe')
    expect(form.querySelectorAll('input')).toHaveLength(1)
  })

  it('should submit the payment provider form', async () => {
    const onSubmit = HTMLFormElement.prototype.submit
    const responses = {
      path: '/customers/user-uuid/payment-cards/new/',
      responseBody: cecaIframe,
    }
    wrap(AddPaymentMethodForm)
      .withProps({
        uuid: 'user-uuid',
        title: 'Accepted cards',
        description: 'This card will be saved in your account',
        helpMessage: 'When you save, we will redirect you to your bank’s page',
      })
      .withNetwork(responses)
      .mount()

    await screen.findByRole('form')

    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('should display the additional info', async () => {
    const responses = {
      path: '/customers/user-uuid/payment-cards/new/',
      responseBody: cecaIframe,
    }
    wrap(AddPaymentMethodForm)
      .withProps({
        uuid: 'user-uuid',
        title: 'Accepted cards',
        description: 'This card will be saved in your account',
        helpMessage: 'When you save, we will redirect you to your bank’s page',
      })
      .withNetwork(responses)
      .mount()

    await screen.findByRole('form')

    expect(screen.getByText('Accepted cards')).toBeInTheDocument()
    expect(
      screen.getByText('This card will be saved in your account'),
    ).toBeInTheDocument()
    expect(screen.getByAltText('visa mastercard maestro')).toBeInTheDocument()
  })

  it('should render the payment provider form with REDSYS params', async () => {
    wrap(AddPaymentMethodForm)
      .withProps({
        uuid: 'user-uuid',
        title: 'Accepted cards',
        description: 'This card will be saved in your account',
        helpMessage: 'When you save, we will redirect you to your bank’s page',
      })
      .withNetwork({
        path: '/customers/user-uuid/payment-cards/new/',
        responseBody: redsysIframe,
      })
      .mount()

    const form = await screen.findByRole('form')

    expect(form).toHaveAttribute(
      'action',
      'https://sis-i.redsys.es:25443/sis/realizarPago',
    )
  })

  it('should add a payment method correctly', async () => {
    const onSuccess = vi.fn()
    wrap(AddPaymentMethodForm)
      .withProps({
        uuid: 'user-uuid',
        title: 'Accepted cards',
        description: 'This card will be saved in your account',
        helpMessage: 'When you save, we will redirect you to your bank’s page',
        onSuccess,
      })
      .withNetwork({
        path: '/customers/user-uuid/payment-cards/new/',
        responseBody: redsysIframe,
      })
      .mount()

    await screen.findByRole('form')
    onTokenizationSuccess()

    expect(
      screen.getByText(
        'When you save, we will redirect you to your bank’s page',
      ),
    ).toBeInTheDocument()
    expect(onSuccess).toHaveBeenCalledTimes(1)
  })

  it('should handle a payment method error', async () => {
    const onError = vi.fn()
    const responses = {
      path: '/customers/user-uuid/payment-cards/new/',
      multipleResponses: [
        { responseBody: redsysIframe },
        { responseBody: redsysIframe },
      ],
    }
    wrap(AddPaymentMethodForm)
      .withProps({
        uuid: 'user-uuid',
        title: 'Accepted cards',
        description: 'This card will be saved in your account',
        helpMessage: 'When you save, we will redirect you to your bank’s page',
        onError,
      })
      .withNetwork(responses)
      .mount()

    await screen.findByRole('form')
    onTokenizationError()
    await screen.findByRole('form')

    expect(onError).toHaveBeenCalledTimes(1)
  })
})
