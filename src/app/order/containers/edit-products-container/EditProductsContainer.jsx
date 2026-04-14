import { Component, createRef, useState } from 'react'
import { connect } from 'react-redux'
import { generatePath, withRouter } from 'react-router'
import { useHistory } from 'react-router-dom'

import { bool, func, object, shape, string } from 'prop-types'
import { compose } from 'redux'

import { createThunk } from '@mercadona/mo.library.dashtil'

import {
  MaxSizeAreaExceededException,
  MaxSizeAreaExceededModal,
  MinPurchaseAmountNotReachedException,
} from 'app/cart'
import { replaceCart } from 'app/cart/actions'
import { clearCartAndUpdateFromEditOrder } from 'app/cart/commands'
import { getCart } from 'app/cart/selectors'
import { deserializeCartToStorage, serializeCart } from 'app/cart/serializer'
import { ProductModal } from 'app/catalog/components/product-modal'
import { CART_MODE } from 'app/catalog/metrics'
import { OrderClientTS } from 'app/order'
import { OrderClient } from 'app/order/client'
import { EditOrderProducts } from 'app/order/components/edit-order-products'
import { OrderTimer } from 'app/order/components/order-timer'
import { OrderProvider } from 'app/order/context'
import {
  sendCleanOngoingOrderCartFromLeaveEdition,
  sendEditPurchaseChangesAlertMetrics,
  sendEditionConfirmedMetrics,
  sendMinimumPriceModalViewMetrics,
  sendSystemEditPurchaseAlertConfirmClickMetrics,
  sendSystemEditPurchaseAlertViewMetrics,
} from 'app/order/metrics'
import {
  AuthenticationExemption,
  AuthenticationMode,
  MITTermsModal,
  PSD2Loader,
  PaymentAuthFlow,
  PaymentAuthenticationFailedModal,
  PaymentAuthenticationRequiredException,
  PaymentAuthenticationType,
  PaymentMetrics,
  usePaymentAuthentication,
  usePaymentAuthenticationCallbacks,
} from 'app/payment'
import { SCA_SOURCES, SCA_STATUS_CODES } from 'app/payment/constants'
import { SCAChallengeContainer } from 'app/payment/containers/SCA-challenge-container'
import { FLOWS } from 'app/payment/metrics'
import { hideAlert, showAlert } from 'app/shared/alert/actions'
import { ManagedException, handleManagedError } from 'app/shared/exceptions'
import { Cart, CartService } from 'domain/cart'
import { Order } from 'domain/order'
import { withErrorHandler } from 'errors/withErrorHandler'
import { PATHS } from 'pages/paths'
import { addArrayProduct } from 'pages/product/actions'
import { FlagsClient, knownFeatureFlags, useFlag } from 'services/feature-flags'
import { HTTP_STATUS, NetworkError } from 'services/http'
import { Storage } from 'services/storage'
import { STORAGE_KEYS } from 'services/storage/constants'
import { Support } from 'services/support'
import { SystemAlert } from 'services/system-alert'
import minPurchaseImage from 'system-ui/assets/img/min@2x.png'
import { orderLineMapper } from 'utils/serializer'
import { clearPendingAction } from 'wrappers/feedback/actions'

export class EditProductsContainer extends Component {
  componentMounted = createRef()

  state = {
    order: null,
    hasEditedProducts: false,
    minPurchaseAlert: false,
    requiresAgeCheck: false,
    SCAId: null,
    isBizum: false,
    paymentFlow: PaymentAuthFlow.UPDATE_ORDER_PAYMENT_METHOD,
    maxSizeAreaExceededModal: null,
    pendingMITAuth: null,
  }

  componentDidMount() {
    SystemAlert.activate({
      onView: this.displayNotSavedChangesAlert,
      onConfirm: this.onCloseTab,
    })
    this.componentMounted.current = true

    this.blockBackbuttonBrowser()
  }

  getOrderInfo = async ({ isSCAActive }) => {
    await this.getOrderDetail(this.props.orderId)
    this.getOrderLines(this.props.orderId, { isSCAActive })
  }

  blockBackbuttonBrowser = () => {
    const { history, editingOrder, orderId } = this.props

    const editOrderProductsPath = generatePath(PATHS.EDIT_ORDER_PRODUCTS, {
      id: orderId,
    })

    this.unblock = history.block((_, action) => {
      if (history.location.pathname.toString() !== editOrderProductsPath) return
      if (
        action === 'POP' &&
        this.state.hasEditedProducts &&
        editingOrder &&
        this.componentMounted.current
      ) {
        this.openBackButtonBrowserAlert()
        return false
      }
    })
  }

