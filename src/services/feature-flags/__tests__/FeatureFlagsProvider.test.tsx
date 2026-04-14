import { render, waitFor } from '@testing-library/react'
import * as UnleashProxyClientReact from '@unleash/proxy-client-react'

import { FeatureFlagsProvider } from '../FeatureFlagsProvider'

vi.mock('@unleash/proxy-client-react', () => {
  return {
    FlagProvider: () => vi.fn(),
    UnleashClient: vi.fn(),
  }
})

describe('Unleash config', () => {
  it('should initialize unleash without polling with external UnleashClient', async () => {
    vi.spyOn(UnleashProxyClientReact, 'FlagProvider')

    render(
      <FeatureFlagsProvider>
        <></>
      </FeatureFlagsProvider>,
    )

    await waitFor(() => {
      expect(UnleashProxyClientReact.UnleashClient).toHaveBeenCalledWith({
        url: 'https://featureflags.mercadona.es/api/frontend/',
        clientKey: 'some-token',
        appName: 'shop-web',
        refreshInterval: 0,
        context: {
          properties: {
            webVersion: '0',
          },
        },
      })

      expect(UnleashProxyClientReact.FlagProvider).toHaveBeenCalledWith(
        {
          unleashClient: expect.any(UnleashProxyClientReact.UnleashClient),
          children: expect.anything(),
        },
        expect.anything(),
      )
    })
  })
})
