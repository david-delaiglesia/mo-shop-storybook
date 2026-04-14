import { render, screen } from '@testing-library/react'

import { InputPassword } from '../InputPassword'
import userEvent from '@testing-library/user-event'

describe('InputPassword', () => {
  it('should render the default input password', () => {
    render(<InputPassword label="Password" onChange={vi.fn()} />)

    const input = screen.getByLabelText('Password')
    const label = screen.getByText('Password')
    expect(input).toHaveAttribute('type', 'password')
    expect(label).not.toHaveClass('active')
  })

  it('should see the see password button as disabled', () => {
    render(
      <InputPassword
        label="Password"
        password=""
        passwordCanBeShown={true}
        onChange={vi.fn()}
      />,
    )

    const passwordVisibilityButton = screen.getByLabelText(
      'accessibility_see_password',
    )
    expect(passwordVisibilityButton).toBeDisabled()
    expect(passwordVisibilityButton).toHaveAttribute('type', 'button')
  })

  it('should see the password', () => {
    global.Event.prototype.preventDefault = vi.fn()
    render(
      <InputPassword
        label="Password"
        password="secret"
        passwordCanBeShown={true}
        onChange={vi.fn()}
      />,
    )

    const passwordVisibilityButton = screen.getByLabelText(
      'accessibility_see_password',
    )
    userEvent.click(passwordVisibilityButton)

    const input = screen.getByLabelText('Password')
    expect(passwordVisibilityButton).not.toBeDisabled()
    expect(input).toHaveAttribute('type', 'text')
    expect(global.Event.prototype.preventDefault).toHaveBeenCalledTimes(1)
  })
})