  componentDidUpdate({ cart: pervCart }) {
    const { cart } = this.props

    if (Cart.isEmpty(pervCart) || !CartService.areDifferent(pervCart, cart))
      return

    const cartProducts = cart.products
    this.checkAgeVerification(cartProducts)

    this.setState({ hasEditedProducts: true })

    if (this.state.hasEditedProducts && this.props.editingOrder) {
      this.blockBackbuttonBrowser()
    }
  }

  componentWillUnmount = () => {
    SystemAlert.deactivate()

    this.unblock?.()

    this.componentMounted.current = false
  }

  displayNotSavedChangesAlert = () => {
    if (!this.state.hasEditedProducts) return

    sendSystemEditPurchaseAlertViewMetrics()
  }

  onCloseTab = () => {
    if (!this.state.hasEditedProducts) return
    this.removeDraft()

    if (Storage.getItem(STORAGE_KEYS.CART_TO_ONGOING_ORDER)) {
      this.removeCartToOngoingOrder()
    }

    sendSystemEditPurchaseAlertConfirmClickMetrics()
  }

  checkAgeVerification(cartProducts) {
    let requiresAgeCheck = false
    for (let i in cartProducts) {
      if (cartProducts[i].requires_age_check) {
        requiresAgeCheck = true
      }
    }
    this.setState({ requiresAgeCheck: requiresAgeCheck })
  }

  async getOrderLines(orderId, { isSCAActive }) {
    let cartDraft
    try {
      cartDraft = await OrderClient.getCartDraft(this.props.userUuid, orderId)
      this.setState({ hasEditedProducts: true })
    } catch (error) {
      this.props.catch(error)
    }

    const cart = Storage.getItem(STORAGE_KEYS.CART_TO_ONGOING_ORDER)
    if (cart) {
      cart.origin = cartDraft?.origin
      this.addCartToStore(cart)
      this.setState({ hasEditedProducts: true })
      return
    }

    try {
      const storedCart = Storage.getItem(STORAGE_KEYS.SCA_CONFIRM)

      if (isSCAActive && storedCart) {
        this.addCartToStore(serializeCart(storedCart))
        return
      }

      const cart = await OrderClient.getCart(this.props.userUuid, orderId)
      this.addCartToStore(cartDraft ?? cart)
    } catch (error) {
      this.props.catch(error)
    }
  }

  confirmEdition = async () => {
    const { order } = this.state
    const { cart } = this.props
    try {
      if (
        FlagsClient.isEnabled(knownFeatureFlags.ORDER_EDIT_LINES_NEW_STRATEGY)
      ) {
        const authConfig = await OrderClientTS.updateLines(
          this.props.userUuid,
          this.props.orderId,
          this.props.cart,
        )

        if (authConfig?.authenticationMode === AuthenticationMode.REDIRECTION) {
          if (authConfig.exemption === AuthenticationExemption.MIT) {
            this.setState({
              pendingMITAuth: {
                isOpen: true,
                paymentAuthenticationUuid: authConfig.authenticationUuid,
              },
            })
            return
          }

          await this.props.launchPaymentAuthentication({
            paymentAuthenticationUuid: authConfig.authenticationUuid,
            paymentMethodType: 'any',
            paymentFlow: PaymentAuthFlow.UPDATE_ORDER_LINES,
            paymentAuthenticationType: PaymentAuthenticationType.AUTH,
          })
          return
        }
      } else {
        await OrderClient.updateCart(
          this.props.userUuid,
          this.props.orderId,
          this.props.cart,
        )
      }

      const totaPrice = Cart.getTotal(cart) + Order.getSlotPrice(order)

      Storage.removeItem(STORAGE_KEYS.SCA_CONFIRM)
      sendEditionConfirmedMetrics({
        orderId: this.props.orderId,
        price: totaPrice,
      })
    } catch (error) {
      this.props.clearPendingAction()
      const isSCARequired = SCA_STATUS_CODES.includes(error.status)
      const isMITRequired = error.status === HTTP_STATUS.MIT

      if (isSCARequired) {
        const errorDetail = await error.json()
        Storage.setItem(
          STORAGE_KEYS.SCA_CONFIRM,
          deserializeCartToStorage(this.props.cart),
        )
        this.setState({
          SCAId: errorDetail.errors[0].detail,
          SCASource: SCA_SOURCES.SCA_CONFIRM,
          isMIT: isMITRequired,
          paymentFlow: PaymentAuthFlow.UPDATE_ORDER_LINES,
          isBizum: false,
        })
        return
      }

      await handleManagedError(error)
        .on(PaymentAuthenticationRequiredException, (exception) => {
          this.unblock?.()

          Storage.setItem(
            STORAGE_KEYS.SCA_CONFIRM,
            deserializeCartToStorage(this.props.cart),
          )
          this.setState({
            SCAId: exception.authentication_uuid,
            SCASource: SCA_SOURCES.SCA_CONFIRM,
            isBizum: true,
            paymentFlow: PaymentAuthFlow.UPDATE_ORDER_LINES,
          })
        })
        .on(MinPurchaseAmountNotReachedException, (exception) => {
          this.openMinimumPurchaseAlert(exception.detail)
          sendMinimumPriceModalViewMetrics(this.props.cart, CART_MODE.EDIT)
        })
        .on(MaxSizeAreaExceededException, (exception) => {
          this.setState({
            maxSizeAreaExceededModal: {
              isOpen: true,
              areasExceeded: exception.areas_exceeded,
            },
          })
        })
        .onUnhandled((unhandled) => {
          PaymentMetrics.paymentErrorView({
            orderId: this.props.orderId,
            errorType:
              unhandled.type === 'managed'
                ? unhandled.exception.code
                : 'unknown',
            errorDescriptionDisplayed:
              unhandled.type === 'managed'
                ? unhandled.exception.detail
                : undefined,
          })
        })
        .run()
      return
    }

    if (
      Storage.getItem(STORAGE_KEYS.CART_TO_ONGOING_ORDER) ||
      Storage.getItem(STORAGE_KEYS.IS_MERGING_ONGOING_ORDER) ||
      Cart.isFromMergeCartOrigin(this.props.cart)
    ) {
      this.props.clearCart()
      this.removeCartToOngoingOrder()
    }
    this.goToOrderDetailWithChanges()
    this.props.clearPendingAction()
  }

