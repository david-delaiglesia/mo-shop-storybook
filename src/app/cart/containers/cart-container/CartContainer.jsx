import { Component, createRef } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'

import { bool, func, object, shape, string } from 'prop-types'
import { compose } from 'redux'

import { createThunk } from '@mercadona/mo.library.dashtil'
import { FocusTrap } from '@mercadona/mo.library.shop-ui/accessibility'

import {
  MaxSizeAreaExceededException,
  MaxSizeAreaExceededModal,
  MaxWaterLitersInCartException,
  MinPurchaseAmountNotReachedException,
} from 'app/cart'
import {
  clearCartAndUpdate,
  getCartAndSaveInStore,
  handleUpdateCartDraft,
} from 'app/cart/commands'
import { CartDetail } from 'app/cart/components/cart-detail'
import { CartProductAlert } from 'app/cart/components/cart-product-alert'
import { CART_CLASS } from 'app/cart/constants'
import { closeCart } from 'app/cart/containers/cart-button-container/actions'
import {
  sendAddCartToOngoingOrderMetrics,
  sendCleanCartConfirmationClick,
  sendFocusRecoveryClickMetrics,
  sendOpenCartMetrics,
  sendStartCheckoutClickMetrics,
} from 'app/cart/metrics'
import { getCart } from 'app/cart/selectors'
import { BlinkingProductModal } from 'app/catalog/components/blinking-product-modal'
import extraWaterImage from 'app/catalog/containers/product-extra-water-handler/assets/extra@2x.png'
import { CART_MODE } from 'app/catalog/metrics'
import { CheckoutClient } from 'app/checkout/client'
import { withTranslate } from 'app/i18n/containers/i18n-provider'
import { OrderClient } from 'app/order/client'
import {
  sendMinimumPriceModalViewMetrics,
  sendYearsoldCancelButtonClickViewMetrics,
  sendYearsoldConfirmationButtonClickViewMetrics,
  sendYearsoldModalViewMetrics,
} from 'app/order/metrics'
import { hideAlert, showAlert } from 'app/shared/alert/actions'
import { ALERT_SIZES } from 'app/shared/alert/components/alert'
import { ManagedException, handleManagedError } from 'app/shared/exceptions'
import {
  sendContinueUnavailableDayProductAlert,
  sendPickAnotherDayUnavailableDayProductAlert,
  sendUnavailableDayProductAlertViewMetrics,
  sendUnsavedEditionModalClickMetrics,
  sendUnsavedEditionModalViewMetrics,
} from 'app/shared/metrics'
import { closeOverlay } from 'containers/overlay-container/actions'
import { Cart, CartPropTypes, CartService } from 'domain/cart'
import { ORIGIN_FROM_MERGE_CART } from 'domain/cart/constants'
import { ProductService } from 'domain/product/'
import { withErrorHandler } from 'errors'
import { createCheckout } from 'pages/create-checkout/actions'
import { PATHS } from 'pages/paths'
import { unleashClient } from 'services/feature-flags/FeatureFlagsProvider'
import { knownFeatureFlags } from 'services/feature-flags/constants'
import { Storage } from 'services/storage'
import { STORAGE_KEYS } from 'services/storage/constants'
import ageImage from 'system-ui/assets/img/age-verification@2x.png'
import alertCartIcon from 'system-ui/assets/img/alert_cart.png'
import defaultAlertImage from 'system-ui/assets/img/default-alert@2x.png'
import minPurchaseImage from 'system-ui/assets/img/min@2x.png'
import { constants } from 'utils/constants'
import { clearPendingAction } from 'wrappers/feedback/actions'

const getCartStatusClass = (isCartOpened) => {
  if (!isCartOpened) {
    return CART_CLASS.DEFAULT
  }

  return CART_CLASS.OPENED
}

export class CartContainer extends Component {
  constructor(props) {
    super(props)
    this.showAlertRef = createRef()
  }

