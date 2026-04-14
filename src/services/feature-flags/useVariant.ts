import { useVariant as useUnleashVariant } from '@unleash/proxy-client-react'

export const useVariant = (variantName: string) =>
  useUnleashVariant(variantName)
