import { useEffect, useRef } from 'react'

import classNames from 'classnames'
import { bool, func, node, string } from 'prop-types'

import { TAB_INDEX } from 'utils/constants'

import './styles/BaseModal.css'

const focusableElementsSelector = [
  'a[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'button:not([disabled])',
  `[tabindex="${TAB_INDEX.ENABLED}"]`,
]

const BaseModal = (props) => {
  const {
    children,
    className,
    onClose,
    returnFocusToDispatcher,
    baseModalClass,
    ...rest
  } = props

  const modalRef = useRef()

  useEffect(() => {
    const dispatcherElement = document.activeElement
    focusFirstElement()
    document.addEventListener('keydown', handleKeyDown)
    if (!returnFocusToDispatcher) return

    return () => {
      dispatcherElement.focus()
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const getAllFocusableElements = () => {
    return modalRef.current.querySelectorAll(
      focusableElementsSelector.join(', '),
    )
  }

  const focusFirstElement = () => {
    const focusableElements = getAllFocusableElements()
    if (!focusableElements.length) return
    focusableElements[0].focus()
  }

  const handleAccessibilityLoop = (event) => {
    const focusableElements = getAllFocusableElements()
    const firstFocusableElement = focusableElements[0]
    const isFirstFocusableElementActive =
      document.activeElement === firstFocusableElement
    const lastFocusableElement = focusableElements[focusableElements.length - 1]
    const isLastFocusableElementActive =
      document.activeElement === lastFocusableElement

    if (event.shiftKey && isFirstFocusableElementActive) {
      event.preventDefault()
      lastFocusableElement.focus()
      return
    }

    if (!event.shiftKey && isLastFocusableElementActive) {
      event.preventDefault()
      firstFocusableElement.focus()
    }
  }

  const handleKeyDown = (event) => {
    const isTabKey = event.keyCode === 9
    const isEscapeKey = event.key === 'Escape'

    if (isTabKey) return handleAccessibilityLoop(event)

    if (isEscapeKey && onClose) {
      event.stopPropagation()
      onClose()
      return
    }
  }

  const computedClassName = classNames('ui-modal', { [className]: className })

  return (
    <div className={computedClassName}>
      <div
        ref={modalRef}
        className={`ui-modal-content ${baseModalClass}`}
        role="dialog"
        {...rest}
      >
        {children}
      </div>
    </div>
  )
}

BaseModal.propTypes = {
  children: node.isRequired,
  onClose: func.isRequired,
  className: string,
  returnFocusToDispatcher: bool,
  'aria-label': (props) => {
    const isAnyLabelPresent = props['aria-label'] || props['aria-labelledby']
    const isAnyLabelAValidString =
      typeof props['aria-label'] === 'string' ||
      typeof props['aria-labelledby'] === 'string'
    if (!isAnyLabelPresent || !isAnyLabelAValidString) {
      return new Error(
        'Please provide a valid aria-label or a aria-labelledby attribute',
      )
    }
  },
  baseModalClass: string,
}

BaseModal.defaultProps = {
  returnFocusToDispatcher: true,
}

export { BaseModal }
