import { Fragment, PureComponent } from 'react'
import { withRouter } from 'react-router'

import { node, shape, string } from 'prop-types'

import { MobileBlockerLayout } from 'components/mobile-blocker-layout'
import { MOBILE_OS, MobileDetector } from 'libs/mobile-detector'
import { PATHS } from 'pages/paths'
import { comparePath } from 'pages/routing'
import { Session } from 'services/session'
import { MOBILE_BLOCKER_WHITELIST } from 'utils/constants'

const MOBILE_BLOCK = import.meta.env.VITE_MOBILE_BLOCK

export const MobileBlockerContainer = ({ children, location }) => {
  return (
    <MobileBlockerContainerPureComponent location={location}>
      {children}
    </MobileBlockerContainerPureComponent>
  )
}

export class MobileBlockerContainerPureComponent extends PureComponent {
  state = {
    isMobile: undefined,
  }

  constructor() {
    super()

    this.handleResize = this.handleResize.bind(this)
    this.checkMobileResolution = this.checkMobileResolution.bind(this)
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleResize)
    this.checkMobileResolution()
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize)
  }

  componentDidUpdate(prevProps) {
    const { pathname: prevPathName } = prevProps.location
    const { pathname } = this.props.location

    if (prevPathName === pathname) return

    this.checkMobileResolution()
  }

  handleResize() {
    cancelAnimationFrame(this.resizeRafTimer)
    this.resizeRafTimer = requestAnimationFrame(this.checkMobileResolution)
  }

  checkMobileResolution() {
    try {
      const shouldBlock = this.shouldBlock()
      const isDesktopDevice =
        MobileDetector.getMobileOperatingSystem() === MOBILE_OS.GENERIC

      if (shouldBlock && isDesktopDevice) {
        return this.setState({ isMobile: false })
      }

      if (shouldBlock) {
        return this.setState({ isMobile: true })
      }

      return this.setState({ isMobile: false })
    } catch {
      return this.setState({ isMobile: false })
    }
  }

  shouldBlock() {
    if (this.isCurrentPageResponsive()) return false

    const mobileMediaQuery = window.matchMedia(`(min-width: ${MOBILE_BLOCK}px)`)
    return mobileMediaQuery && !mobileMediaQuery.matches
  }

  hasPostalCodeAlready = () => {
    const { postalCode } = Session.get()
    return !!postalCode
  }

  isCurrentPageResponsive() {
    const { pathname } = this.props.location

    const canLoadOnMobile = this.hasPostalCodeAlready()
      ? MOBILE_BLOCKER_WHITELIST
      : [...MOBILE_BLOCKER_WHITELIST, PATHS.PRODUCT, PATHS.PRODUCT_SLUG]

    return !!canLoadOnMobile.find((path) => comparePath(pathname, path))
  }

  render() {
    let layout = 'Generic'
    try {
      layout = MobileDetector.getMobileOperatingSystem()
    } catch {
      /* empty */
    }

    if (this.state.isMobile === undefined) {
      return <Fragment></Fragment>
    }

    return (
      <Fragment>
        {this.state.isMobile && <MobileBlockerLayout layout={layout} />}
        {!this.state.isMobile && this.props.children}
      </Fragment>
    )
  }
}

MobileBlockerContainerPureComponent.propTypes = {
  children: node.isRequired,
  location: shape({
    pathname: string.isRequired,
  }).isRequired,
}

MobileBlockerContainer.propTypes = {
  children: node.isRequired,
  location: shape({
    pathname: string.isRequired,
  }).isRequired,
}

export default withRouter(MobileBlockerContainer)
