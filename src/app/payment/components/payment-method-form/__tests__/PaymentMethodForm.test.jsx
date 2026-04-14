import { render, screen } from '@testing-library/react'

import { PaymentMethodForm } from '../PaymentMethodForm'
import {
  addNewPaymentMethod,
  cancel,
  confirm,
  selectPaymentMethod,
} from './helpers'

const paymentMethods = [
  {
    id: 1,
    creditCardNumber: '6017',
    creditCardType: 1,
    defaultCard: true,
    expirationStatus: 'valid',
    expiresMonth: '01',
    expiresYear: '2026',
  },
  {
    id: 2,
    creditCardNumber: '6007',
    creditCardType: 2,
    defaultCard: false,
    expirationStatus: 'valid',
    expiresMonth: '02',
    expiresYear: '2026',
  },
]

describe('PaymentMethodForm', () => {
  const props = {
    title: 'Use a different card for this order',
    validPrefix: 'Valid until',
    addCardText: 'Add new card for this order',
    primaryActionText: 'Continue',
    secondaryActionText: 'Cancel',
    paymentMethods: paymentMethods,
    selectedPaymentMethodId: 1,
    addPaymentForm: <div>Form</div>,
    onSelect: vi.fn(),
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  }

  it('should display the proper info', async () => {
    render(<PaymentMethodForm {...props} />)

    expect(
      screen.getByText('Use a different card for this order'),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('visa')).toBeInTheDocument()
    expect(screen.getByText('6017')).toBeInTheDocument()
    expect(screen.getByLabelText('mastercard')).toBeInTheDocument()
    expect(screen.getByText('6007')).toBeInTheDocument()
    expect(screen.getByText('Valid until 01/26')).toBeInTheDocument()
    expect(screen.getByText('Add new card for this order')).toBeInTheDocument()
    expect(screen.getByText('Continue')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
    expect(screen.queryByText('Form')).not.toBeInTheDocument()
  })

  it('should display as checked the selected payment method', async () => {
    render(<PaymentMethodForm {...props} />)

    expect(screen.getByLabelText(/6017/)).toBeChecked()
    expect(screen.getByLabelText(/6007/)).not.toBeChecked()
  })

  it('should display as checked the add new payment method', async () => {
    render(<PaymentMethodForm {...props} selectedPaymentMethodId={null} />)

    addNewPaymentMethod()

    expect(screen.getByLabelText(/6017/)).not.toBeChecked()
    expect(screen.getByLabelText(/6007/)).not.toBeChecked()
    expect(screen.getByLabelText('Add new card for this order')).toBeChecked()
    expect(screen.getByText('Form')).toBeInTheDocument()
    expect(screen.queryByText('Cancel')).not.toBeInTheDocument()
    expect(screen.queryByText('Continue')).not.toBeInTheDocument()
  })

  it('should call the form actions', async () => {
    const onSelect = vi.fn()
    const onConfirm = vi.fn()
    const onCancel = vi.fn()

    render(
      <PaymentMethodForm
        {...props}
        selectedPaymentMethodId={null}
        onSelect={onSelect}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    )

    cancel()
    confirm()
    selectPaymentMethod('6017')

    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(onSelect).toHaveBeenCalledTimes(1)
  })

  it('should display a loading after confirm', async () => {
    render(<PaymentMethodForm {...props} />)

    confirm()

    expect(screen.getByLabelText('Loading')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeDisabled()
  })

  it('should display the add new payment method form when there are not payment cards', () => {
    render(
      <PaymentMethodForm
        {...props}
        paymentMethods={[]}
        selectedPaymentMethodId={null}
      />,
    )

    expect(
      screen.queryByText('Use a different card for this order'),
    ).not.toBeInTheDocument()
    expect(screen.getByText('Add new card for this order')).toBeInTheDocument()
    expect(screen.queryByText('Continue')).not.toBeInTheDocument()
    expect(screen.queryByText('Cancel')).not.toBeInTheDocument()
    expect(screen.getByText('Form')).toBeInTheDocument()
    expect(screen.queryByRole('radio')).not.toBeInTheDocument()
  })
})
