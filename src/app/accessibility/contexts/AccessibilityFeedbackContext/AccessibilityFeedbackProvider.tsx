import { ReactNode, useState } from 'react'

import { AriaLive } from '../../components/AriaLive'
import { AccessibilityFeedbackContext } from './AccessibilityFeedbackContext'

export const AccessibilityFeedbackProvider = ({
  children,
}: {
  children: ReactNode
}) => {
  const [feedbackText, _setFeedbackText] = useState<string>('')

  const readTextAgainIfNeeded = (previousText: string, text: string) => {
    if (previousText === text?.toUpperCase()) {
      return text?.toLowerCase()
    }

    return text?.toUpperCase()
  }
  const setFeedbackText = (text: string) => {
    _setFeedbackText((previousText) => {
      return readTextAgainIfNeeded(previousText, text)
    })
  }

  return (
    <AccessibilityFeedbackContext.Provider
      value={{ feedbackText, setFeedbackText }}
    >
      <AriaLive text={feedbackText} />
      {children}
    </AccessibilityFeedbackContext.Provider>
  )
}
