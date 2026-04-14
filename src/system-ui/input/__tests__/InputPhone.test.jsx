import { render, screen, within } from '@testing-library/react'

import { InputPhone } from '../InputPhone'
import userEvent from '@testing-library/user-event'

describe('InputPhone', () => {
  it('should render the phone number input', () => {
    render(
      <InputPhone
        onChange={vi.fn()}
        onBlur={vi.fn()}
        label="Phone number"
        phone="644004736"
        phoneCountryCode="34"
        onSelectCountryCode={vi.fn()}
        validation={{}}
        autoFocus={false}
      />,
    )

    expect(screen.getByRole('button', { name: '+34' })).toBeInTheDocument()
    expect(screen.getByLabelText('Phone number')).toHaveValue('644004736')
  })

  it('should open the country list', async () => {
    render(
      <InputPhone
        onChange={vi.fn()}
        onBlur={vi.fn()}
        label="Phone number"
        phone="644004736"
        phoneCountryCode="34"
        onSelectCountryCode={vi.fn()}
        validation={{}}
        autoFocus={false}
      />,
    )

    userEvent.click(screen.getByRole('button', { name: '+34' }))

    const countryList = await screen.findByRole('list')
    expect(countryList).toBeInTheDocument()
    expect(countryList).toHaveTextContent('+33')
    expect(countryList).toHaveTextContent('+34')
    expect(countryList).toHaveTextContent('+1')
    expect(within(countryList).getByText(/\+33/)).toHaveAttribute(
      'data-active',
      'false',
    )
    expect(within(countryList).getByText(/\+34/)).toHaveAttribute(
      'data-active',
      'true',
    )
    expect(within(countryList).getByText(/\+34/)).toHaveFocus()
  })

  it('should close the country list clicking outside', () => {
    render(
      <InputPhone
        onChange={vi.fn()}
        onBlur={vi.fn()}
        label="Phone number"
        phone="644004736"
        phoneCountryCode="34"
        onSelectCountryCode={vi.fn()}
        validation={{}}
        autoFocus={false}
      />,
    )

    userEvent.click(screen.getByRole('button', { name: '+34' }))
    const countryList = screen.getByRole('list')
    userEvent.click(screen.getByLabelText('Phone number'))

    expect(countryList).not.toBeInTheDocument()
  })

  it('should close the country list with the ESC key', async () => {
    render(
      <InputPhone
        onChange={vi.fn()}
        onBlur={vi.fn()}
        label="Phone number"
        phone="644004736"
        phoneCountryCode="34"
        onSelectCountryCode={vi.fn()}
        validation={{}}
        autoFocus={false}
      />,
    )

    userEvent.click(screen.getByRole('button', { name: '+34' }))

    const countryList = await screen.findByRole('list')
    userEvent.keyboard('{Escape}')

    expect(countryList).not.toBeInTheDocument()
  })

  it('should select the country with the ARROW_UP key', async () => {
    render(
      <InputPhone
        onChange={vi.fn()}
        onBlur={vi.fn()}
        label="Phone number"
        phone="644004736"
        phoneCountryCode="44"
        onSelectCountryCode={vi.fn()}
        validation={{}}
        autoFocus={false}
      />,
    )

    userEvent.click(screen.getByRole('button', { name: '+44' }))
    const countryList = await screen.findByRole('list')

    userEvent.keyboard('{arrowup}')

    expect(within(countryList).getByText(/\+44/)).toHaveAttribute(
      'data-active',
      'false',
    )
    expect(within(countryList).getByText(/\+34/)).toHaveAttribute(
      'data-active',
      'true',
    )
  })

  it('should select the country with the ARROW_DOWN key', async () => {
    render(
      <InputPhone
        onChange={vi.fn()}
        onBlur={vi.fn()}
        label="Phone number"
        phone="644004736"
        phoneCountryCode="34"
        onSelectCountryCode={vi.fn()}
        validation={{}}
        autoFocus={false}
      />,
    )

    userEvent.click(screen.getByRole('button', { name: '+34' }))

    const countryList = await screen.findByRole('list')
    userEvent.keyboard('{arrowdown}')

    expect(within(countryList).getByText(/\+34/)).toHaveAttribute(
      'data-active',
      'false',
    )
    expect(within(countryList).getByText(/\+44/)).toHaveAttribute(
      'data-active',
      'true',
    )
  })

  it('should be able to select a new country', () => {
    const onSelectCountryCode = vi.fn()
    render(
      <InputPhone
        onChange={vi.fn()}
        onBlur={vi.fn()}
        label="Phone number"
        phone="644004736"
        phoneCountryCode="34"
        onSelectCountryCode={onSelectCountryCode}
        validation={{}}
        autoFocus={false}
      />,
    )

    userEvent.click(screen.getByRole('button', { name: '+34' }))
    const countryList = screen.getByRole('list')
    userEvent.click(within(countryList).getByText(/\+33/))

    expect(screen.getByLabelText('Phone number')).toHaveFocus()
    expect(countryList).not.toBeInTheDocument()
    expect(onSelectCountryCode).toHaveBeenCalledWith({
      flag: '🇫🇷',
      isoCountryCode: 'FR',
      phoneCountryCode: '33',
    })
  })

  it('should be able to select a new country with the ENTER key', async () => {
    const onSelectCountryCode = vi.fn()
    render(
      <InputPhone
        onChange={vi.fn()}
        onBlur={vi.fn()}
        label="Phone number"
        phone="644004736"
        phoneCountryCode="34"
        onSelectCountryCode={onSelectCountryCode}
        validation={{}}
        autoFocus={false}
      />,
    )

    userEvent.click(screen.getByRole('button', { name: '+34' }))
    const countryList = await screen.findByRole('list')
    userEvent.keyboard('{arrowdown}{enter}')

    expect(screen.getByLabelText('Phone number')).toHaveFocus()
    expect(countryList).not.toBeInTheDocument()
    expect(onSelectCountryCode).toHaveBeenCalledWith({
      flag: '🇬🇧',
      phoneCountryCode: '44',
      isoCountryCode: 'GB',
    })
  })

  it('should show the validation error', () => {
    render(
      <InputPhone
        onChange={vi.fn()}
        onBlur={vi.fn()}
        label="Phone number"
        phone="644004736"
        phoneCountryCode="34"
        onSelectCountryCode={vi.fn()}
        validation={{
          message: 'The format of the telephone is not correct',
          type: 'error',
          isDirty: true,
        }}
        autoFocus={false}
      />,
    )

    expect(
      screen.getByText('The format of the telephone is not correct'),
    ).toBeInTheDocument()
    expect(screen.getByTestId('input-error').closest('div')).toHaveClass(
      'input-text--error',
    )
  })

  it('should not show the validation error if the input is focused', () => {
    render(
      <InputPhone
        onChange={vi.fn()}
        onBlur={vi.fn()}
        label="Phone number"
        phone="644004736"
        phoneCountryCode="34"
        onSelectCountryCode={vi.fn()}
        validation={{
          message: 'The format of the telephone is not correct',
          type: 'error',
          isDirty: true,
        }}
        autoFocus={false}
      />,
    )

    userEvent.type(screen.getByLabelText('Phone number'), '6')

    expect(
      screen.queryByText('The format of the telephone is not correct'),
    ).not.toBeInTheDocument()
    expect(
      screen.getByLabelText('Phone number').closest('div'),
    ).not.toHaveClass('input-text--error')
  })

  it('should be able to listen the change of the input', () => {
    const onChange = vi.fn()
    render(
      <InputPhone
        onChange={onChange}
        onBlur={vi.fn()}
        label="Phone number"
        phone="644004736"
        phoneCountryCode="34"
        onSelectCountryCode={vi.fn()}
        validation={{}}
        autoFocus={false}
      />,
    )

    userEvent.type(screen.getByLabelText('Phone number'), '6')

    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('should be able to listen the blur of the input', () => {
    const onBlur = vi.fn()
    render(
      <InputPhone
        onChange={vi.fn()}
        onBlur={onBlur}
        label="Phone number"
        phone="644004736"
        phoneCountryCode="34"
        onSelectCountryCode={vi.fn()}
        validation={{}}
        autoFocus={false}
      />,
    )

    userEvent.click(screen.getByLabelText('Phone number'))
    userEvent.tab()

    expect(onBlur).toHaveBeenCalledTimes(1)
  })
})
