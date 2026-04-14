import { useEffect } from 'react'

import { useFlags } from './useFlags'
import { getActiveKnownFlags } from './utils'

import { Tracker } from 'services/tracker'

export const FlagsMonitoringConnector = () => {
  const unleashFlags = useFlags()

  useEffect(() => {
    const activeUnleashFeatureFlags = getActiveKnownFlags(unleashFlags)

    if (!activeUnleashFeatureFlags) return

    Tracker.setUserProperties(activeUnleashFeatureFlags)
  }, [unleashFlags])

  return null
}
