import { useFlag as useUnleashFlag } from '@unleash/proxy-client-react'

export const useFlag = (flagName: string): boolean => useUnleashFlag(flagName)
