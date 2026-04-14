import { render, screen } from '@testing-library/react'

import { Skeleton } from './Skeleton'

it('Displays default Skeleton', () => {
  render(<Skeleton aria-label="skeleton" />)

  const skeleton = screen.getByRole('status')
  expect(skeleton).toBeInTheDocument()

  expect(skeleton).toHaveStyle('width: 100%')
  expect(skeleton).toHaveStyle('height: 100%')
})

it('Displays Skeleton with custom size', () => {
  render(<Skeleton aria-label="skeleton" width="50px" height="80px" />)

  const skeleton = screen.getByRole('status')
  expect(skeleton).toBeInTheDocument()

  expect(skeleton).toHaveStyle('width: 50px')
  expect(skeleton).toHaveStyle('height: 80px')
})
