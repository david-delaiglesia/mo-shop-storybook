import { useEffect, useState } from 'react'

import { useAddressGeoSuggestions } from './useAddressGeoSuggestions'
import { func, number, string } from 'prop-types'

import { AddressMetrics } from 'app/address'
import { useFlowIdContext } from 'app/shared/flow-id'
import { GeosuggestInput } from 'components/geosuggest-input'

export const initialPosition = -1

export const GeosuggestInputContainer = (props) => {
  const { flowId } = useFlowIdContext()

  const [state, setState] = useState({
    selectedSuggest: initialPosition,
    validInput: false,
    inputValue: props.inputValue,
  })

  const { suggestions, resetSuggestions } = useAddressGeoSuggestions(
    state.inputValue,
  )

  const showSuggests =
    (suggestions.length > 0 || state.inputValue?.length >= 3) &&
    !state.validInput

  useEffect(() => {
    setState((currentState) => ({
      ...currentState,
      inputValue: props.inputValue,
    }))
  }, [props.inputValue])

  const onChange = (event) => {
    const { value } = event.target

    props.onChange(event)

    setState((currentState) => ({
      ...currentState,
      inputValue: value,
      validInput: false,
      selectedSuggest: initialPosition,
    }))
  }

  const handleSuggestSelect = async (suggest) => {
    const { inputValue } = state

    resetSuggestions()
    AddressMetrics.addressSuggestionClick({
      flowId,
      userInput: inputValue,
      position: suggest.position,
      label: `${suggest.primaryText} - ${suggest.secondaryText}`,
      types: suggest.types,
    })
    setValidInput()
    props.onSuggestSelect(suggest)
  }

  const selectManually = async (inputValue, suggestionsAmount) => {
    AddressMetrics.addressManualClick({
      flowId,
      userInput: inputValue,
      suggestionsAmount,
    })
    setValidInput()
    resetSuggestions()
    props.onManuallyAddressSelect(inputValue)
  }

  const setValidInput = () => {
    setState((currentState) => ({
      ...currentState,
      validInput: true,
      selectedSuggest: initialPosition,
    }))
  }

  const onBlur = () => {
    if (!state.validInput) {
      setState((currentState) => ({
        ...currentState,
        inputValue: '',
      }))
      resetSuggestions()
      props.onClear()
    }
  }

  const setSelectedSuggest = (position) => {
    setState((currentState) => ({ ...currentState, selectedSuggest: position }))
  }

  return (
    <GeosuggestInput
      suggests={suggestions}
      suggestActivePosition={state.selectedSuggest}
      onSuggestActiveChange={setSelectedSuggest}
      onChange={onChange}
      onBlur={onBlur}
      onSuggestSelect={handleSuggestSelect}
      onManuallySuggestSelect={selectManually}
      showSuggests={showSuggests}
      label={props.label}
      inputValue={state.inputValue}
      inputName={props.inputName}
      maxLength={props.maxLength}
    />
  )
}

GeosuggestInputContainer.propTypes = {
  label: string.isRequired,
  inputName: string.isRequired,
  inputValue: string,
  maxLength: number,
  onSuggestSelect: func.isRequired,
  onManuallyAddressSelect: func.isRequired,
  onClear: func.isRequired,
  onChange: func.isRequired,
}
