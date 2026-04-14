import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { initialPosition } from '../../containers/geosuggest-input-container/GeosuggestInputContainer'
import Input from '../../system-ui/input'
import { ManuallyAddress } from '../manually-address'
import { Suggest } from '../suggest'
import classNames from 'classnames'
import { arrayOf, bool, func, number, shape, string } from 'prop-types'

import { useId } from 'hooks/useId'

import './GeosuggestInput.css'

const VALID_INPUT_LENGTH = 3

const GeosuggestInput = ({
  showSuggests,
  onChange,
  onSuggestSelect,
  onManuallySuggestSelect,
  onBlur,
  label,
  inputValue,
  inputName,
  suggests,
  suggestActivePosition,
  onSuggestActiveChange,
  onFocus,
  maxLength,
}) => {
  const { t } = useTranslation()
  const [announceKey, setAnnounceKey] = useState(0)

  useEffect(() => {
    if (showSuggests && suggests.length > 0) {
      const timeoutId = setTimeout(() => {
        setAnnounceKey((prev) => prev + 1)
      }, 700)

      return () => clearTimeout(timeoutId)
    }
  }, [suggests, showSuggests])

  const handleKeyPress = (event) => {
    const manualPosition = suggests.length
    const validSuggestLength = suggests.length > 0
    const validManualLength =
      !!inputValue && inputValue.length >= VALID_INPUT_LENGTH
    const isSelectedManuallyPosition = suggestActivePosition === manualPosition
    const validManualSendKeys = event.key === 'Enter' || event.key === 'Tab'

    if (
      isSelectedManuallyPosition &&
      validManualSendKeys &&
      validManualLength
    ) {
      return manualHandleKeyPress(event, manualPosition)
    }

    const keysMap = {
      ArrowDown: {
        validation: suggestActivePosition < manualPosition,
        action: onSuggestActiveChange,
        parameters: suggestActivePosition + 1,
      },
      ArrowUp: {
        validation: suggestActivePosition > initialPosition,
        action: onSuggestActiveChange,
        parameters: suggestActivePosition - 1,
      },
      Enter: {
        validation: validSuggestLength && suggestActivePosition >= 0,
        action: onSuggestSelect,
        parameters: suggests[suggestActivePosition],
      },
      Tab: {
        validation: validSuggestLength && suggestActivePosition >= 0,
        action: onSuggestSelect,
        parameters: suggests[suggestActivePosition],
      },
    }

    const keyMap = keysMap[event.key]

    if (keyMap) {
      keyMap.validation && keyMap.action(keyMap.parameters)
      event.preventDefault()
    }
  }

  const manualHandleKeyPress = (event, manualPosition) => {
    onManuallySuggestSelect(inputValue, manualPosition)
    event.preventDefault()
  }

  const manuallyPosition = suggests.length

  const id = useId()
  const listboxId = `${id}-listbox`
  const activeDescendantId =
    suggestActivePosition >= 0
      ? `${id}-option-${suggestActivePosition}`
      : undefined

  return (
    <div className="geosuggest" onBlur={onBlur} onKeyDown={handleKeyPress}>
      <Input
        datatest="geo-suggest-field"
        label={label}
        inputId="geo-suggest"
        onChange={onChange}
        value={inputValue}
        name={inputName}
        maxLength={maxLength}
        autoComplete="off"
        autoFocus
        onFocus={onFocus}
        role="combobox"
        aria-expanded={showSuggests}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        aria-activedescendant={activeDescendantId}
        aria-autocomplete="list"
      />
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {showSuggests && suggests.length > 0
          ? `${t('address_suggestions_count', {
              count: suggests.length,
            })} ${'\u200B'.repeat(announceKey % 2)}`
          : ''}
      </div>
      <ul
        id={listboxId}
        role="listbox"
        aria-orientation="vertical"
        className={classNames('geosuggest-input-list', {
          'geosuggest-input-list--hide': !showSuggests,
        })}
      >
        {suggests.map((suggest) => (
          <Suggest
            key={suggest.placeId}
            id={`${id}-option-${suggest.position}`}
            isActive={suggest.position === suggestActivePosition}
            suggest={suggest}
            onMouseDown={() => {
              onSuggestSelect(suggest)
            }}
            onMouseOver={() => {
              onSuggestActiveChange(suggest.position)
            }}
          />
        ))}

        <ManuallyAddress
          id={`${id}-option-${manuallyPosition}`}
          isActive={manuallyPosition === suggestActivePosition}
          onHover={() => onSuggestActiveChange(manuallyPosition)}
          onSelect={() => onManuallySuggestSelect(inputValue, manuallyPosition)}
        />
      </ul>
    </div>
  )
}

GeosuggestInput.propTypes = {
  showSuggests: bool.isRequired,
  onChange: func.isRequired,
  onSuggestSelect: func.isRequired,
  onManuallySuggestSelect: func.isRequired,
  onBlur: func.isRequired,
  label: string.isRequired,
  inputValue: string,
  inputName: string.isRequired,
  maxLength: number,
  suggests: arrayOf(
    shape({
      primaryText: string.isRequired,
      secondaryText: string.isRequired,
    }),
  ).isRequired,
  suggestActivePosition: number.isRequired,
  onSuggestActiveChange: func.isRequired,
  onFocus: func,
}

export { GeosuggestInput }