  async getOrderDetail(orderId) {
    try {
      await this.getOrderAndCheckStatus(orderId)
    } catch (error) {
      this.props.catch(error)
    }
  }

  openMinimumPurchaseAlert = (errorDetail) => {
    this.props.showAlert({
      title: 'alerts.edit_min_purchase.title',
      description: errorDetail,
      confirmButtonText: 'button.agreed',
      imageSrc: minPurchaseImage,
    })
  }

  confirmEditionAfterSCA = async (cart) => {
    if (!cart) {
      window.history.replaceState(null, null)
      const orderDetailPath = generatePath(PATHS.USER_AREA_ORDERS_ID, {
        id: this.props.orderId,
      })
      this.props.history.push(orderDetailPath)
      return
    }

    await this.addCartToStore(serializeCart(cart))
    this.setState({ hasEditedProducts: true })
    await this.getOrderAndCheckStatus(this.props.orderId)
    this.confirmEdition()
  }

  async getOrderAndCheckStatus(orderId) {
    const order = await OrderClient.getById(this.props.userUuid, orderId)

    if (!order) {
      return
    }

    if (!Order.isConfirmed(order)) {
      return this.props.history.push(PATHS.USER_AREA_ORDERS)
    }

    this.setState({ order })
  }

  addCartToStore(cart) {
    const { orderProducts, miniOrderProducts } = orderLineMapper(cart.products)
    this.props.addArrayProduct(orderProducts)
    this.props.replaceCart({ ...cart, products: miniOrderProducts })
  }

  cancelEdition = () => {
    if (this.state.hasEditedProducts) {
      this.openAlertExitOrder()
      return
    }

    this.goToOrderDetailWithoutChanges()
  }

  openAlertExitOrder = () => {
    this.props.showAlert({
      mood: 'destructive',
      title: 'commons.order.edit.confirmation.title',
      description: 'commons.order.edit.confirmation.message',
      confirmButtonText: 'commons.order.edit.confirmation.confirm',
      confirmButtonAction: this.goToOrderDetailWithoutChanges,
      secondaryActionText: 'commons.order.edit.confirmation.cancel',
      secondaryAction: this.stayInEditOrderProduct,
    })
  }

  openBackButtonBrowserAlert = () => {
    this.props.showAlert({
      mood: 'destructive',
      title: 'commons.order.edit.confirmation.title',
      description: 'commons.order.edit.confirmation.message',
      confirmButtonText: 'commons.order.edit.confirmation.confirm',
      confirmButtonAction: this.goToBackWithoutChanges,
      secondaryActionText: 'commons.order.edit.confirmation.cancel',
      secondaryAction: this.stayInEditOrderProduct,
    })
  }

