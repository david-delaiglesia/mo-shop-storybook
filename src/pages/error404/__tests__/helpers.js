import { fireEvent, screen } from '@testing-library/react'

export const goHome = () => {
  fireEvent.click(screen.getByText('Go to shop'))
}