  state = {
    hasExceededQuantityProducts: false,
    ongoingOrder: null,
    mergedCart: null,
    blinkingProductsList: [],
    blinkingProductDay: null,
    maxSizeAreaExceededModal: null,
  }

  async componentDidMount() {
    window.addEventListener('focus', this.retrieveAndSaveCartOnFocus)
    window.addEventListener('pageshow', this.getCartAndSaveInStore)

    this.getCartAndSaveInStore()
    this.showAlertRef.current = true
  }

  componentDidUpdate(prevProps) {
    const { isCartOpened, cart, products, uuid } = this.props
    const hasCartOpened = !prevProps.isCartOpened && isCartOpened

    if (hasCartOpened) {
      this.setState({ hasExceededQuantityProducts: false })
      sendOpenCartMetrics(cart, products)
      return this.getCartAndSaveInStore()
    }

    if (prevProps.warehouse !== this.props.warehouse) {
      this.getCartAndSaveInStore()
    }

    if (this.showAlertRef.current && uuid) {
      this.handleDraftAlert(uuid)
    }
  }

  componentWillUnmount = () => {
    window.removeEventListener('focus', this.retrieveAndSaveCartOnFocus)
    window.removeEventListener('pageshow', this.getCartAndSaveInStore)
  }

  async handleCreateCheckout() {
    const { cart, uuid } = this.props

    if (Cart.isEmpty(cart)) return

    if (!uuid) {
      this.closeCartAndGoToCheckout()
      return
    }

    try {
      const checkout = await CheckoutClient.create(uuid, cart, false)
      if (!checkout) return

      this.props.createCheckout(checkout)
      this.closeCartAndGoToCheckout()
    } catch (error) {
      await handleManagedError(error)
        .on(MinPurchaseAmountNotReachedException, (exception) => {
          this.openMinimumPurchaseAlert(exception.detail)
          sendMinimumPriceModalViewMetrics(cart, CART_MODE.PURCHASE)
        })
        .on(MaxSizeAreaExceededException, (exception) => {
          if (
            unleashClient.isEnabled(knownFeatureFlags.CHECKOUT_ORDER_SIZE_LIMIT)
          ) {
            this.setState({
              maxSizeAreaExceededModal: {
                isOpen: true,
                areasExceeded: exception.areas_exceeded,
              },
            })
          }
        })
        .run()
    }
  }

  handleDraftAlert = async (uuid) => {
    this.showAlertRef.current = false
    const checkoutScaModal = Storage.isFailedAuthPaymentModalSeen()
    if (this.props.isAlertOpened || checkoutScaModal) {
      Storage.setFailedAuthPaymentModal(false)
      return
    }
    try {
      const response = await OrderClient.getIfCartDraftByCustomer(uuid)
      this.showDraftAlert(response.order_id)
      sendUnsavedEditionModalViewMetrics(response.order_id, 'false')
    } catch (error) {
      this.props.catch(error)
    }
  }

  showDraftAlert = (orderId) => {
    this.props.showAlert({
      imageSrc: alertCartIcon,
      title: 'draft_unsaved_changes_title',
      description: 'draft_unsaved_changes_body',
      confirmButtonText: 'draft_unsaved_changes_confirm',
      confirmButtonAction: () => this.handleSeeChangesButton(orderId),
      secondaryActionText: 'draft_unsaved_changes_cancel',
      secondaryAction: () => this.handleLaterButton(orderId),
    })
  }

  handleSeeChangesButton = (orderId) => {
    sendUnsavedEditionModalClickMetrics(orderId, 'view_changes')
    const { pathname } = this.props.history.location
    if (!pathname.includes('/edit/products')) {
      this.goToEditOrder(orderId)
    }
    this.props.hideAlert()
  }
  handleLaterButton = (orderId) => {
    sendUnsavedEditionModalClickMetrics(orderId, 'view_later')
    this.props.hideAlert()
  }

  retrieveAndSaveCartOnFocus = () => {
    sendFocusRecoveryClickMetrics()
    this.getCartAndSaveInStore()
  }