  goToBackWithoutChanges = () => {
    const options = { option: 'confirm' }
    const { hideAlert, history, location } = this.props
    sendEditPurchaseChangesAlertMetrics(options)
    this.removeCartToOngoingOrder()
    this.removeDraft()
    hideAlert()
    this.componentMounted.current = false
    history.push(location.state ? location.state.from : '/')
  }

  stayInEditOrderProduct = () => {
    const options = { option: 'cancel' }
    sendEditPurchaseChangesAlertMetrics(options)
    this.props.hideAlert()
  }

  goToOrder(state = {}) {
    const orderDetailPath = generatePath(PATHS.USER_AREA_ORDERS_ID, {
      id: this.props.orderId,
    })
    this.props.history.push(orderDetailPath, state)
  }

  goToOrderDetailWithChanges = () => {
    this.componentMounted.current = false
    this.goToOrder({ hasEditedProducts: this.state.hasEditedProducts })
  }

  goToOrderDetailWithoutChanges = () => {
    const options = { option: 'confirm' }
    sendEditPurchaseChangesAlertMetrics(options)
    this.removeCartToOngoingOrder()
    this.removeDraft()
    this.goToOrder({ hasEditedProducts: false })
    this.componentMounted.current = false
    this.props.hideAlert()
  }

  updatePaymentInfoAndConfirm = async (selectedPaymentMethod, cart) => {
    try {
      await OrderClient.updatePaymentInfo(
        this.props.userUuid,
        this.props.orderId,
        selectedPaymentMethod,
      )
      this.confirmEditionAfterSCA(cart)
    } catch (error) {
      const isSCARequired = SCA_STATUS_CODES.includes(error.status)
      const isMITRequired = error.status === HTTP_STATUS.MIT

      if (isSCARequired) {
        const errorDetail = await error.json()
        Storage.setItem(STORAGE_KEYS.SCA_UPDATE_PAYMENT, selectedPaymentMethod)
        this.setState({
          SCAId: errorDetail.errors[0].detail,
          isBizum: false,
          SCASource: SCA_SOURCES.SCA_UPDATE_PAYMENT,
          isMIT: isMITRequired,
          paymentFlow: PaymentAuthFlow.UPDATE_ORDER_PAYMENT_METHOD,
        })
        return error
      }

      if (ManagedException.isManagedError(error)) {
        const exception = await ManagedException.getException(error)

        if (PaymentAuthenticationRequiredException.isException(exception)) {
          this.unblock?.()

          Storage.setItem(
            STORAGE_KEYS.SCA_UPDATE_PAYMENT,
            selectedPaymentMethod,
          )
          this.setState({
            SCAId: exception.authentication_uuid,
            SCASource: SCA_SOURCES.SCA_UPDATE_PAYMENT,
            isBizum: true,
            paymentFlow: PaymentAuthFlow.UPDATE_ORDER_PAYMENT_METHOD,
          })

          return
        }

        PaymentMetrics.paymentErrorView({
          orderId: this.props.orderId,
          errorType: exception.code,
          errorDescriptionDisplayed: exception.detail,
        })
        NetworkError.publish(error)
        return
      }

      PaymentMetrics.paymentErrorView({
        orderId: this.props.orderId,
        errorType: 'unknown',
      })
      NetworkError.publish(error)
    }
  }

  removeCartToOngoingOrder = () => {
    Storage.removeItem(STORAGE_KEYS.IS_MERGING_ONGOING_ORDER)
    Storage.removeItem(STORAGE_KEYS.CART_TO_ONGOING_ORDER)
    sendCleanOngoingOrderCartFromLeaveEdition()
  }

  removeDraft = async () => {
    const { order } = this.state

    try {
      await OrderClient.removeDraft(this.props.userUuid, order.id)
    } catch (error) {
      this.props.catch(error)
    }
  }

