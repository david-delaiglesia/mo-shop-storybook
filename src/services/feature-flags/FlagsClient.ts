import { unleashClient } from './FeatureFlagsProvider'

export const FlagsClient = {
  isEnabled(flagName: string): boolean {
    return unleashClient.isEnabled(flagName)
  },
}
