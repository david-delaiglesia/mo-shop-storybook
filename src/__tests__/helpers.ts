import { IToggle } from '@unleash/proxy-client-react'

import { vi } from 'vitest'

import * as FeatureFlagsService from 'services/feature-flags'
import { unleashClient } from 'services/feature-flags/FeatureFlagsProvider'

export const activeFeatureFlags = (flagsToBeActive: string[]) => {
  vi.spyOn(FeatureFlagsService, 'useFlag').mockImplementation((flag) => {
    return flagsToBeActive.includes(flag)
  })
  vi.spyOn(unleashClient, 'isEnabled').mockImplementation((flag) => {
    return flagsToBeActive.includes(flag)
  })
  vi.spyOn(unleashClient, 'getAllToggles').mockImplementation(() => {
    return flagsToBeActive.map(
      (flag) =>
        ({
          name: flag,
          enabled: true,
        }) as unknown as IToggle,
    )
  })
}

export const activeVariant = (variantName: string, variantValue: string) => {
  vi.spyOn(FeatureFlagsService, 'useVariant').mockImplementation(
    (testedVariant) => {
      if (testedVariant === variantName) {
        return {
          name: variantName,
          enabled: true,
          feature_enabled: true,
          payload: {
            type: variantName,
            value: variantValue,
          },
        }
      }

      return {
        name: variantName,
        enabled: false,
        feature_enabled: false,
      }
    },
  )
}
