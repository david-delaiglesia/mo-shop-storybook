import { render, screen, within } from '@testing-library/react'

import { PaymentCardTpvIframe } from '../PaymentCardTpvIframe'
import { vi } from 'vitest'

describe('<PaymentCardTpvIframe />', () => {
  beforeAll(() => {
    HTMLFormElement.prototype.submit = vi.fn()
  })

  afterAll(vi.clearAllMocks)

  it('should display properly', () => {
    const props = {
      paymentParams: {
        URL_Base: 'https://ceca.test/pay',
        MerchantID: '234234',
        OtherParam: 'foo',
      },
    }
    render(<PaymentCardTpvIframe {...props} />)

    const iframe = screen.getByTitle('payment-card-tpv-iframe')
    const form = within(iframe).getByRole('form')
    const formInputs = form.querySelectorAll('input[type="hidden"]')

    expect(iframe).toHaveAttribute('name', 'payment-card-tpv-iframe')
    expect(iframe).toHaveAttribute('title', 'payment-card-tpv-iframe')
    expect(form).toHaveAttribute('action', 'https://ceca.test/pay')
    expect(form).toHaveAttribute('method', 'POST')
    expect(form).toHaveAttribute('target', 'payment-card-tpv-iframe')

    expect(formInputs).toHaveLength(2)
    expect(formInputs[0]).toHaveAttribute('name', 'MerchantID')
    expect(formInputs[0]).toHaveAttribute('value', '234234')
    expect(formInputs[1]).toHaveAttribute('name', 'OtherParam')
    expect(formInputs[1]).toHaveAttribute('value', 'foo')

    expect(HTMLFormElement.prototype.submit).toHaveBeenCalled()
  })
})