  getCartAndSaveInStore = () => {
    this.catchException(this.props.getCartAndSaveInStore)
  }

  catchException = async (callback) => {
    try {
      await callback()
    } catch (error) {
      const IGNORED_ERRORS = [400, 404, 408, 409, 500]
      this.props.catch(error, null, IGNORED_ERRORS)
    }
  }

  closeAlert = () => {
    this.props.hideAlert()
  }

  openCleanCartAlert = () => {
    this.props.showAlert({
      mood: 'destructive',
      title: 'alerts.clear_cart.title',
      description: 'alerts.clear_cart.message',
      confirmButtonText: 'button.clear_cart',
      confirmButtonAction: this.clearCartContent,
      secondaryActionText: 'button.cancel',
      secondaryAction: this.closeAlert,
    })
  }

  openMinimumPurchaseAlert = (errorDetail) => {
    const localTranslation = {
      key: 'alerts.min_purchase.message',
      interpolation: { minPurchase: constants.MIN_PURCHASE },
    }

    const description = errorDetail ? errorDetail : localTranslation

    this.props.showAlert({
      imageSrc: minPurchaseImage,
      title: 'alerts.min_purchase.title',
      description,
      confirmButtonText: 'button.agreed',
      confirmButtonAction: this.closeAlert,
    })
  }

  openAgeVerificationAlert = () => {
    const { showAlert, hideAlert, cart, products } = this.props
    const cartWithPublishedProductsOnly =
      CartService.filterCartProductsByPublished(cart, products)

    const total = Cart.getTotal(cartWithPublishedProductsOnly)
    showAlert({
      title: 'alerts.age_verification.title',
      description: 'alerts.age_verification.message',
      imageSrc: ageImage,
      confirmButtonText: 'alerts.age_verification.confirm_button',
      confirmButtonAction: () => {
        hideAlert()
        sendYearsoldConfirmationButtonClickViewMetrics()

        this.handleCreateCheckout()
      },
      secondaryActionText: 'alerts.age_verification.cancel_button',
      secondaryAction: () => {
        hideAlert()
        sendYearsoldCancelButtonClickViewMetrics()
      },
    })
    sendYearsoldModalViewMetrics(total)
  }

  beginPurchase = () => {
    const { cart, products } = this.props
    const cartWithoutUnpublishedProducts =
      CartService.filterCartProductsByPublished(cart, products)

    sendStartCheckoutClickMetrics(cartWithoutUnpublishedProducts, products)

    const requiresAgeCheck = Cart.isAgeVerificationRequired(cart)

    if (requiresAgeCheck) {
      this.openAgeVerificationAlert()
      return
    }

    this.handleCreateCheckout()
  }

  closeCartAndGoToCheckout = () => {
    this.closeCart()
    this.props.history.push(PATHS.CREATE_CHECKOUT)
  }

  clearCartContent = () => {
    const { cart } = this.props
    sendCleanCartConfirmationClick(cart)
    this.closeAlert()
    Storage.removeItem(STORAGE_KEYS.CART)
    this.props.closeOverlay()
    this.props.closeCart()
    this.props.clearCart()
    this.props.hideAlert()
  }

  closeCart = () => {
    this.props.closeCart()
    this.props.closeOverlay()
  }

  goToEditOrder = (id) => {
    this.props.history.push(`/orders/${id}/edit/products`)
  }

  handleKeyDown = (event) => {
    if (event.key !== 'Escape') {
      return
    }

    this.closeCart()
  }

  goBackToCart = () => {
    this.setState({
      hasExceededQuantityProducts: false,
    })
  }

