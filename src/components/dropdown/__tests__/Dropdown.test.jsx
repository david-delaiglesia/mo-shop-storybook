import { render, screen } from '@testing-library/react'
import { Fragment } from 'react'

import Dropdown, { DropdownWithClickOut } from '../Dropdown'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

describe('<Dropdown />', () => {
  it('should call toggleDropdown on click', () => {
    const toggleDropdown = vi.fn()
    render(
      <Dropdown
        content={<div>Content</div>}
        header={<header>Header</header>}
        open={false}
        toggleDropdown={toggleDropdown}
      />,
    )

    userEvent.click(screen.getByText('Header'))

    expect(toggleDropdown).toHaveBeenCalled()
    expect(screen.queryByText('Content')).not.toBeInTheDocument()
  })

  it('should show list on opened', () => {
    render(
      <Dropdown
        content={<div>Content</div>}
        header={<header>Header</header>}
        open={true}
        toggleDropdown={vi.fn()}
      />,
    )

    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('should close dropdown list on clicking outside', () => {
    const handleClickOutside = vi.fn()
    render(
      <Fragment>
        <div>I&apos;m outside</div>
        <DropdownWithClickOut
          handleClickOutside={handleClickOutside}
          content={<div>Content</div>}
          header={<header>Header</header>}
          open={true}
          toggleDropdown={vi.fn()}
        />
      </Fragment>,
    )

    userEvent.click(screen.getByText("I'm outside"))

    expect(handleClickOutside).toHaveBeenCalled()
  })
})
