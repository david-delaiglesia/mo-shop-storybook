import { Component } from 'react'
import { connect } from 'react-redux'
import { matchPath, withRouter } from 'react-router-dom'

import warningImage from '../app/assets/warning.png'
import alertCartIcon from './assets/alert_cart.png'
import warehouseChangedIcon from './assets/warehouse-changed.jpg'
import { monitoring } from 'monitoring'
import { bool, func, number, shape, string } from 'prop-types'

import { createThunk } from '@mercadona/mo.library.dashtil'

import { AddressMetrics } from 'app/address/metrics'
import { logout } from 'app/authentication/commands'
import {
  MaxWaterLitersInCartException,
  MinPurchaseAmountNotReachedException,
} from 'app/cart'
import { CartClient } from 'app/cart/client'
import { toggleCart } from 'app/cart/containers/cart-button-container/actions'
import extraWaterImage from 'app/catalog/containers/product-extra-water-handler/assets/extra@2x.png'
import { hideAlert, showAlert } from 'app/shared/alert/actions'
import {
  sendContinueMinimunPriceAlert,
  sendForceUpdateAlertConfirmClickMetrics,
  sendForceUpdateAlertViewMetrics,
  sendUnavailableProductsMinimunPriceAlertViewMetrics,
} from 'app/shared/metrics'
import { toggleOverlay } from 'containers/overlay-container/actions'
import { cancelCheckout } from 'pages/create-checkout/actions'
import { PATHS, URL_PARAMS } from 'pages/paths'
import { Cache } from 'services/cache'
import { CUSTOM_ERRORS, HTTP_STATUS, NetworkError } from 'services/http'
import { SystemAlert } from 'services/system-alert'
import { Tracker } from 'services/tracker'
import minPurchaseImage from 'system-ui/assets/img/min@2x.png'
import { clearPendingAction } from 'wrappers/feedback/actions'

const DEFAULT = undefined
const {
  BAD_REQUEST,
  UNAUTHORIZED,
  FORBIDDEN,
  NOT_FOUND,
  NOT_ACEPTABLE,
  TIMEOUT,
  CONFLICT,
  SERVER_ERROR,
  TOO_MANY_REQUESTS,
  FORCE_UPDATE,
} = HTTP_STATUS
const {
  WAREHOUSE_CHANGED_NEW,
  LOCATION_PERMISSION_DENIED,
  LOCATION_UNHANDLED_ERROR,
} = CUSTOM_ERRORS
const LOGGING_ERRORS = [SERVER_ERROR, DEFAULT]

class NetworkErrorHandler extends Component {
  errorMapping = {}

  constructor(props) {
    super(props)

    this.unsubscribeFn = NetworkError.subscribe(this.catchNetworkError)

    this.errorMapping = {
      [BAD_REQUEST]: this.showApiError,
      [TOO_MANY_REQUESTS]: this.showApiError,
      [UNAUTHORIZED]: this.redirectToLogin,
      [FORBIDDEN]: this.redirectToLogin,
      [NOT_FOUND]: this.redirectToNotFoundPage,
      [NOT_ACEPTABLE]: this.showMinimunPriceAlert,
      [TIMEOUT]: this.showStatusError,
      [CONFLICT]: this.showStatusError,
      [SERVER_ERROR]: this.redirectToServerErrorPage,
      [WAREHOUSE_CHANGED_NEW]: this.showWarehouseChangedNew,
      [LOCATION_PERMISSION_DENIED]: this.showLocationPermissionDeniedAlert,
      [LOCATION_UNHANDLED_ERROR]: this.showLocationUnhandledAlert,

      [FORCE_UPDATE]: this.updateWebVersion,
      [DEFAULT]: this.showDefaultError,
    }

    this.errorMappingSideEffects = {
      [UNAUTHORIZED]: this.logout,
    }
  }

  componentDidUpdate(prevProps) {
    const { pathname: prevPathname } = prevProps.location
    const { pathname } = this.props.location
    const hasRouteChanged = prevPathname !== pathname
    const isNotFoundPage = !!matchPath(pathname, { path: PATHS.NOT_FOUND })
    const isServerErrorPage = !!matchPath(pathname, {
      path: PATHS.SERVER_ERROR,
    })

    if (hasRouteChanged && (isNotFoundPage || isServerErrorPage)) {
      this.removeErrorStatus()
    }
  }

  componentWillUnmount() {
    this.unsubscribeFn()
  }

  catchNetworkError = async (promiseError) => {
    if (this.props.alert.visible) return

    const { status, detail, code } = await this.getError(promiseError)

    if (!status) return

    const sideEffectsForError = this.errorMappingSideEffects[status]

    sideEffectsForError && sideEffectsForError()

    const customError = this.errorMapping[status]

    if (customError) {
      return customError({ status, detail, code })
    }

    this.showDefaultError()
  }

  getError = async (response) => {
    const errorDetail = await this.parseErrorResponse(response)
    const { status } = response

    if (!errorDetail) {
      return { status }
    }

    return this.getDetail(status, errorDetail)
  }

