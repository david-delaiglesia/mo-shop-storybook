import { cleanup, fireEvent, render } from '@testing-library/react'

import { vi } from 'vitest'

import { ButtonV2 as Button } from 'components/button'

describe('Button V2', () => {
  afterEach(cleanup)

  const typesMap = {
    primary: Button.Primary,
    secondary: Button.Secondary,
    tertiary: Button.Tertiary,
    quaternary: Button.Quaternary,
    rounded: Button.Rounded,
    oval: Button.Oval,
  }

  const setup = (Component, props = {}) => {
    const utils = render(<Component {...props} />)
    const button = utils.getByRole('button')

    return { button, ...utils }
  }

  for (const [type, Component] of Object.entries(typesMap)) {
    it(`should have the right className for ${type} button`, () => {
      const { button } = setup(Component)

      expect(button).toHaveClass(`btn--${type}`)
    })
  }

  it('should just have base className by default', () => {
    const { button } = setup(Button.Primary)

    expect(button).toHaveClass('btn')
    expect(button).toHaveClass('btn--primary')
    expect(button).toHaveClass('btn--default')
    expect(button.classList).toHaveLength(3)
  })

  it('should have "button" type by default', () => {
    const { button } = setup(Button.Primary)

    expect(button.type).toBe('button')
  })

  it('should add the right className for fit button', () => {
    const { button } = setup(Button.Primary, { fit: true })

    expect(button).toHaveClass('btn--fit')
  })

  it('should add the right className for destructive button', () => {
    const { button } = setup(Button.Primary, { destructive: true })

    expect(button).toHaveClass('btn--destructive')
  })

  it('should add the right className for small size', () => {
    const { button } = setup(Button.Primary, { size: 'small' })

    expect(button).toHaveClass('btn--small')
  })

  it('should add the right className for big size', () => {
    const { button } = setup(Button.Primary, { size: 'big' })

    expect(button).toHaveClass('btn--big')
  })

  it('should pass-through all other props', () => {
    const onClick = vi.fn()
    const { button } = setup(Button.Primary, { onClick })

    fireEvent.click(button)

    expect(onClick).toHaveBeenCalled()
  })

  it('should show the right text', () => {
    const text = 'foo'
    const { getByText } = setup(Button.Primary, { text })

    const textNode = getByText(text)

    expect(textNode).toBeInTheDocument()
  })

  it('should show the icon', () => {
    const { getByRole } = setup(Button.Primary, { icon: 'foo' })

    const icon = getByRole('img')

    expect(icon).toBeInTheDocument()
  })

  it('should add extra className', () => {
    const className = 'foo'
    const { button } = setup(Button.Primary, { className })

    expect(button).toHaveClass(className)
  })

  it('should render given tag name', () => {
    const { getByRole } = render(<Button.Primary as="a" role="link" />)

    const link = getByRole('link')

    expect(link).toBeInTheDocument()
    expect(link.getAttribute('type')).toBeNull()
  })

  it('should show loader', () => {
    const { getByLabelText } = setup(Button.Primary, { activeFeedback: true })

    const loader = getByLabelText('loader')

    expect(loader).toBeInTheDocument()
  })
})
