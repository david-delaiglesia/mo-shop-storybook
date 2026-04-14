import { render, screen } from '@testing-library/react'

import { ModalContent } from 'components/modal-content'

describe('<ModalContent />', () => {
  it('should focus on element if ariaFocus exists', async () => {
    const ariaFocus = vi.fn()
    const props = {
      ariaFocus,
      children: <div>Test</div>,
      onClose: vi.fn(),
      showButtonModal: true,
    }

    render(<ModalContent {...props} />)

    expect(
      screen.getByRole('button', {
        name: 'dialog_close',
      }),
    ).toBeInTheDocument()
    screen.getByText('Test')

    expect(ariaFocus).toHaveBeenCalled()
  })

  it('should not focus on element if ariaFocus not exists', () => {
    const ariaFocus = vi.fn()
    const props = {
      children: <div>Test</div>,
      onClose: vi.fn(),
      showButtonModal: true,
    }
    render(<ModalContent {...props} />)

    expect(
      screen.getByRole('button', {
        name: 'dialog_close',
      }),
    ).toBeInTheDocument()
    screen.getByText('Test')

    expect(ariaFocus).not.toHaveBeenCalled()
  })
})
