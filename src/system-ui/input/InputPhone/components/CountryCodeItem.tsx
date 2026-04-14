import { useEffect, useRef } from 'react'

import { CountryCode } from '../interfaces'
import classNames from 'classnames'

import { TAB_INDEX } from 'utils/constants'

import './CountryCodeItem.css'

interface CountryCodeItemProps {
  countryCode: CountryCode
  isActive: boolean
  onHover: () => void
  onSelect: () => void
}

export const CountryCodeItem = ({
  isActive,
  countryCode,
  onSelect,
  onHover,
}: CountryCodeItemProps) => {
  const countryCodeRef = useRef<HTMLLIElement>(null)

  useEffect(() => {
    if (isActive) {
      countryCodeRef.current?.focus()
    }
  }, [isActive])

  return (
    <li
      ref={countryCodeRef}
      className={classNames('country-code-item', {
        'country-code-item--active': isActive,
      })}
      data-active={isActive}
      onMouseOver={onHover}
      onClick={onSelect}
      tabIndex={TAB_INDEX.DISABLED}
    >
      +{countryCode.phoneCountryCode} {countryCode.flag}
    </li>
  )
}
