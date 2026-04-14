import { render, screen } from '@testing-library/react'

import { StrengthBar } from '../StrengthBar'

const translations = {
  password_strength_invalid_description: 'Enter at least 6 characters',
  password_strength_strong_description: 'Strong',
  password_strength_weak_description: 'Weak',
  password_invalid_characters:
    'You can only use letters, numbers and common punctuation characters',
}

const t = (key) => translations[key]

describe('StrengthBar', () => {
  it('should render default strength bar', () => {
    render(<StrengthBar password="" email="" t={t} />)

    const strengthBar = screen.getByTestId('strength-bar')
    expect(strengthBar).not.toHaveClass('strength-bar--invalid')
    expect(strengthBar).not.toHaveClass('strength-bar--weak')
    expect(strengthBar).not.toHaveClass('strength-bar--safe')
    expect(strengthBar).not.toHaveTextContent('Enter at least 6 characters')
    expect(strengthBar).not.toHaveTextContent('Weak')
    expect(strengthBar).not.toHaveTextContent('Strong')
  })

  it('should display the invalid format message', () => {
    render(<StrengthBar password="123 456" email="" t={t} />)

    const strengthBar = screen.getByTestId('strength-bar')
    expect(strengthBar).toHaveClass('strength-bar--wrong-format')
    expect(strengthBar).toHaveTextContent(
      'You can only use letters, numbers and common punctuation characters',
    )
  })

  it('should display the invalid message', () => {
    render(<StrengthBar password="1234" email="" t={t} />)

    const strengthBar = screen.getByTestId('strength-bar')
    expect(strengthBar).toHaveClass('strength-bar--invalid')
    expect(strengthBar).toHaveTextContent('Enter at least 6 characters')
  })

  it('should display the weak message', () => {
    render(<StrengthBar password="123456" email="" t={t} />)

    const strengthBar = screen.getByTestId('strength-bar')
    expect(strengthBar).toHaveClass('strength-bar--weak')
    expect(strengthBar).toHaveTextContent('Weak')
  })

  it('should display the weak message if the password contains Mercadona', () => {
    render(<StrengthBar password="Mercadona123+" email="" t={t} />)

    const strengthBar = screen.getByTestId('strength-bar')
    expect(strengthBar).toHaveClass('strength-bar--weak')
    expect(strengthBar).toHaveTextContent('Weak')
  })

  it('should display the weak message if the password contains the email', () => {
    render(
      <StrengthBar
        password="Johndoe123+"
        email="johndoe@mercadona.com"
        t={t}
      />,
    )

    const strengthBar = screen.getByTestId('strength-bar')
    expect(strengthBar).toHaveClass('strength-bar--weak')
    expect(strengthBar).toHaveTextContent('Weak')
  })

  it('should display the strong message', () => {
    render(<StrengthBar password="StrongPassword123+" email="" t={t} />)

    const strengthBar = screen.getByTestId('strength-bar')
    expect(strengthBar).toHaveClass('strength-bar--safe')
    expect(strengthBar).toHaveTextContent('Strong')
  })
})
