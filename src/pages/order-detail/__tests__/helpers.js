import { screen, within } from '@testing-library/react'

import userEvent from '@testing-library/user-event'

const openServiceRating = () => {
  userEvent.click(screen.getByRole('button', { name: 'Rate' }))
}

const closeServiceRating = () => {
  const serviceRatingDialog = screen.getByRole('dialog')
  userEvent.click(
    within(serviceRatingDialog).getByRole('button', { name: 'Close' }),
  )
}

const openHelpChat = () => {
  userEvent.click(screen.getByRole('button', { name: 'Help' }))
}

export { openServiceRating, closeServiceRating, openHelpChat }
