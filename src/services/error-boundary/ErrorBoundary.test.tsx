import { render, screen, waitFor } from '@testing-library/react'

import { ErrorBoundary } from './ErrorBoundary'
import { monitoring } from 'monitoring'
import { bool } from 'prop-types'

const BuggyComponent = ({ isThrowError = false }) => {
  if (isThrowError) {
    throw new Error('Custom error')
  }

  return <div>this is the content</div>
}

BuggyComponent.propTypes = {
  isThrowError: bool,
}

it('displays the content of the component if no error occurs', () => {
  render(
    <ErrorBoundary>
      <BuggyComponent />
    </ErrorBoundary>,
  )

  expect(screen.getByText('this is the content')).toBeInTheDocument()
})

it('calls the monitoring captureError method when a rendering error occurs', async () => {
  render(
    <ErrorBoundary>
      <BuggyComponent isThrowError />
    </ErrorBoundary>,
  )

  await waitFor(() => {
    expect(monitoring.captureError).toHaveBeenCalledWith(
      new Error('Custom error'),
    )
  })
})
