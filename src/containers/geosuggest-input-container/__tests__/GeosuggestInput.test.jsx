import { render, screen, within } from '@testing-library/react'

import { GeosuggestInputContainer } from '../GeosuggestInputContainer'
import userEvent from '@testing-library/user-event'

import {
  createAddressSuggestion,
  mockAddressSuggestions,
} from '__tests__/maps/helpers'
import { FlowIdProvider } from 'app/shared/flow-id'
import { Tracker } from 'services/tracker'

const Wrapper = (props) => <FlowIdProvider {...props} />

describe('GeosuggestInput', () => {
  afterEach(() => {
    vi.clearAllMocks()
    vi.resetAllMocks()
  })
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetAllMocks()
  })

  it('should render the default input', () => {
    render(
      <Wrapper>
        <Wrapper></Wrapper>
        <GeosuggestInputContainer
          inputValue=""
          inputName="street-name"
          label="input.address"
          onSuggestSelect={vi.fn()}
          onManuallyAddressSelect={vi.fn()}
          onChange={vi.fn()}
          onClear={vi.fn()}
        />
      </Wrapper>,
    )

    expect(screen.getByLabelText('input.address')).toBeInTheDocument()
  })

  it('should no display the list of suggestions without search', () => {
    mockAddressSuggestions([
      createAddressSuggestion('place1', {
        street: 'Calle de Colón',
        town: 'Madrid',
      }),
      createAddressSuggestion('place2', {
        street: 'Calle de Cristóbal Colón',
        number: '6',
        town: 'Madrid',
      }),
    ])

    render(
      <Wrapper>
        <GeosuggestInputContainer
          inputValue=""
          inputName="street-name"
          label="input.address"
          onSuggestSelect={vi.fn()}
          onManuallyAddressSelect={vi.fn()}
          onChange={vi.fn()}
          onClear={vi.fn()}
        />
      </Wrapper>,
    )

    const list = screen.getByRole('listbox')
    expect(list).toHaveClass('geosuggest-input-list--hide')
  })

  it('should display the list of suggestions', async () => {
    mockAddressSuggestions([
      createAddressSuggestion('place1', {
        street: 'Calle de Colón',
        town: 'Madrid',
      }),
      createAddressSuggestion('place2', {
        street: 'Calle de Cristóbal Colón',
        number: '6',
        town: 'Madrid',
      }),
    ])

    render(
      <Wrapper>
        <GeosuggestInputContainer
          inputValue=""
          inputName="street-name"
          label="input.address"
          onSuggestSelect={vi.fn()}
          onManuallyAddressSelect={vi.fn()}
          onChange={vi.fn()}
          onClear={vi.fn()}
        />
      </Wrapper>,
    )

    userEvent.type(screen.getByLabelText('input.address'), 'Cal')
    await screen.findByLabelText('Calle de Colón - Madrid, España')

    const list = screen.getByRole('listbox')
    const firstOption = within(list).getByRole('option', {
      name: 'Calle de Colón - Madrid, España',
    })
    const secondOption = within(list).getByRole('option', {
      name: 'Calle de Cristóbal Colón, 6 - Madrid, España',
    })
    const manuallyOption = within(list)
      .getByText('address_manual_add_button')
      .closest('li')

    expect(list).not.toHaveClass('geosuggest-input-list--hide')
    expect(list).toContainElement(firstOption)
    expect(list).toContainElement(secondOption)
    expect(list).toContainElement(manuallyOption)

    expect(firstOption).toHaveTextContent('Calle de Colón Madrid, España')

    expect(secondOption).toHaveTextContent(
      'Calle de Cristóbal Colón, 6 Madrid, España',
    )
  })

  it('should select the manually added address', async () => {
    const onManuallyAddressSelect = vi.fn()

    mockAddressSuggestions([
      createAddressSuggestion('place1', {
        street: 'Calle de Colón',
        number: '1',
        town: 'Madrid',
      }),
      createAddressSuggestion('place2', {
        street: 'Calle de Colón',
        number: '2',
        town: 'Madrid',
      }),
    ])

    render(
      <Wrapper>
        <GeosuggestInputContainer
          inputValue=""
          inputName="street-name"
          label="input.address"
          onSuggestSelect={vi.fn()}
          onManuallyAddressSelect={onManuallyAddressSelect}
          onChange={vi.fn()}
          onClear={vi.fn()}
        />
      </Wrapper>,
    )

    userEvent.type(screen.getByLabelText('input.address'), 'Cal')
    await screen.findByLabelText('Calle de Colón, 1 - Madrid, España')

    const list = screen.getByRole('listbox')
    userEvent.click(screen.getByText('address_manual_add_button'))
    await screen.findByLabelText('input.address')

    expect(onManuallyAddressSelect).toHaveBeenCalledWith('Cal')
    expect(list).toHaveClass('geosuggest-input-list--hide')
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'address_manual_click',
      {
        flow_id: '10000000-1000-4000-8000-100000000000',
        suggestions_amount: 2,
        user_input: 'Cal',
      },
    )
  })

  it('should select an address', async () => {
    const onSuggestSelect = vi.fn()

    mockAddressSuggestions([
      createAddressSuggestion('place1', {
        street: 'Calle de Colón',
        town: 'Madrid',
      }),
    ])

    render(
      <Wrapper>
        <GeosuggestInputContainer
          inputValue=""
          inputName="street-name"
          label="input.address"
          onSuggestSelect={onSuggestSelect}
          onManuallyAddressSelect={vi.fn()}
          onChange={vi.fn()}
          onClear={vi.fn()}
        />
      </Wrapper>,
    )

    userEvent.type(screen.getByLabelText('input.address'), 'Cal')
    await screen.findByLabelText('Calle de Colón - Madrid, España')

    const list = screen.getByRole('listbox')
    const firstOption = screen.getByRole('option', {
      name: 'Calle de Colón - Madrid, España',
    })

    userEvent.click(firstOption)
    await screen.findByLabelText('input.address')

    expect(list).toHaveClass('geosuggest-input-list--hide')
    expect(onSuggestSelect).toHaveBeenCalledWith({
      placeId: 'place1',
      primaryText: 'Calle de Colón',
      secondaryText: 'Madrid, España',
      position: 0,
      types: ['street_address', 'geocode'],
    })
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'address_suggestion_click',
      {
        flow_id: '10000000-1000-4000-8000-100000000000',
        selected_suggestion: 'Calle de Colón - Madrid, España',
        suggestion_position: 1,
        user_input: 'Cal',
        address_type: ['street_address', 'geocode'],
      },
    )
  })

  it('should hide the list of suggestions on blur', () => {
    mockAddressSuggestions([
      createAddressSuggestion('place1', {
        street: 'Calle de Colón',
        town: 'Madrid',
      }),
    ])

    render(
      <div>
        <div>Other element</div>
        <Wrapper>
          <GeosuggestInputContainer
            inputValue=""
            inputName="street-name"
            label="input.address"
            onSuggestSelect={vi.fn()}
            onManuallyAddressSelect={vi.fn()}
            onChange={vi.fn()}
            onClear={vi.fn()}
            bias={{
              from: { latitude: 1, longitude: 1 },
              to: { latitude: 1, longitude: 1 },
            }}
          />
        </Wrapper>
      </div>,
    )

    userEvent.type(screen.getByLabelText('input.address'), 'Cal')
    const list = screen.getByRole('listbox')
    userEvent.click(screen.getByText('Other element'))

    expect(list).toHaveClass('geosuggest-input-list--hide')
  })

  it('should preselect the options with the arrow keys', async () => {
    mockAddressSuggestions([
      createAddressSuggestion('place1', {
        street: 'Calle de Colón',
        number: '1',
        town: 'Madrid',
      }),
      createAddressSuggestion('place2', {
        street: 'Calle de Colón 2',
        number: '2',
        town: 'Madrid',
      }),
    ])

    render(
      <Wrapper>
        <GeosuggestInputContainer
          inputValue=""
          inputName="street-name"
          label="input.address"
          onSuggestSelect={vi.fn()}
          onManuallyAddressSelect={vi.fn()}
          onChange={vi.fn()}
          onClear={vi.fn()}
        />
      </Wrapper>,
    )

    userEvent.type(screen.getByLabelText('input.address'), 'Cal')
    await screen.findByLabelText('Calle de Colón, 1 - Madrid, España')

    const [firstOption, secondOption] = screen.getAllByRole('option')

    userEvent.keyboard('{arrowdown}')
    expect(firstOption).toHaveClass('suggest--active')

    userEvent.keyboard('{arrowdown}')
    expect(secondOption).toHaveClass('suggest--active')

    userEvent.keyboard('{arrowup}')
    expect(firstOption).toHaveClass('suggest--active')
  })

  it('should select the option with the ENTER key', async () => {
    const onSuggestSelect = vi.fn()

    mockAddressSuggestions([
      createAddressSuggestion('place1', {
        street: 'Calle de Colón',
        town: 'Madrid',
      }),
    ])

    render(
      <Wrapper>
        <GeosuggestInputContainer
          inputValue=""
          inputName="street-name"
          label="input.address"
          onSuggestSelect={onSuggestSelect}
          onManuallyAddressSelect={vi.fn()}
          onChange={vi.fn()}
          onClear={vi.fn()}
        />
      </Wrapper>,
    )

    const list = screen.getByRole('listbox')

    userEvent.type(screen.getByLabelText('input.address'), 'Cal')
    await screen.findByLabelText('Calle de Colón - Madrid, España')

    userEvent.keyboard('{arrowdown}{enter}')

    expect(list).toHaveClass('geosuggest-input-list--hide')
    expect(onSuggestSelect).toHaveBeenCalledWith({
      placeId: 'place1',
      primaryText: 'Calle de Colón',
      secondaryText: 'Madrid, España',
      position: 0,
      types: ['street_address', 'geocode'],
    })
  })

  it('should select the option with the TAB key', async () => {
    const onSuggestSelect = vi.fn()

    mockAddressSuggestions([
      createAddressSuggestion('place1', {
        street: 'Calle de Colón',
        town: 'Madrid',
      }),
    ])

    render(
      <Wrapper>
        <GeosuggestInputContainer
          inputValue=""
          inputName="street-name"
          label="input.address"
          onSuggestSelect={onSuggestSelect}
          onManuallyAddressSelect={vi.fn()}
          onChange={vi.fn()}
          onClear={vi.fn()}
        />
      </Wrapper>,
    )

    const list = screen.getByRole('listbox')

    userEvent.type(screen.getByLabelText('input.address'), 'Cal')

    await screen.findByLabelText('Calle de Colón - Madrid, España')

    userEvent.keyboard('{arrowdown}')
    userEvent.tab()

    expect(list).toHaveClass('geosuggest-input-list--hide')
    expect(onSuggestSelect).toHaveBeenCalledWith({
      placeId: 'place1',
      primaryText: 'Calle de Colón',
      secondaryText: 'Madrid, España',
      position: 0,
      types: ['street_address', 'geocode'],
    })
  })
})
