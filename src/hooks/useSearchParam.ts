import { useMemo } from 'react'

import { useSearchParams } from './useSearchParams'

export const useSearchParam = (
  paramName: string,
): [
  string | null,
  (value: string, options?: { replace?: boolean }) => void,
  () => void,
] => {
  const { searchParams, addSearchParam, setSearchParams, clearSearchParam } =
    useSearchParams()

  return [
    useMemo(() => searchParams.get(paramName), [paramName, searchParams]),
    (value: string, options?: { replace?: boolean }) => {
      if (options?.replace) {
        setSearchParams({ [paramName]: value })
        return
      }

      addSearchParam(paramName, value)
    },
    () => clearSearchParam(paramName),
  ]
}
