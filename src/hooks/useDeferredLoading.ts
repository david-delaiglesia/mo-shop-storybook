import { useDeferredValue } from './useDeferredValue'

export const useDeferredLoading = (loadings: boolean[]): boolean => {
  const isLoading =
    useDeferredValue(loadings.some(Boolean)) || loadings.some(Boolean)

  return isLoading
}
