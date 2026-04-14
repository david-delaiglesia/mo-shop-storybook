import { render, screen } from '@testing-library/react'

import { TextArea } from '../TextArea'
import userEvent from '@testing-library/user-event'

const translations = {
  input_label: 'My label',
  comments_max_length_hint: 'Max. {{ maxLength }}',
  comments_current_length_hint: '{{ currentLength }} of {{ maxLength }}',
}

const t = (key, interpolation) => {
  return translations[key]
    .replace('{{ maxLength }}', interpolation?.maxLength)
    .replace('{{ currentLength }}', interpolation?.currentLength)
}

describe('TextArea', () => {
  it('should render the default text area', () => {
    render(
      <TextArea
        name="name"
        label="input_label"
        maxLength={200}
        onChange={vi.fn()}
        t={t}
      />,
    )

    expect(screen.getByText('My label')).toBeInTheDocument()
    expect(screen.getByLabelText('My label')).toBeInTheDocument()
    expect(screen.getByText('Max. 200')).toBeInTheDocument()
  })

  it('should display a text area with value', () => {
    const onFocus = vi.fn()
    render(
      <TextArea
        value="My text"
        name="name"
        label="input_label"
        maxLength={200}
        onChange={vi.fn()}
        onFocus={onFocus}
        t={t}
      />,
    )

    const textAreaContainer = screen.getByLabelText('My label').closest('div')
    expect(textAreaContainer).toHaveClass('text-area--active')
  })

  it('should be able to type in the text area', () => {
    const onChange = vi.fn()
    render(
      <TextArea
        name="name"
        label="input_label"
        maxLength={200}
        onChange={onChange}
        t={t}
      />,
    )

    userEvent.type(screen.getByLabelText('My label'), 'm')

    expect(onChange).toHaveBeenCalled()
  })

  it('should display a focused text area', () => {
    const onFocus = vi.fn()
    render(
      <TextArea
        name="name"
        label="input_label"
        maxLength={200}
        onChange={vi.fn()}
        onFocus={onFocus}
        t={t}
      />,
    )

    userEvent.click(screen.getByLabelText('My label'))

    const textAreaContainer = screen.getByLabelText('My label').closest('div')
    expect(textAreaContainer).toHaveClass('text-area--active')
    expect(onFocus).toHaveBeenCalled()
  })

  it('should display the default text area after blur', () => {
    render(
      <div>
        <div>Other element</div>
        <TextArea
          name="name"
          label="input_label"
          maxLength={200}
          onChange={vi.fn()}
          t={t}
        />
      </div>,
    )

    userEvent.click(screen.getByLabelText('My label'))

    const textAreaContainer = screen.getByLabelText('My label').closest('div')
    expect(textAreaContainer).toHaveClass('text-area--active')

    userEvent.click(screen.getByText('Other element'))

    expect(textAreaContainer).not.toHaveClass('text-area--active')
  })

  it('should display the counter as an error if the content reach the limit', () => {
    render(
      <TextArea
        value="Co"
        name="name"
        label="input_label"
        maxLength={2}
        onChange={vi.fn()}
        t={t}
      />,
    )

    const counter = screen.getByText('2 of 2')
    expect(counter).toHaveClass('text-area__counter--error')
  })
})