  getDetail(status, errorDetail) {
    const { errors } = errorDetail

    if (!errors) {
      return { status }
    }
    if (!errors[0]) {
      return { status }
    }

    const errorDetails = errors.map(({ detail }) => detail)
    const detail = errorDetails.join(', ')
    const code = errors[0].code
    return { status, detail, code }
  }

  parseErrorResponse = async (promiseError) => {
    try {
      const { status } = promiseError
      const errorDetail = await promiseError.json()

      const knownError = this.errorMapping[status]
      if (!knownError || LOGGING_ERRORS.includes(status)) {
        monitoring.captureError(
          new Error(
            `Failed to fetch: ${promiseError.url} - Details: ${JSON.stringify(errorDetail)}`,
          ),
        )
      }
      return errorDetail
    } catch {
      return
    }
  }

  redirectToServerErrorPage = () => {
    this.props.history.push(PATHS.SERVER_ERROR)
  }

  redirectToNotFoundPage = () => {
    this.props.history.push(PATHS.NOT_FOUND)
  }

  reloadCart = async () => {
    await this.props.toggleCart()
    this.props.hideAlert()

    if (this.props.cartUI.opened) {
      this.props.history.push(PATHS.HOME)
      this.props.toggleOverlay()
      this.props.toggleCart()
    }
    this.props.cancelCheckout()

    await this.props.toggleCart()
  }

  removeErrorStatus = () => {
    this.props.clearPendingAction()
    this.props.hideAlert()
  }

  logout = () => {
    this.props.logout()
    this.removeErrorStatus()
  }

  redirectToLogin = () => {
    const { location, history } = this.props

    const searchParams = new URLSearchParams(location.search)
    searchParams.set(URL_PARAMS.AUTHENTICATE_USER, '')
    const to = { pathname: location.pathname, search: searchParams.toString() }

    history.push(to)
  }
  handleAlertRedirection = () => {
    const { history } = this.props

    const { pathname } = history.location
    if (!this.props.cartUI.opened) {
      this.props.toggleOverlay()
      this.props.toggleCart()
    }
    if (pathname === '/') return
    if (!pathname.includes('/edit/products')) {
      history.goBack()
    }
  }

  handleMaximumWaterLitersModal = (detail, code) => {
    if (MaxWaterLitersInCartException.isException({ detail, code })) {
      this.handleAlertRedirection()

      const redirectToHomePage = () => {
        this.props.clearPendingAction()
        this.props.hideAlert()
      }
      const waterLimitAlertOptions = {
        title: 'extra_water.title',
        imageSrc: extraWaterImage,
        description: detail,
        confirmButtonAction: redirectToHomePage,
      }
      Tracker.sendViewChange('water_quantity_limit_alert')
      this.props.showAlert(waterLimitAlertOptions)
    }
  }

  /**
   * @param {RawException} exception
   */
  showApiError = (exception) => {
    const { detail, code } = exception
    if (MinPurchaseAmountNotReachedException.isException(exception)) {
      this.showMinimunPriceAlert({ detail })
      return
    }

    const alert = {
      title: 'alerts.400.title',
      description: detail,
      confirmButtonText: 'button.ok',
      confirmButtonAction: this.removeErrorStatus,
    }
    this.props.showAlert(alert)
    this.handleMaximumWaterLitersModal(detail, code)
  }

  showStatusError = ({ status }) => {
    const alert = {
      title: `alerts.${status}.title`,
      description: `alerts.${status}.message`,
      confirmButtonText: 'button.ok',
      confirmButtonAction: this.removeErrorStatus,
    }
    this.props.showAlert(alert)
  }

  showDefaultError = () => {
    const alert = {
      title: 'error_something_went_wrong_title',
      description: 'error_something_went_wrong_subtitle',
      confirmButtonText: 'button.ok',
      confirmButtonAction: this.removeErrorStatus,
    }
    this.props.showAlert(alert)
  }

  updateWebVersion = () => {
    const alert = {
      title: 'alerts.452.title',
      description: 'alerts.452.message',
      confirmButtonText: 'button.refresh',
      confirmButtonAction: () => {
        sendForceUpdateAlertConfirmClickMetrics()
        Cache.clearAndReload()
      },
    }
    sendForceUpdateAlertViewMetrics()
    this.props.showAlert(alert)
  }

  showWarehouseChangesAlert = () => {
    const { showAlert } = this.props
    AddressMetrics.changeHiveAlertView('unnecessary')
    const warehouseChangesAlert = {
      imageSrc: warehouseChangedIcon,
      title: 'change_hive_alert_title_legacy',
      description: 'change_hive_on_address_alert_message',
      confirmButtonText: 'change_hive_on_address_alert_button',
      confirmButtonAction: this.reloadCart,
    }
    showAlert(warehouseChangesAlert)
  }

