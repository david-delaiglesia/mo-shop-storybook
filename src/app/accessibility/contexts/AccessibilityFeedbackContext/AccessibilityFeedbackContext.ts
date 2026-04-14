import { createContext } from 'react'

interface AccessibilityFeedbackContextType {
  feedbackText: string
  setFeedbackText: (text: string) => void
}

export const AccessibilityFeedbackContext =
  createContext<AccessibilityFeedbackContextType | null>(null)
