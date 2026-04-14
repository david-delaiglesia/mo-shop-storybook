import { render, screen } from '@testing-library/react'

import { Switch } from '../'
import userEvent from '@testing-library/user-event'

describe('Switch component', () => {
  it('should be unchecked by default', () => {
    render(<Switch label="" />)

    const switchElement = screen.getByRole('switch')

    expect(switchElement).not.toBeChecked()
  })

  it('should accept a default checked', () => {
    render(<Switch label="" defaultChecked />)

    const switchElement = screen.getByRole('switch')

    expect(switchElement).toBeChecked()
  })

  it('should trigger the onChange action when clicking on it', () => {
    const onChangeSpy = vi.fn()
    render(<Switch label="" onChange={onChangeSpy} />)

    const switchElement = screen.getByRole('switch')

    userEvent.click(switchElement)

    expect(onChangeSpy).toHaveBeenCalled()
  })

  it('should trigger the onChange action when clicking on the label', () => {
    const onChangeSpy = vi.fn()
    render(<Switch onChange={onChangeSpy} label="Label" />)

    const switchElement = screen.getByRole('switch', { name: 'Label' })

    userEvent.click(switchElement)

    expect(onChangeSpy).toHaveBeenCalled()
  })

  it('should accept and show a custom name', () => {
    render(<Switch label="" name="some name" />)

    const switchElement = screen.getByRole('switch')

    expect(switchElement).toHaveAttribute('name', 'some name')
  })
})
