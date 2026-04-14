import { screen, waitFor } from '@testing-library/react'

import { wrap } from 'wrapito'

import { App } from 'app'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'

vi.unmock('services/feature-flags')

const mockSetContextField = vi.fn()
const mockRemoveContextField = vi.fn()
vi.mock('@unleash/proxy-client-react', () => {
  return {
    useUnleashClient: () => {
      return {
        setContextField: mockSetContextField,
        removeContextField: mockRemoveContextField,
      }
    },
    useFlag: vi.fn(),
    useFlags: vi.fn(),
    useVariant: vi.fn(),
    // eslint-disable-next-line react/prop-types
    FlagProvider: ({ children }) => <div>{children}</div>,
    UnleashClient: vi.fn(() => ({
      isEnabled: vi.fn(),
      getAllToggles: vi.fn(() => []),
    })),
  }
})

vi.mock('services/feature-flags', async (importOriginal) => {
  const originalModule = await importOriginal()
  return {
    ...originalModule,
    FeatureFlagFetchByRoute: () => null,
  }
})

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('UserId property', () => {
  it('should set the userId to null in the unleash context if not present', async () => {
    const responses = [
      { path: `/customers/1/home/`, responseBody: homeWithGrid },
    ]
    wrap(App).atPath('/').withNetwork(responses).mount()

    await waitFor(() => {
      expect(mockRemoveContextField).toHaveBeenCalledWith('userId')
    })
  })

  it('should include the userId in the unleash context if present', async () => {
    const responses = [
      { path: `/customers/1/home/`, responseBody: homeWithGrid },
    ]
    wrap(App)
      .atPath('/?authenticate-user')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Novedades')

    expect(mockSetContextField).toHaveBeenCalledWith('userId', '1')
  })
})

describe('CenterCode property', () => {
  it('should include the centerCode in the unleash context', async () => {
    const responses = [
      { path: `/customers/1/home/`, responseBody: homeWithGrid },
    ]
    wrap(App)
      .atPath('/?authenticate-user')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Novedades')

    expect(mockSetContextField).toHaveBeenCalledWith('centerCode', 'vlc1')
  })
})
