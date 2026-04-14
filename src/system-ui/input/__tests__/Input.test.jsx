import { render, screen } from '@testing-library/react'

import { Input } from '../Input'
import userEvent from '@testing-library/user-event'

const translations = {
  input_label: 'My label',
  input_error_message: 'Error message',
}

const t = (key) => translations[key]

describe('Input', () => {
  it('should render the default input', () => {
    render(
      <Input
        value=""
        label="input_label"
        onChange={vi.fn()}
        onBlur={vi.fn()}
        onFocus={vi.fn()}
        validation={{}}
        t={t}
      />,
    )

    const input = screen.getByLabelText('My label')
    const label = screen.getByText('My label')
    expect(input).toBeInTheDocument()
    expect(label).not.toHaveClass('active')
  })

  it('should display a focused input', () => {
    render(
      <Input
        value="Value"
        label="input_label"
        onChange={vi.fn()}
        onBlur={vi.fn()}
        onFocus={vi.fn()}
        validation={{}}
        t={t}
      />,
    )

    const label = screen.getByText('My label')
    expect(label).toHaveClass('input-text__label active')
  })

  it('should display the error message if the input has not the focus', () => {
    const onBlur = vi.fn()
    render(
      <div>
        <div>Other element</div>
        <Input
          value="Value"
          label="input_label"
          onChange={vi.fn()}
          onBlur={onBlur}
          onFocus={vi.fn()}
          validation={{ type: 'error', message: 'input_error_message' }}
          t={t}
        />
      </div>,
    )

    userEvent.click(screen.getByLabelText('My label'))
    userEvent.click(screen.getByText('Other element'))

    const error = screen.getByText('Error message')
    expect(error).toHaveClass('input-text__message input-text__message--error')
    expect(screen.getByTestId('input-error').closest('div')).toHaveClass(
      'input-text input-text--error',
    )
    expect(onBlur).toHaveBeenCalled()
  })

  it('should not display the error message if the input has the focus', () => {
    const onFocus = vi.fn()
    render(
      <Input
        value="Value"
        label="input_label"
        onChange={vi.fn()}
        onBlur={vi.fn()}
        onFocus={onFocus}
        validation={{ type: 'error', message: 'input_error_message' }}
        t={t}
      />,
    )

    const error = screen.getByText('Error message')
    userEvent.click(screen.getByLabelText('My label'))

    expect(error).not.toBeInTheDocument()
    expect(onFocus).toHaveBeenCalled()
  })

  it('should not display the error message if the user is typing', () => {
    const onChange = vi.fn()
    render(
      <Input
        value=""
        label="input_label"
        onChange={onChange}
        onBlur={vi.fn()}
        onFocus={vi.fn()}
        validation={{ type: 'error', message: 'input_error_message' }}
        t={t}
      />,
    )

    const error = screen.getByText('Error message')
    userEvent.type(screen.getByLabelText('My label'), 'a')

    expect(error).not.toBeInTheDocument()
    expect(onChange).toHaveBeenCalled()
  })

  it('should prevent the event when the space key is pressed', () => {
    global.Event.prototype.preventDefault = vi.fn()
    render(
      <Input
        value=""
        label="input_label"
        onChange={vi.fn()}
        onBlur={vi.fn()}
        onFocus={vi.fn()}
        validation={{ type: 'error', message: 'input_error_message' }}
        t={t}
      />,
    )

    userEvent.type(screen.getByLabelText('My label'), '{space}')

    expect(global.Event.prototype.preventDefault).toHaveBeenCalledTimes(1)
  })
})
