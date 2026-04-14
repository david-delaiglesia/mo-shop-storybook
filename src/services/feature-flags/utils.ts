import { unleashClient } from './FeatureFlagsProvider'
import { experiments, knownFeatureFlags } from './constants'

export const getKnownFeatureFlagsNames = (): string[] => {
  return Object.values(knownFeatureFlags)
}

export const getProviderFlags = (): { name: string; enabled: boolean }[] => {
  return unleashClient.getAllToggles()
}

export const getActiveKnownFlags = (
  providerFlags: { name: string; enabled: boolean }[],
): Record<string, boolean> => {
  const knownFlags = getKnownFeatureFlagsNames()

  const activeUnleashFlags = providerFlags
    .filter(({ name }) => knownFlags.includes(name))
    .reduce<Record<string, boolean>>((acc, flag) => {
      acc[flag.name] = flag.enabled
      return acc
    }, {})

  return activeUnleashFlags
}

export const getActiveExperiments = (): Record<string, boolean> => {
  const providerFlags = getProviderFlags()

  return Object.entries(experiments).reduce<Record<string, boolean>>(
    (acc, [name, flagNames]) => {
      const isActive = flagNames.every((flagName) =>
        providerFlags.find((flag) => flag.name === flagName && flag.enabled),
      )

      acc[name] = isActive
      return acc
    },
    {},
  )
}
