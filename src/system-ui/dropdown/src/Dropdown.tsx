import { useEffect, useRef, useState } from 'react'

import {
  findFirstEnabledIndex,
  findLastEnabledIndex,
  findNextEnabledIndex,
  findPrevEnabledIndex,
} from './utils'
import classNames from 'classnames'

import { useClickOut } from '@mercadona/mo.library.dashtil'
import { Button } from '@mercadona/mo.library.shop-ui/button'

import { useId } from 'hooks/useId'
import { MoreActionsHorizontalIcon } from 'system-ui/icons'
import { TAB_INDEX } from 'utils/constants'

import './Dropdown.css'

export interface DropdownOption {
  label: string
  onClick?: () => void
  /**
   * @default 'default'
   */
  mood?: 'default' | 'destructive'
  disabled?: boolean
}

interface DropdownProps {
  label: string
  options: DropdownOption[]
}

export const Dropdown = ({ label, options }: DropdownProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)
  const [focusedIndex, setFocusedIndex] = useState<number>(-1)
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([])
  const triggerRef = useRef<HTMLButtonElement>(null)
  const id = useId()

  const menuId = `${id}-menu`
  const buttonId = `${id}-button`

  const { refContainer } = useClickOut<HTMLDivElement>(
    () => setIsMenuOpen(false),
    isMenuOpen,
  )

  const handleTriggerClick = () => {
    setIsMenuOpen(!isMenuOpen)
    if (!isMenuOpen) {
      const firstEnabled = findFirstEnabledIndex(options)
      setFocusedIndex(firstEnabled !== -1 ? firstEnabled : 0)
    } else {
      setFocusedIndex(-1)
    }
  }

  const handleOptionClick = (option: DropdownOption) => {
    if (option.disabled) return
    setIsMenuOpen(false)
    setFocusedIndex(-1)
    option.onClick?.()
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!isMenuOpen) return

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setFocusedIndex((prevIndex) => findNextEnabledIndex(options, prevIndex))
        break

      case 'ArrowUp':
        event.preventDefault()
        setFocusedIndex((prevIndex) => findPrevEnabledIndex(options, prevIndex))
        break

      case 'Home':
        event.preventDefault()
        setFocusedIndex(findFirstEnabledIndex(options))
        break

      case 'End':
        event.preventDefault()
        setFocusedIndex(findLastEnabledIndex(options))
        break

      case 'Escape':
        event.preventDefault()
        setIsMenuOpen(false)
        setFocusedIndex(-1)
        break

      case 'Tab':
        setIsMenuOpen(false)
        setFocusedIndex(-1)
        break
    }
  }

  useEffect(() => {
    if (isMenuOpen && focusedIndex >= 0 && optionRefs.current[focusedIndex]) {
      optionRefs.current[focusedIndex]?.focus()
    }
  }, [focusedIndex, isMenuOpen])

  useEffect(() => {
    if (!isMenuOpen) {
      triggerRef.current?.focus()
    }
  }, [isMenuOpen])

  return (
    <div className="ui-dropdown">
      <Button
        ref={triggerRef}
        id={buttonId}
        variant="tertiary"
        onClick={handleTriggerClick}
        aria-haspopup="menu"
        aria-expanded={isMenuOpen}
        aria-controls={isMenuOpen ? menuId : undefined}
        aria-label={label}
        icon={MoreActionsHorizontalIcon}
      />

      {isMenuOpen && (
        <div
          ref={refContainer}
          id={menuId}
          role="menu"
          aria-labelledby={buttonId}
          aria-orientation="vertical"
          className="ui-dropdown__menu-options"
          onKeyDown={handleKeyDown}
        >
          {options.map((option, index) => (
            <button
              key={option.label}
              ref={(el) => {
                optionRefs.current[index] = el
              }}
              role="menuitem"
              tabIndex={TAB_INDEX.DISABLED}
              aria-disabled={option.disabled}
              className={classNames(
                'ui-dropdown__menu-option subhead1-r',
                `ui-dropdown__menu-option--${option.mood ?? 'default'}`,
              )}
              onClick={() => handleOptionClick(option)}
              onMouseEnter={() => setFocusedIndex(index)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  handleOptionClick(option)
                }
              }}
              disabled={option.disabled}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
