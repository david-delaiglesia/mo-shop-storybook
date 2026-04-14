import { useContext } from 'react'

import { AccessibilityFeedbackContext } from './AccessibilityFeedbackContext'
import { monitoring } from 'monitoring'

export const useAccessibilityFeedback = () => {
  const ctx = useContext(AccessibilityFeedbackContext)

  if (!ctx) {
    monitoring.captureError(
      new Error(
        'useAccessibility must be used within an AccessibilityProvider',
      ),
    )
  }
  return ctx
}
