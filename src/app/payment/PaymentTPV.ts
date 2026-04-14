import { PaymentAuthentication } from './interfaces'

import { SystemAlert } from 'services/system-alert'

export const PaymentTPV = {
  autoRedirectToPaymentAuth: (
    paymentParams: PaymentAuthentication['params'],
  ) => {
    const { URL_Base, ...DsParams } = paymentParams

    const form = document.createElement('form')
    form.action = URL_Base
    form.target = '_self'
    form.method = 'POST'
    form.autocomplete = 'off'
    form.noValidate = true

    for (const [key, value] of Object.entries(DsParams)) {
      const input = document.createElement('input')
      input.name = key
      input.value = value
      input.type = 'hidden'
      form.appendChild(input)
    }

    document.body.appendChild(form)

    SystemAlert.deactivate()
    form.submit()
  },
}