  render() {
    const { cart, products, orderId } = this.props
    const { order, SCAId, SCASource, isMIT, maxSizeAreaExceededModal } =
      this.state

    const totalCart = Cart.getTotal(cart)
    const items = Cart.getItemsQuantity(cart)

    return (
      <>
        <SCAChallengeContainer
          id={SCAId}
          source={SCASource}
          paymentMethod={order?.paymentMethod}
          confirm={this.confirmEditionAfterSCA}
          updatePaymentMethod={this.updatePaymentInfoAndConfirm}
          shouldRedirectToHome={true}
          onMounted={this.getOrderInfo}
          flow={FLOWS.EDIT_ORDER}
          isMIT={isMIT}
          isBizum={this.state.isBizum}
          paymentFlow={this.state.paymentFlow}
          orderId={orderId}
        >
          {order && (
            <>
              <OrderProvider order={order}>
                <EditOrderProducts
                  cancelEdition={this.cancelEdition}
                  confirm={this.confirmEdition}
                  cart={cart}
                  totalCart={totalCart}
                  products={products}
                  items={items}
                  orderId={this.props.orderId}
                  minPurchaseAlert={this.state.minPurchaseAlert}
                  requiresAgeCheck={this.state.requiresAgeCheck}
                />
                <ProductModal />
              </OrderProvider>
              <OrderTimer orderId={order.id} />
            </>
          )}
        </SCAChallengeContainer>

        {this.state.SCAId && <PSD2Loader />}
        {maxSizeAreaExceededModal?.isOpen && (
          <MaxSizeAreaExceededModal
            areasExceeded={maxSizeAreaExceededModal.areasExceeded}
            onClose={() => this.setState({ maxSizeAreaExceededModal: null })}
          />
        )}
        {this.state.pendingMITAuth?.isOpen && (
          <MITTermsModal
            onConfirm={() => {
              this.props.launchPaymentAuthentication({
                paymentAuthenticationUuid:
                  this.state.pendingMITAuth.paymentAuthenticationUuid,
                paymentMethodType: 'any',
                paymentFlow: PaymentAuthFlow.UPDATE_ORDER_LINES,
                paymentAuthenticationType: PaymentAuthenticationType.AUTH,
                isMIT: true,
              })
            }}
            onClose={() => {
              this.setState({ pendingMITAuth: null })
              this.props.clearPendingAction()
            }}
          />
        )}
      </>
    )
  }
}

EditProductsContainer.propTypes = {
  cart: object.isRequired,
  products: object.isRequired,
  orderId: string.isRequired,
  userUuid: string.isRequired,
  history: shape({
    push: func.isRequired,
  }).isRequired,
  location: object.isRequired,
  editingOrder: bool.isRequired,
  addArrayProduct: func.isRequired,
  replaceCart: func.isRequired,
  clearCart: func.isRequired,
  clearPendingAction: func.isRequired,
  catch: func.isRequired,
  showAlert: func.isRequired,
  hideAlert: func.isRequired,
  launchPaymentAuthentication: func.isRequired,
}

const mapStateToProps = (state) => ({
  products: state.products,
  cart: getCart(state),
  userUuid: state.session.uuid,
  editingOrder: state.ui.productModal.editingOrder,
})

const mapDispatchToProps = {
  replaceCart,
  addArrayProduct,
  clearPendingAction,
  clearCart: createThunk(clearCartAndUpdateFromEditOrder),
  showAlert,
  hideAlert,
}

export const EditProductsContainerConnected = connect(
  mapStateToProps,
  mapDispatchToProps,
)(EditProductsContainer)

const EditProductsContainerComposed = compose(
  withRouter,
  withErrorHandler,
)(EditProductsContainerConnected)

const EditProductsContainerWithAuth = ({ orderId }) => {
  const history = useHistory()
  const flagOrderEditLinesNewStrategy = useFlag(
    knownFeatureFlags.ORDER_EDIT_LINES_NEW_STRATEGY,
  )
  const [showAuthFailedModal, setShowAuthFailedModal] = useState(false)

  const { launchPaymentAuthentication } = usePaymentAuthentication({
    entityId: orderId,
  })

  usePaymentAuthenticationCallbacks({
    flow: PaymentAuthFlow.UPDATE_ORDER_LINES,
    paymentMethodType: 'any',
    enabled: flagOrderEditLinesNewStrategy,
    skipClearParamsOnSuccess: true,
    onAuthSuccess: () => {
      Storage.removeItem(STORAGE_KEYS.SCA_CONFIRM)
      history.push(generatePath(PATHS.USER_AREA_ORDERS_ID, { id: orderId }), {
        hasEditedProducts: true,
      })
    },
    onAuthFailure: () => {
      Storage.setFailedAuthPaymentModal()
      Support.showButton(window.location.pathname)
      setShowAuthFailedModal(true)
    },
  })

  return (
    <>
      <EditProductsContainerComposed
        orderId={orderId}
        launchPaymentAuthentication={launchPaymentAuthentication}
      />
      {showAuthFailedModal && (
        <PaymentAuthenticationFailedModal
          onRetry={() => setShowAuthFailedModal(false)}
          onClose={() => setShowAuthFailedModal(false)}
        />
      )}
    </>
  )
}

EditProductsContainerWithAuth.propTypes = {
  orderId: string.isRequired,
}

export default EditProductsContainerWithAuth
