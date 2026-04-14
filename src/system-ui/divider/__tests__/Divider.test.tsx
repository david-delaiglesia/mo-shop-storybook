import { render, screen } from '@testing-library/react'

import { Divider } from '../Divider'

describe('Divider', () => {
  it('renders horizontal by default', () => {
    render(<Divider />)

    const divider = screen.getByRole('separator')
    expect(divider).toHaveAttribute('aria-orientation', 'horizontal')
  })

  it('renders vertical when specified', () => {
    render(<Divider orientation="vertical" />)

    const divider = screen.getByRole('separator')
    expect(divider).toHaveAttribute('aria-orientation', 'vertical')
  })

  it('renders with text when provided', () => {
    render(<Divider>Test</Divider>)

    const divider = screen.getByRole('separator')
    expect(divider).toHaveTextContent('Test')
  })
})
