import { DeviceId } from './device-id'
import { EventWithUserId } from './interfaces'
import { monitoring } from 'monitoring'

import { knownFeatureFlags } from 'services/feature-flags'
import { unleashClient } from 'services/feature-flags/FeatureFlagsProvider'

const APP_VERSION = import.meta.env.VITE_APP_VERSION

export const getMetricsPayload = (currentQueue: EventWithUserId[]) => {
  const isDeviceIdEnabled = unleashClient.isEnabled(
    knownFeatureFlags.WEB_MO_ANALYTICS_DEVICE_ID,
  )

  const eventList = currentQueue.map((event) => ({
    id: event.id,
    user_id: event.userId,
    occurred_at: event.occurredAt,
    name: event.name,
    properties: event.properties || {},
    user_properties: {
      version: APP_VERSION,
      platform: 'web',
      ...(isDeviceIdEnabled && { device_id: DeviceId.get() }),
    },
  }))

  return {
    events: eventList,
  }
}

export const wasPageReloaded = () => {
  // Método moderno
  if (performance.getEntriesByType) {
    const nav = performance.getEntriesByType('navigation')[0] as
      | PerformanceNavigationTiming
      | undefined
    if (nav) return nav.type === 'reload'
  }

  // Fallback legacy
  if (performance.navigation) {
    monitoring.sendMessage(
      '[MOAnalytics] checking reload using the fallback method',
    )
    return performance.navigation.type === 1
  }

  return false
}
