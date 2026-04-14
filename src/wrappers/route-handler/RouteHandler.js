import { Component } from 'react'
import { matchPath, withRouter } from 'react-router'

import PropTypes from 'prop-types'

import { PATHS } from 'pages/paths'
import { comparePath, getRoutePathName } from 'pages/routing'
import { Support } from 'services/support'

const SCA_CONFIRM_KO_URL = 'sca_confirm_ko'
const PREFIX = '@@scroll/'
const SPECIAL_PATHS = {
  WHITE_LIST: [
    PATHS.CATEGORIES,
    PATHS.CATEGORY,
    PATHS.HOME,
    PATHS.MY_REGULARS,
    PATHS.SEARCH_RESULTS,
    PATHS.SEASON,
  ],
  KEEP_SCROLL: [PATHS.PRODUCT, PATHS.AUTHENTICATE_USER],
  ZENDESK: [
    PATHS.HOME,
    PATHS.CREATE_CHECKOUT,
    PATHS.USER_AREA,
    PATHS.PASSWORD_RECOVERY,
    PATHS.CHECKOUT,
  ],
}

let lastContext = null

function getRouteParams(urlPathname, routePathname) {
  if (!routePathname) {
    return null
  }

  const splitedUrl = urlPathname.split('/')
  const splitedRoute = routePathname.split('/')

  let param = null

  for (let i = 0; i < splitedRoute.length; i += 1) {
    if (splitedRoute[i].startsWith(':')) {
      let paramName = splitedRoute[i].slice(1)
      if (paramName.endsWith('?')) {
        paramName = paramName.slice(0, paramName.length - 1)
      }
      param = {
        [paramName]: splitedUrl[i],
      }
    }
  }

  return param
}

export class RouteHandler extends Component {
  locationVisited = {}
  unlisten = () => undefined

  constructor() {
    super()

    this.onScroll = this.onScroll.bind(this)
    this.onRouteChange = this.onRouteChange.bind(this)
  }

  componentDidMount() {
    const { location, history } = this.props

    window.addEventListener('pageshow', (event) => {
      if (event.persisted) window.location.reload()
    })

    this.setZendeskButtonVisibility(location)
    window.history.scrollRestoration = 'manual'
    window.addEventListener('scroll', this.onScroll)
    this.unlisten = history.listen(this.onRouteChange)
  }

  onRouteChange(location, action) {
    this.setZendeskButtonVisibility(location, action)
    this.setScroll(location, action)
    this.setLastContext(location)
  }

  componentWillUnmount() {
    this.unlisten()
    window.history.scrollRestoration = 'auto'
    window.removeEventListener('scroll', this.onScroll)
  }

  onScroll() {
    requestAnimationFrame(() => {
      this.locationVisited[this.getLocationKey(this.props.location.key)] =
        window.scrollY
    })
  }

  getLocationKey(key) {
    return PREFIX + (key || '')
  }

  scrollTo(Y) {
    requestAnimationFrame(() => {
      window.scrollTo(0, Y)
    })
  }

  getScrollY(location) {
    if (!location) {
      return 0
    }

    const key = this.getLocationKey(location.key)
    if (!Object.prototype.hasOwnProperty.call(this.locationVisited, key)) {
      return 0
    }

    return this.locationVisited[key]
  }

  isOneOfTheList(pathname, listOfPaths) {
    return !!listOfPaths.find((path) => comparePath(pathname, path))
  }

  setScroll(location, action) {
    const validLocation = this.getValidLocation(location, action)
    const scrollY = this.getScrollY(validLocation)

    this.scrollTo(scrollY)
  }

  getValidLocation(location, action) {
    const forceKeepScroll = location.state && location.state.keepScroll
    if (forceKeepScroll && lastContext) {
      return lastContext.location
    }

    const keepScroll = this.isOneOfTheList(
      location.pathname,
      SPECIAL_PATHS.KEEP_SCROLL,
    )
    if (keepScroll) {
      return this.props.location
    }

    if (action !== 'PUSH') {
      return location
    }
  }

  getLastLocation(location) {
    if (this.props.location === location) {
      return
    }
    if (this.props.location.pathname === location.pathname) {
      return
    }

    return {
      ...this.props.location,
      state: { from: { pathname: location.pathname } },
    }
  }

  generateLastMatch(location) {
    const routePathname = getRoutePathName(location.pathname)

    if (!routePathname) {
      return
    }

    const params = getRouteParams(location.pathname, routePathname)

    return {
      path: params ? routePathname : location.pathname,
      url: location.pathname,
      params,
    }
  }

  setLastContext(location) {
    const lastLocation = this.getLastLocation(location)
    if (
      lastLocation &&
      this.isOneOfTheList(
        this.props.location.pathname,
        SPECIAL_PATHS.WHITE_LIST,
      )
    ) {
      const lastMatch = this.generateLastMatch(lastLocation)

      lastContext = {
        location: lastLocation,
        match: lastMatch,
      }
    }
  }

  shouldBlockZendeskUpdate = (location, action) => {
    const isReplacing = action === 'REPLACE'
    const isEditPage = !!matchPath(location.pathname, {
      path: PATHS.EDIT_ORDER_PRODUCTS,
    })

    return isReplacing && isEditPage
  }

  setZendeskButtonVisibility(location, action) {
    if (this.shouldBlockZendeskUpdate(location, action)) return

    const shouldShowZendeskButton = this.isOneOfTheList(
      location.pathname,
      SPECIAL_PATHS.ZENDESK,
    )
    if (shouldShowZendeskButton) {
      Support.showButton(location.pathname)
      return
    }

    Support.hideButton()
  }

  render() {
    if (
      this.props.location.pathname &&
      this.props.location.pathname.includes(SCA_CONFIRM_KO_URL)
    )
      return null
    return this.props.children
  }
}

RouteHandler.propTypes = {
  children: PropTypes.node.isRequired,
  location: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
}

export const getLastContext = () => lastContext
export const updateLastContext = (newLastContext) => {
  lastContext = newLastContext
}

export default withRouter(RouteHandler)
