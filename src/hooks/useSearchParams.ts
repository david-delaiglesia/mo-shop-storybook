import { useMemo } from 'react'
import { useHistory, useLocation } from 'react-router-dom'

interface ReadOnlyURLSearchParams extends URLSearchParams {
  append: never
  set: never
  delete: never
  sort: never
}

interface UseSearchParamsResult {
  searchParams: ReadOnlyURLSearchParams
  addSearchParam: (paramName: string, paramValue: string) => void
  setSearchParams: (params?: Record<string, string>) => void
  clearAllSearchParams: () => void
  clearSearchParams: (paramNames: string[]) => void
  clearSearchParam: (paramName: string) => void
}

export const useSearchParams = (): UseSearchParamsResult => {
  const { search, pathname } = useLocation()

  const history = useHistory()

  const searchParams = useMemo(() => new URLSearchParams(search), [search])

  const addSearchParam = (paramName: string, paramValue: string) => {
    searchParams.set(paramName, paramValue)
    history.replace({
      pathname: pathname,
      search: searchParams.toString(),
    })
  }

  const setSearchParams = (params?: Record<string, string>) => {
    history.replace({
      pathname: pathname,
      search: new URLSearchParams(params).toString(),
    })
  }

  const clearAllSearchParams = () => {
    history.replace({
      pathname: pathname,
      search: '',
    })
  }

  const clearSearchParams = (paramNames: string[]) => {
    paramNames.forEach((paramName) => searchParams.delete(paramName))
    history.replace({
      pathname: pathname,
      search: searchParams.toString(),
    })
  }

  const clearSearchParam = (paramName: string) => {
    clearSearchParams([paramName])
  }

  return {
    searchParams: searchParams as ReadOnlyURLSearchParams,
    addSearchParam,
    setSearchParams,
    clearAllSearchParams,
    clearSearchParams,
    clearSearchParam,
  }
}
