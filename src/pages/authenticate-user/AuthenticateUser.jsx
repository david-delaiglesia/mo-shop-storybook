import { useSelector } from 'react-redux'
import { Redirect, useLocation } from 'react-router-dom'

import { PATHS, URL_PARAMS } from 'pages/paths'

const AuthenticateUser = () => {
  const location = useLocation()
  const { isAuth } = useSelector(({ session }) => session)

  if (isAuth) {
    return <Redirect to={PATHS.HOME} />
  }

  const getLoginRoute = () => {
    const searchParams = new URLSearchParams(location.search)
    searchParams.set(URL_PARAMS.AUTHENTICATE_USER, '')
    return { pathname: PATHS.HOME, search: searchParams.toString() }
  }

  return <Redirect to={getLoginRoute()} />
}

export { AuthenticateUser }
