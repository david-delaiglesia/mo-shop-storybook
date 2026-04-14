import { URL_PARAMS } from 'pages/paths'

const goToRegister = (history) => {
  const { location } = history
  const searchParams = new URLSearchParams(location.search)
  searchParams.set(URL_PARAMS.AUTHENTICATE_USER, '')
  const authorizeLocation = {
    pathname: location.pathname,
    search: searchParams.toString(),
  }

  history.push(authorizeLocation)
}

export { goToRegister }
