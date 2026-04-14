import { render } from '@testing-library/react'

import { useAccessibilityFeedback } from './useAccessibilityFeedback'
import { monitoring } from 'monitoring'
import { expect } from 'vitest'

const Component = () => {
  useAccessibilityFeedback()

  return <></>
}

it('should send monitoring log if context is used outside of provider', () => {
  render(<Component />)
  expect(monitoring.captureError).toHaveBeenCalledWith(
    new Error('useAccessibility must be used within an AccessibilityProvider'),
  )
})
