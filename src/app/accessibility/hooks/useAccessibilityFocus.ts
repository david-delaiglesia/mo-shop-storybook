import { useEffect, useState } from 'react'

export const useAccessibilityFocus = ({ initialFocus = true } = {}) => {
  const [focusRef, setFocusRef] = useState<HTMLElement | null>(null)

  const focusOnElement = () => {
    if (focusRef) {
      focusRef.focus()
    }
  }

  useEffect(() => {
    if (initialFocus) {
      focusOnElement()
    }
  }, [initialFocus, focusRef])

  return {
    setFocusRef,
    focusOnElement,
  }
}
