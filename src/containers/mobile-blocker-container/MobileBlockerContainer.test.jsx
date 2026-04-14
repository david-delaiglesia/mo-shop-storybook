import { render, screen } from '@testing-library/react'

import { MobileBlockerContainer } from './MobileBlockerContainer'

const showMobileBlocker = () => {
  window.matchMedia = vi.fn().mockReturnValue({ matches: false })
}

const mockUserAgent = (value) => {
  const userAgentGetter = vi.spyOn(window.navigator, 'userAgent', 'get')
  userAgentGetter.mockReturnValue(value)
}

it('do not display the children if the user is in mobile view', async () => {
  showMobileBlocker()
  mockUserAgent('android')

  render(
    <MobileBlockerContainer location={{ pathname: '/home/' }}>
      <div>Content</div>
    </MobileBlockerContainer>,
  )

  expect(screen.queryByText('Content')).not.toBeInTheDocument()
})
