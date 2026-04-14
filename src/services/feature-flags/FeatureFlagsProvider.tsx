import { FlagProvider, UnleashClient } from '@unleash/proxy-client-react'
import { ReactNode } from 'react'

import { FlagsAuthConnector } from './FlagsAuthConnector'
import { FlagsCenterCodeConnector } from './FlagsCenterCodeConnector'
import { FlagsMonitoringConnector } from './FlagsMonitoringConnector'
import { AppConfig } from 'config'

interface FeatureFlagsProviderProps {
  children: ReactNode
}

const UNLEASH_NO_POLLING = 0

export const unleashClient = new UnleashClient({
  url: AppConfig.UNLEASH_URL,
  clientKey: AppConfig.UNLEASH_TOKEN,
  appName: AppConfig.APP_NAME,
  /**
   * Disable polling in favor of manual updates on navigation
   * @see FeatureFlagFetchByRoute
   */
  refreshInterval: UNLEASH_NO_POLLING,
  context: {
    properties: {
      webVersion: AppConfig.APP_VERSION_NUMBER,
    },
  },
})

export const FeatureFlagsProvider = ({
  children,
}: FeatureFlagsProviderProps) => {
  return (
    <FlagProvider unleashClient={unleashClient}>
      <FlagsAuthConnector />
      <FlagsCenterCodeConnector />
      <FlagsMonitoringConnector />
      {children}
    </FlagProvider>
  )
}
