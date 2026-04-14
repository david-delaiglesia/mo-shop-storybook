import { render } from '@testing-library/react'
import { UnleashClient, useUnleashClient } from '@unleash/proxy-client-react'
import { useLocation } from 'react-router'

import { FeatureFlagFetchByRoute } from '../FeatureFlagFetchByRoute'
import { Location } from 'history'

vi.unmock('services/feature-flags/FeatureFlagFetchByRoute')

vi.mock('@unleash/proxy-client-react', () => ({
  useUnleashClient: vi.fn(),
  FlagProvider: <></>,
}))

vi.mock('react-router', () => ({
  ...vi.importActual('react-router'),
  useLocation: vi.fn(),
}))

it('should refresh feature flags on navigation', async () => {
  vi.mocked(useLocation).mockReturnValue({
    pathname: '/test-path',
  } as Location)
  const updateToggles = vi.fn()

  vi.mocked(useUnleashClient).mockReturnValue({
    updateToggles,
  } as unknown as UnleashClient)

  render(<FeatureFlagFetchByRoute />)

  expect(updateToggles).toHaveBeenCalled()
})