  validateMergeCart = async () => {
    const { cart, products, uuid, clearPendingAction } = this.props

    let mergedCart
    try {
      mergedCart = await OrderClient.validateMergingCartToOrder(
        uuid,
        cart.openOrderId,
        cart,
      )
    } catch (error) {
      this.manageMergeCartException(error)
      return
    } finally {
      clearPendingAction()
    }

    sendAddCartToOngoingOrderMetrics(cart, products)
    this.setState({ mergedCart })

    const hasExceededQuantityProducts =
      Cart.hasExceededQuantityProducts(mergedCart)

    if (hasExceededQuantityProducts) {
      this.setState({ hasExceededQuantityProducts })
      return
    }

    const order = await OrderClient.getById(uuid, cart.openOrderId)
    const blinkingProducstMatchList =
      ProductService.getBlinkingProductsDayMatch(
        mergedCart.products,
        order.slot.start,
      )

    if (blinkingProducstMatchList.length) {
      this.setState({
        blinkingProductDay: order.slot.start,
        blinkingProductsList: blinkingProducstMatchList,
      })
      const blinkingProductsIdsList = blinkingProducstMatchList.map(
        ({ product }) => product.id,
      )
      sendUnavailableDayProductAlertViewMetrics(
        cart.id,
        blinkingProductsIdsList,
        order.slot.start,
        CART_MODE.MERGE,
        cart.openOrderId,
      )
      return
    }
    Storage.setItem(STORAGE_KEYS.IS_ONGOING_ORDER, { mergingOrder: 'true' })

    this.addProductsToOngoingOrder()
  }

  addProductsToOngoingOrder = async () => {
    const { mergedCart, hasExceededQuantityProducts } = this.state
    const { cart, uuid } = this.props

    if (hasExceededQuantityProducts) {
      this.setState({ hasExceededQuantityProducts: false })
    }

    const mergedCartWithoutExceededProducts =
      CartService.getCartWithoutExceededProducts(mergedCart)
    Storage.setItem(
      STORAGE_KEYS.CART_TO_ONGOING_ORDER,
      mergedCartWithoutExceededProducts,
    )

    await handleUpdateCartDraft(
      uuid,
      cart.openOrderId,
      mergedCartWithoutExceededProducts,
      ORIGIN_FROM_MERGE_CART,
    )

    this.goToEditOrder(cart.openOrderId)
    this.closeCart()
  }

  openWaterLimitModal = async (errorDetail) => {
    const options = {
      size: ALERT_SIZES.MEDIUM,
      imageSrc: extraWaterImage,
      title: 'extra_water.title',
      description: errorDetail,
      confirmButtonText: 'button.agreed',
      confirmButtonAction: this.props.hideAlert,
    }
    this.props.showAlert(options)
  }

  openDefaultExceptionModal = async (errorDetail) => {
    const options = {
      size: ALERT_SIZES.MEDIUM,
      imageSrc: defaultAlertImage,
      title: 'error_something_went_wrong_title',
      description: errorDetail,
      confirmButtonText: 'button.agreed',
      confirmButtonAction: this.props.hideAlert,
    }
    this.props.showAlert(options)
  }

  manageMergeCartException = async (error) => {
    const exception = await ManagedException.getException(error)

    if (MaxWaterLitersInCartException.isException(exception)) {
      this.openWaterLimitModal(exception.detail)
      return
    }
    this.openDefaultExceptionModal(exception.detail)
  }

  confirmRemoveBlinkingProducts = () => {
    const { mergedCart, blinkingProductsList, blinkingProductDay } = this.state
    const { cart } = this.props
    const blinkingProductsIdsList = blinkingProductsList.map(
      ({ product }) => product.id,
    )

    const newMergedCartProducts = mergedCart.products.filter(
      ({ product }) => !blinkingProductsIdsList.includes(product.id),
    )

    sendContinueUnavailableDayProductAlert(
      cart.id,
      blinkingProductsIdsList,
      blinkingProductDay,
      CART_MODE.MERGE,
      cart.openOrderId,
    )

    this.setState(
      {
        mergedCart: { ...mergedCart, products: newMergedCartProducts },
        blinkingProductsList: [],
        blinkingProductDay: null,
      },
      this.addProductsToOngoingOrder,
    )
  }

