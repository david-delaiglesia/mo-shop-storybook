import React, { useState } from 'react'
import './Dropdown.css'

export interface DropdownProps {
  label?: string
  options?: { value: string; label: string }[]
  placeholder?: string
  disabled?: boolean
  value?: string
  onChange?: (value: string) => void
}

export const Dropdown: React.FC<DropdownProps> = ({
  label = 'Select',
  options = [],
  placeholder = 'Select an option',
  disabled = false,
  value,
  onChange,
}) => {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(value || '')

  const selectedLabel = options.find(o => o.value === selected)?.label

  const handleSelect = (val: string) => {
    setSelected(val)
    setOpen(false)
    onChange?.(val)
  }

  return (
    <div className="drop-down">
      {label && <label style={{ fontSize: 12, color: '#888', marginBottom: 4, display: 'block' }}>{label}</label>}
      <button
        type="button"
        className="drop-down__trigger"
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        aria-haspopup={true}
        aria-expanded={open}
      >
        <span style={{ color: selectedLabel ? '#333' : '#999' }}>
          {selectedLabel || placeholder}
        </span>
        <span style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', fontSize: 10 }}>&#9660;</span>
      </button>
      {open && (
        <div className="dropdown__content">
          {options.map((opt) => (
            <div
              key={opt.value}
              className={`dropdown-item${opt.value === selected ? ' dropdown-item--selected' : ''}`}
              onClick={() => handleSelect(opt.value)}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
