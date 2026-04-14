import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { matchPath, useHistory } from 'react-router'

import { node } from 'prop-types'

import { createThunk } from '@mercadona/mo.library.dashtil'

import { createSession } from 'app/authentication/actions'
import { AuthClient } from 'app/authentication/client'
import { updatePostalCode } from 'app/authentication/commands'
import { setLoggedUser } from 'app/user/actions'
import { PATHS, URL_PARAMS } from 'pages/paths'
import { Cache } from 'services/cache'
import { HTTP_STATUS } from 'services/http'
import { Recaptcha } from 'services/recaptcha'
import { Session } from 'services/session'
import { Storage } from 'services/storage'
import { Support } from 'services/support'
import { Tracker } from 'services/tracker'

const AUTH_ROUTES = [
  PATHS.CHECKOUT,
  PATHS.PURCHASE_CONFIRMATION,
  PATHS.EDIT_ORDER_PRODUCTS,
  PATHS.USER_AREA_ORDERS,
  PATHS.USER_AREA_ORDERS_ID,
  PATHS.USER_AREA_PERSONAL_INFO,
  PATHS.USER_AREA_ADDRESS,
  PATHS.USER_AREA_PAYMENTS,
]

const AuthInitializer = ({ children }) => {
  const dispatch = useDispatch()
  const { postalCode, uuid } = Session.get()
  const history = useHistory()
  const { location } = history

  useEffect(() => {
    Tracker.initialize()
    Support.initialize()
    Storage.clear()
    Cache.reloadOnWindowFocus()

    if (postalCode) {
      dispatch(createThunk(updatePostalCode)(postalCode))
    }

    if (!uuid) {
      Session.remove()
      return
    }

    getUser()
  }, [])

  useEffect(() => {
    Recaptcha.init()
  }, [])

  const getUser = async () => {
    const token = Session.getToken()

    try {
      const user = await AuthClient.getUserData(uuid)
      Support.identify(user)
      Tracker.identifyExistingUser(uuid)
      dispatch(createSession(user))
      dispatch(setLoggedUser(user))
      Session.saveUser({ uuid, token })
    } catch (error) {
      if (error.status === HTTP_STATUS.FORCE_UPDATE) return

      Session.remove()
    }
  }

  const getLoginRoute = () => {
    const searchParams = new URLSearchParams(location.search)
    searchParams.set(URL_PARAMS.AUTHENTICATE_USER, '')
    return { pathname: PATHS.HOME, search: searchParams.toString() }
  }

  const requiresAuth = AUTH_ROUTES.some((path) =>
    matchPath(location.pathname, { path }),
  )

  if (!uuid && requiresAuth) {
    const loginRoute = getLoginRoute()
    history.push(loginRoute)
  }

  return children
}

AuthInitializer.propTypes = {
  children: node.isRequired,
}

export { AuthInitializer }
