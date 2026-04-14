import { FocusEvent, RefObject, useRef, useState } from 'react'

import Input from '../Input'
import { CountryCodeItem } from './components/CountryCodeItem'
import { countryCodes } from './countryCodes'
import { CountryCode } from './interfaces'

import { DropdownWithClickOut } from 'components/dropdown'
import { useEventListener } from 'hooks/useEventListener'
import Icon from 'system-ui/icon'

import './InputPhone.css'

const DEFAULT_COUNTRY_CODE_POSITION = 0
const COUNTRY_CODE_SELECTED_CLASS = 'input-phone__selected-country'
const COUNTRY_CODE_SELECTED_ACTIVE_CLASS = 'active'

interface InputPhoneProps {
  phoneCountryCode?: string
  label: string
  phone?: string
  validation?: object
  autoFocus?: boolean
  datatest?: string
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onSelectCountryCode: (countryCode: CountryCode) => void
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void

  innerRef?: RefObject<HTMLInputElement>
}

export const InputPhone = ({
  phoneCountryCode,
  onSelectCountryCode,
  onChange,
  label,
  phone,
  validation,
  onBlur,
  autoFocus,
  datatest = 'input-phone',
  innerRef,
}: InputPhoneProps) => {
  const [openDropDown, setOpenDropDown] = useState(false)
  const [selectedCountryCodePosition, setSelectedCountryCodePosition] =
    useState(DEFAULT_COUNTRY_CODE_POSITION)

  const countryCodeSelectorRef = useRef<HTMLDivElement>(null)
  const localPhoneRef = useRef<HTMLInputElement>(null)
  const inputPhoneRef = innerRef || localPhoneRef

  const getCountryCodeIndex = () => {
    return countryCodes.findIndex(
      (countryCode) => countryCode.phoneCountryCode === phoneCountryCode,
    )
  }

  const setSelectedCountryCodeIndex = () => {
    const currentCountryCode = getCountryCodeIndex()

    setSelectedCountryCode(currentCountryCode)
  }

  const setSelectedCountryCode = (selectedCountryCodePosition: number) => {
    setSelectedCountryCodePosition(selectedCountryCodePosition)
  }

  const handleSelectCountryCode = (countryCode: CountryCode) => {
    onSelectCountryCode(countryCode)
    toggleDropdown()
    focusOnInput()
  }

  const toggleDropdown = () => {
    setOpenDropDown(!openDropDown)

    if (!openDropDown) {
      setSelectedCountryCodeIndex()
    }
  }

  const closeDropdown = () => {
    setOpenDropDown(false)
  }

  const getSelectedCountryCodeClass = () => {
    if (!openDropDown) {
      return COUNTRY_CODE_SELECTED_CLASS
    }

    return `${COUNTRY_CODE_SELECTED_CLASS} ${COUNTRY_CODE_SELECTED_ACTIVE_CLASS}`
  }

  const focusOnInput = () => {
    inputPhoneRef.current?.focus()
  }

  const renderSelectedCountryCode = () => {
    return (
      <div className={`${getSelectedCountryCodeClass()} ym-hide-content`}>
        <span>+{phoneCountryCode}</span>
        <Icon icon="chevron-down-16" />
      </div>
    )
  }

  const renderCountryCodesList = () => {
    return (
      <ul className="input-phone__country-list">
        {countryCodes.map((countryCode, index) => (
          <CountryCodeItem
            key={index}
            countryCode={countryCode}
            isActive={index === selectedCountryCodePosition}
            onSelect={() => handleSelectCountryCode(countryCode)}
            onHover={() => setSelectedCountryCode(index)}
          />
        ))}
      </ul>
    )
  }

  const handleKeyPress = (event: KeyboardEvent) => {
    const limitPosition = countryCodes.length - 1

    const keysMap: Record<
      string,
      {
        validation: boolean
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        action: (params: any) => void
        parameters?: number | CountryCode
        preventDefault?: boolean
      }
    > = {
      ArrowDown: {
        validation: selectedCountryCodePosition < limitPosition,
        action: setSelectedCountryCode,
        parameters: selectedCountryCodePosition + 1,
        preventDefault: true,
      },
      ArrowUp: {
        validation: selectedCountryCodePosition > DEFAULT_COUNTRY_CODE_POSITION,
        action: setSelectedCountryCode,
        parameters: selectedCountryCodePosition - 1,
        preventDefault: true,
      },
      Enter: {
        validation:
          selectedCountryCodePosition >= DEFAULT_COUNTRY_CODE_POSITION,
        action: openDropDown ? handleSelectCountryCode : toggleDropdown,
        parameters: countryCodes[selectedCountryCodePosition],
      },
      Tab: {
        validation: openDropDown,
        action: toggleDropdown,
      },
      Escape: {
        validation: openDropDown,
        action: toggleDropdown,
      },
    }

    const keyMap = keysMap[event.key]

    if (!keyMap) {
      return
    }
    if (keyMap.validation) {
      keyMap.action(keyMap.parameters)
    }
    if (keyMap.preventDefault) {
      event.preventDefault()
    }
  }

  useEventListener('keydown', handleKeyPress, countryCodeSelectorRef.current)

  return (
    <div className="input-phone" ref={countryCodeSelectorRef}>
      <DropdownWithClickOut
        handleClickOutside={closeDropdown}
        header={renderSelectedCountryCode()}
        content={renderCountryCodesList()}
        open={openDropDown}
        toggleDropdown={toggleDropdown}
        datatest={`${datatest}-country-code`}
      />
      <Input
        validation={validation}
        name="phone"
        label={label}
        value={phone}
        onChange={onChange}
        onBlur={onBlur}
        autoFocus={autoFocus}
        reference={inputPhoneRef}
        datatest={`${datatest}-phone`}
      />
    </div>
  )
}