  showUnpublishedProductsAlert = () => {
    const { showAlert } = this.props
    AddressMetrics.changeHiveAlertView('unpublished_products')
    const alertUnpublishedProducts = {
      imageSrc: alertCartIcon,
      title: 'change_hive_alert_title',
      description: 'change_hive_alert_message',
      confirmButtonText: 'change_hive_alert_button',
      confirmButtonAction: this.reloadCart,
    }
    showAlert(alertUnpublishedProducts)
  }

  handleUnpublishedProducts = (checkout, headerType, cart) => {
    const oldCartUnpublishedProducts = Object.values(cart.products).some(
      (product) => !product.published,
    )
    if (checkout && headerType === 'checkout' && oldCartUnpublishedProducts) {
      this.showWarehouseChangesAlert()
    } else {
      this.showUnpublishedProductsAlert()
    }
  }

  showLocationPermissionDeniedAlert = () => {
    const permissionDeniedAlert = {
      title: 'address_map.locate_me.warning_modal.title',
      description: 'address_map.locate_me.warning_modal.description',
      confirmButtonText: 'address_map.locate_me.warning_modal.button',
      confirmButtonAction: this.removeErrorStatus,
      imageSrc: warningImage,
      imageAlt: 'Warning icon',
    }

    this.props.showAlert(permissionDeniedAlert)
  }

  showLocationUnhandledAlert = () => {
    const locationAlert = {
      title: 'alerts.400.title',
      confirmButtonText: 'button.ok',
      confirmButtonAction: this.removeErrorStatus,
    }

    this.props.showAlert(locationAlert)
  }

  showWarehouseChangedNew = async () => {
    SystemAlert.deactivate()

    const { uuid, checkout, headerType, cart } = this.props

    const isAnonymousUser = typeof uuid === 'undefined'
    const cartIsEmpty = Object.keys(cart?.products ?? {}).length === 0

    if (isAnonymousUser) {
      if (cartIsEmpty) {
        return
      }

      AddressMetrics.changeHiveAlertView('unnecessary')
      const possibleChangesAlert = {
        imageSrc: alertCartIcon,
        title: 'change_hive_alert_title',
        description: 'change_hive_alert_message_legacy',
        confirmButtonText: 'change_hive_alert_button',
        confirmButtonAction: this.reloadCart,
      }
      this.props.showAlert(possibleChangesAlert)
      return
    }

    const cartWithNewWarehouse = await CartClient.getCart(uuid)
    const unpublishedOnCartWithNewWarehouse = cartWithNewWarehouse.products
      .map((e) => e.product)
      .some((e) => !e.published)

    if (unpublishedOnCartWithNewWarehouse) {
      this.handleUnpublishedProducts(checkout, headerType, cart)
      return
    }
    if (!unpublishedOnCartWithNewWarehouse) {
      if (checkout && headerType === 'checkout') {
        this.showWarehouseChangesAlert()
        return
      }
      if (this.props.cartUI.opened) {
        this.reloadCart()
      }
      return
    }
  }

  showMinimunPriceAlert = ({ detail: description = 'alerts.406.message' }) => {
    SystemAlert.deactivate()
    const alert = {
      imageSrc: minPurchaseImage,
      title: 'alerts.406.title',
      description,
      confirmButtonText: 'alerts.406.action',
      confirmButtonAction: () => {
        this.removeErrorStatus()
        this.props.history.push(PATHS.HOME)
        sendContinueMinimunPriceAlert()
        this.props.toggleOverlay()
        this.props.toggleCart()
      },
    }
    this.props.showAlert(alert)
    sendUnavailableProductsMinimunPriceAlertViewMetrics()
  }

  render = () => {
    return null
  }
}

NetworkErrorHandler.propTypes = {
  location: shape({
    pathname: string.isRequired,
  }).isRequired,
  history: shape({
    push: func.isRequired,
  }).isRequired,
  alert: shape({
    visible: bool.isRequired,
  }).isRequired,
  cartUI: shape({
    opened: bool.isRequired,
  }).isRequired,
  headerType: string,
  uuid: string,
  checkout: shape({
    id: number,
  }),
  cart: shape({
    id: string,
  }),
  cancelCheckout: func.isRequired,
  logout: func.isRequired,
  clearPendingAction: func.isRequired,
  showAlert: func.isRequired,
  hideAlert: func.isRequired,
  toggleCart: func.isRequired,
  toggleOverlay: func.isRequired,
}

const mapStateToProps = ({
  ui: { alert, cartUI, headerType },
  session: { uuid },
  checkout,
  cart,
}) => ({
  cart,
  alert,
  cartUI,
  uuid,
  checkout,
  headerType,
})

const mapDispatchToProps = {
  logout: createThunk(logout),
  clearPendingAction,
  showAlert,
  hideAlert,
  toggleCart,
  toggleOverlay,
  cancelCheckout,
}

const ComposedNetworkErrorHandler = withRouter(
  connect(mapStateToProps, mapDispatchToProps)(NetworkErrorHandler),
)

export { ComposedNetworkErrorHandler as NetworkErrorHandler }
