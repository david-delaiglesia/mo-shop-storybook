import { render, screen, within } from '@testing-library/react'
import React from 'react'

import { AriaLive } from '../components'
import { AccessibilityFeedbackContext } from '../contexts/AccessibilityFeedbackContext'
import { AccessibilityFeedbackProvider } from '../contexts/AccessibilityFeedbackContext'
import userEvent from '@testing-library/user-event'
import { wrap } from 'wrapito'

import { App } from 'app'

const Component = () => {
  const ctx = React.useContext(AccessibilityFeedbackContext)
  if (!ctx) return null

  const { feedbackText, setFeedbackText } = ctx

  return (
    <div>
      <span data-testid="feedback">{feedbackText}</span>
      <button onClick={() => setFeedbackText('Text')}>Set Text</button>
    </div>
  )
}

describe('AccessibilityFeedbackProvider', () => {
  it('should render aria live inside parent container if there is no portal', async () => {
    render(
      <div data-testid="container">
        <AriaLive text="feedback" />
      </div>,
    )

    const ariaLiveContainer = screen.getByTestId('container')
    const ariaLivePolite = await within(ariaLiveContainer).findByText(
      'feedback',
      {
        selector: '[aria-live="polite"]',
      },
    )

    expect(ariaLivePolite).toBeInTheDocument()
  })

  it('toggles case when the same text is passed', async () => {
    render(
      <AccessibilityFeedbackProvider>
        <Component />
      </AccessibilityFeedbackProvider>,
    )

    const button = screen.getByRole('button', { name: 'Set Text' })
    const feedback = screen.getByTestId('feedback')

    userEvent.click(button)
    expect(feedback.textContent).toBe('TEXT')

    userEvent.click(button)
    expect(feedback.textContent).toBe('text')

    userEvent.click(button)
    expect(feedback.textContent).toBe('TEXT')
  })

  it('should render aria live inside the portal', async () => {
    wrap(App).atPath('/').mount()

    const ariaLiveContainer = screen.getByTestId('aria-live-portal')
    const ariaLivePolite = await within(ariaLiveContainer).findByText('', {
      selector: '[aria-live="polite"]',
    })

    expect(ariaLivePolite).toBeInTheDocument()
  })
})
