import { render, screen } from '@testing-library/react'

import { useAccessibleTooltip } from '../useAccessibleTooltip'

import { pressEnter } from 'pages/helpers'
import { TAB_INDEX } from 'utils/constants'

const Component = () => {
  const { tooltipTextAriaLive, readTooltip } =
    useAccessibleTooltip('tooltip text')

  return (
    <>
      {tooltipTextAriaLive}
      <div
        tabIndex={TAB_INDEX.ENABLED}
        data-testid="tooltip-div"
        onKeyDown={readTooltip}
      ></div>
    </>
  )
}

describe('useAccessibleTooltip', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('should generate tooltip text', () => {
    render(<Component />)

    pressEnter(screen.getByTestId('tooltip-div'))

    expect(screen.getByText('tooltip text.')).toBeInTheDocument()
  })
})
