import { useRef } from 'react'

import PropTypes from 'prop-types'

import { useId } from 'hooks/useId'

import './Switch.css'

export const Switch = ({ label, id, ...props }) => {
  const innerId = useId()
  const innerInputRef = useRef()

  const inputId = id ?? innerId

  const handleSwitcherClick = () => {
    innerInputRef.current.click()
  }

  return (
    <div className="ui-switch">
      <label className="ui-switch__label" htmlFor={inputId}>
        {label}
      </label>

      <input
        {...props}
        id={inputId}
        ref={innerInputRef}
        className="ui-switch__input"
        type="checkbox"
        role="switch"
      />
      <button
        type="button"
        className="ui-switch__switcher"
        onClick={handleSwitcherClick}
      />
    </div>
  )
}

// Extends native Omit<HTMLInputElement, 'type' | 'role' | 'className'> props
Switch.propTypes = {
  label: PropTypes.string.isRequired,
  id: PropTypes.string,
}