  cancelRemoveBlinkingProducts = () => {
    const { blinkingProductsList, blinkingProductDay } = this.state
    const { cart } = this.props

    const blinkingProductsIdsList = blinkingProductsList.map(
      ({ product }) => product.id,
    )

    this.setState({
      blinkingProductsList: [],
      blinkingProductDay: null,
    })

    sendPickAnotherDayUnavailableDayProductAlert(
      cart.id,
      blinkingProductsIdsList,
      blinkingProductDay,
      CART_MODE.MERGE,
      cart.openOrderId,
    )
  }

  render() {
    const { isCartOpened, cart, products, isDeliveryAreaOpened, t } = this.props
    const {
      hasExceededQuantityProducts,
      mergedCart,
      maxSizeAreaExceededModal,
    } = this.state
    const cartStatusClass = getCartStatusClass(isCartOpened)

    return (
      <FocusTrap active={isCartOpened} restoreFocus>
        <div
          className={cartStatusClass}
          onKeyDown={this.handleKeyDown}
          data-testid="cart"
          role="complementary"
          aria-label={t('cart.title')}
        >
          {!hasExceededQuantityProducts && (
            <CartDetail
              cart={cart}
              products={products}
              cleanCart={this.openCleanCartAlert}
              closeCart={this.closeCart}
              beginPurchase={this.beginPurchase}
              isCartOpened={isCartOpened}
              ariaLabel="cart.aria_description"
              isFocusDisabled={isDeliveryAreaOpened}
              clearAndCloseCart={this.clearCartContent}
              validateMergeCart={this.validateMergeCart}
            />
          )}
          {hasExceededQuantityProducts && (
            <CartProductAlert
              cart={mergedCart}
              goBackToCart={this.goBackToCart}
              addProductsToOngoingOrder={this.addProductsToOngoingOrder}
            />
          )}
          <BlinkingProductModal
            title={t('availability_advice.title_merge')}
            blinkingProductsList={this.state.blinkingProductsList}
            secondaryAction={this.cancelRemoveBlinkingProducts}
            primaryAction={this.confirmRemoveBlinkingProducts}
            primaryActionText={t('button.go_on')}
            secondaryActionText={t('button.cancel')}
            selectedDay={this.state.blinkingProductDay}
          />

          {maxSizeAreaExceededModal?.isOpen && (
            <MaxSizeAreaExceededModal
              areasExceeded={maxSizeAreaExceededModal.areasExceeded}
              onClose={() => this.setState({ maxSizeAreaExceededModal: null })}
            />
          )}
        </div>
      </FocusTrap>
    )
  }
}

CartContainer.propTypes = {
  history: shape({
    push: func.isRequired,
  }).isRequired,
  cart: CartPropTypes.isRequired,
  products: object.isRequired,
  isCartOpened: bool.isRequired,
  isAlertOpened: bool.isRequired,
  closeOverlay: func.isRequired,
  closeCart: func.isRequired,
  clearCart: func.isRequired,
  getCartAndSaveInStore: func.isRequired,
  createCheckout: func.isRequired,
  catch: func.isRequired,
  isDeliveryAreaOpened: bool.isRequired,
  uuid: string,
  clearPendingAction: func.isRequired,
  showAlert: func.isRequired,
  hideAlert: func.isRequired,
  t: func.isRequired,
  warehouse: string,
}

const mapStateToProps = (state) => ({
  uuid: state.session.uuid,
  warehouse: state.session.warehouse,
  products: state.products,
  cart: getCart(state),
  isCartOpened: state.ui.cartUI.opened,
  isAlertOpened: state.ui.alert.visible,
  isDeliveryAreaOpened: state.ui.isDeliveryAreaOpened,
})

const mapDispatchToProps = {
  closeOverlay,
  closeCart,
  clearCart: createThunk(clearCartAndUpdate),
  getCartAndSaveInStore: createThunk(getCartAndSaveInStore),
  createCheckout,
  clearPendingAction,
  showAlert,
  hideAlert,
}

export const ConnectedCartContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(CartContainer)

export default compose(
  withErrorHandler,
  withRouter,
  withTranslate,
)(ConnectedCartContainer)
