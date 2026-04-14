import React, { useState } from 'react'
import './ButtonPicker.css'

export interface ButtonPickerProps {
  label?: string
  options?: { value: string; label: string; disabled?: boolean }[]
  value?: string
  multiple?: boolean
  onChange?: (value: string | string[]) => void
}

export const ButtonPicker: React.FC<ButtonPickerProps> = ({
  label,
  options = [],
  value,
  multiple = false,
  onChange,
}) => {
  const [selected, setSelected] = useState<string[]>(value ? [value] : [])

  const handleClick = (val: string) => {
    let next: string[]
    if (multiple) {
      next = selected.includes(val) ? selected.filter((v) => v !== val) : [...selected, val]
    } else {
      next = [val]
    }
    setSelected(next)
    onChange?.(multiple ? next : next[0])
  }

  return (
    <div className="button-picker" role="group">
      {label && <span className="button-picker__label">{label}</span>}
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={`button-picker__option${selected.includes(opt.value) ? ' button-picker__option--selected' : ''}`}
          onClick={() => handleClick(opt.value)}
          disabled={opt.disabled}
          aria-pressed={selected.includes(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
