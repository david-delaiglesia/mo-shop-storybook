import { DependencyList, ReactElement, useEffect } from 'react'

import { useAccessibilityFocus } from '../hooks/useAccessibilityFocus'
import { FocusedElement } from './FocusedElement'

interface FocusedElementWithInitialFocusProps {
  children: ReactElement<HTMLElement>
  enabled?: boolean
  inner?: boolean
  effectDeps?: DependencyList
}

export const FocusedElementWithInitialFocus = ({
  children,
  enabled = true,
  inner = false,
  effectDeps = [],
}: FocusedElementWithInitialFocusProps) => {
  const { setFocusRef, focusOnElement } = useAccessibilityFocus({
    initialFocus: enabled,
  })

  useEffect(() => {
    if (enabled) {
      focusOnElement()
    }
  }, [...effectDeps])

  return (
    <FocusedElement innerRef={setFocusRef} inner={inner}>
      {children}
    </FocusedElement>
  )
}
