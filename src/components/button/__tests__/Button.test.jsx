import { fireEvent, render, screen, within } from '@testing-library/react'

import Button from 'components/button'

describe('<Button />', () => {
  it('should have click function', () => {
    const onClickMock = vi.fn()
    render(<Button onClick={onClickMock} />)
    fireEvent.click(screen.getByRole('button'))

    expect(onClickMock).toHaveBeenCalled()
  })

  it('should return default class if no have props', () => {
    render(<Button />)

    const button = screen.getByRole('button')

    expect(button).toHaveClass('button button-primary')
  })

  it('should return correct class if have type prop', () => {
    render(<Button type="test" />)

    const button = screen.getByRole('button')

    expect(button).toHaveClass('button-test')
  })

  it('should return correct class if have disabled prop', () => {
    render(<Button disabled />)

    const button = screen.getByRole('button')

    expect(button).toHaveClass('button-primary--disabled')
  })

  it('should return correct class if have disabled and type prop', () => {
    render(<Button disabled type="test" />)

    const button = screen.getByRole('button')

    expect(button).toHaveClass('button-test--disabled')
  })

  it('should return correct class if have size prop', () => {
    render(<Button size="small" />)

    const button = screen.getByRole('button')

    expect(button).toHaveClass('button-small')
  })

  it('should return correct class if have size and type prop', () => {
    render(<Button size="small" type="test" />)

    const button = screen.getByRole('button')

    expect(button).toHaveClass('button-test--small button--small')
  })

  it('should return Loader component if have activeFeedback prop', () => {
    render(<Button activeFeedback />)

    const button = screen.getByRole('button')

    const loader = within(button).getByLabelText('loader')

    expect(button).toHaveClass('button-loader')
    expect(loader).toBeInTheDocument()
  })
})
