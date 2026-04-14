import { Component, Fragment, createRef } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'

import { CartProductList } from '../cart-product-list'
import { bool, func, shape, string } from 'prop-types'

import { CartClient } from 'app/cart/client'
import { CartCheckoutButtons } from 'app/cart/components/cart-checkout-buttons'
import { CartMoreActions } from 'app/cart/components/cart-more-actions/CartMoreActions'
import { SortCartProductDropdown } from 'app/cart/components/sort-cart-product-dropdown'
import {
  CART_CLASS,
  CART_EMPTY_OFFSET,
  CART_OFFSET,
  SORTING_METHODS,
} from 'app/cart/constants'
import {
  sendCartSortingMethodClickMetrics,
  sendCartToListTooltipCloseMetrics,
  sendCartToListTooltipViewMetrics,
  sendSaveCartAsListClick,
  sendSaveNewShoppingListClick,
} from 'app/cart/metrics'
import { SelectDeliveryAreaContainer } from 'app/delivery-area/containers/select-delivery-area-container'
import { withTranslate } from 'app/i18n/containers/i18n-provider'
import { CreateShoppingListDialog } from 'app/shopping-lists/components/create-shopping-list-dialog'
import { PopOverWithClickout } from 'components/pop-over/PopOver'
import OverlayContainer from 'containers/overlay-container'
import { Cart, CartPropTypes, CartService } from 'domain/cart'
import { ProductListPropTypes } from 'domain/product'
import { PATHS } from 'pages/paths'
import { Session } from 'services/session'
import { MoreActionsHorizontalIcon } from 'system-ui/icons'
import { TAB_INDEX } from 'utils/constants'

import './styles/CartDetail.css'

const calcCartHeight = (total) => {
  if (total === 0) {
    return CART_EMPTY_OFFSET
  }

  return CART_OFFSET
}

class CartDetail extends Component {
  cartHeadingRef = createRef()

  _isMounted = false

  state = {
    sortingMethod: SORTING_METHODS.TIME,
    openDropDown: false,
    isMoreActionsVisible: false,
    isCreateShoppingListDialogVisible: false,
    isCartToListTooltipVisible: false,
  }

  displayTooltipIfApplicable() {
    const userId = this?.props?.session?.uuid

    const checkCartListTooltip = async () => {
      const response = await CartClient.checkCartListTooltip(userId)
      const showTooltip = response.showTooltip

      if (this._isMounted) {
        this.setState({ isCartToListTooltipVisible: showTooltip })
      }
      if (showTooltip) {
        sendCartToListTooltipViewMetrics()
      }
    }

    if (userId) {
      checkCartListTooltip()
    }
  }

  componentDidMount() {
    this._isMounted = true
  }

  componentWillUnmount() {
    this._isMounted = false
  }

  componentDidUpdate(prevProps) {
    const { isCartOpened, ariaFocus, cart } = this.props

    const prevProductQuantity = Object.keys(prevProps.cart.products).length
    const productQuantity = Object.keys(cart.products).length

    if (productQuantity < prevProductQuantity) {
      this.cartHeadingRef.current.focus()
    }

    if (!isCartOpened) {
      return
    }
    if (prevProps.isCartOpened !== isCartOpened && isCartOpened) {
      setTimeout(() => {
        this.displayTooltipIfApplicable()
      }, 500)
    }
    if (!ariaFocus) {
      return
    }

    ariaFocus()
  }

  toggleDropdown = () => {
    this.setState(({ openDropDown }) => ({
      openDropDown: !openDropDown,
    }))
  }

  setSelectedSortingMethod = (sortingMethod) => {
    const { cart } = this.props
    sendCartSortingMethodClickMetrics(cart, sortingMethod)
    this.setState({ sortingMethod })
    this.toggleDropdown()
  }

  closeDropdown = () => {
    this.setState({ openDropDown: false })
  }

  render() {
    const {
      cart,
      products,
      isCartOpened,
      closeCart,
      cleanCart,
      beginPurchase,
      validateMergeCart,
      t,
      history,
    } = this.props

    const handleToggleMoreActionsVisibility = () => {
      this.setState((state) => {
        return {
          isMoreActionsVisible: !state.isMoreActionsVisible,
        }
      })
    }

    const { sortingMethod } = this.state
    const { warehouse } = Session.get()

    const items = Cart.getItemsQuantity(cart)

    const cartWithPublishedProductsOnly =
      CartService.filterCartProductsByPublished(cart, products)
    const cartWithUnpublishedProductsOnly =
      CartService.filterCartProductsByUnpublished(cart, products)

    const total = Cart.getTotal(cartWithPublishedProductsOnly)
    const cartHeight = calcCartHeight(total)

    const openCreateListModal = () => {
      this.setState({ isCreateShoppingListDialogVisible: true })
      sendSaveCartAsListClick()
    }

    const closeCreateListModal = () => {
      this.setState({ isCreateShoppingListDialogVisible: false })
    }

    const createList = async (uuid, listName, displayError) => {
      const products = Cart.getSortedProducts(cart)

      try {
        const listId = await CartClient.createShoppingListFromProducts(
          uuid,
          listName,
          products,
        )
        closeCreateListModal()
        closeCart()
        history.push(`${PATHS.SHOPPING_LISTS}/${listId}`)
        sendSaveNewShoppingListClick(listName)
      } catch {
        displayError()
      }
    }

    return (
      <Fragment>
        <div className="cart__header">
          <button
            onClick={closeCart}
            className="cart__close-icon icon icon-close-16"
            aria-label={t('cart.aria_close')}
          ></button>
          <p className="cart__title">
            <span
              className="cart__title-label headline1-b"
              ref={this.cartHeadingRef}
              tabIndex={TAB_INDEX.ENABLED}
            >
              {t('cart.title')}
            </span>
            <SelectDeliveryAreaContainer
              datatest="select-delivery-area-cart"
              source="cart"
            />
          </p>
          {this.state.isCreateShoppingListDialogVisible && (
            <CreateShoppingListDialog
              onCancel={closeCreateListModal}
              onCreate={createList}
            />
          )}
          <button
            disabled={items <= 0}
            aria-label={t('cart.more_actions_button_text')}
            type="text"
            className="cart-detail__actions-button"
            onClick={handleToggleMoreActionsVisibility}
          >
            <MoreActionsHorizontalIcon size={16} />
          </button>
          {this.state.isCartToListTooltipVisible && (
            <OverlayContainer position="right" closeCart={false}>
              <div className="cart-detail__popover">
                <PopOverWithClickout
                  title={t('cart.cart_to_list_tooltip_title')}
                  message={t('cart.cart_to_list_tooltip_message')}
                  close={() => {
                    this.setState({ isCartToListTooltipVisible: false })
                    sendCartToListTooltipCloseMetrics('cross')
                  }}
                  handleClickOutside={() => {
                    this.setState({ isCartToListTooltipVisible: false })
                    sendCartToListTooltipCloseMetrics('backdrop_click')
                  }}
                />
              </div>
            </OverlayContainer>
          )}

          {this.state.isMoreActionsVisible && (
            <CartMoreActions
              handleClickOutside={handleToggleMoreActionsVisibility}
              openCreateListModal={openCreateListModal}
              cleanCart={cleanCart}
            />
          )}
        </div>
        {total > 0 && (
          <SortCartProductDropdown
            className="cart__sorting-method"
            onChange={this.setSelectedSortingMethod}
          />
        )}
        <CartProductList
          cartPublished={cartWithPublishedProductsOnly}
          cartUnpublished={cartWithUnpublishedProductsOnly}
          products={products}
          items={items}
          sortingMethod={sortingMethod}
          cartContentHeight={cartHeight}
          isCartOpened={isCartOpened}
          warehouse={warehouse}
        />
        {total > 0 && (
          <CartCheckoutButtons
            cart={cart}
            products={products}
            beginPurchase={beginPurchase}
            validateMergeCart={validateMergeCart}
          />
        )}
      </Fragment>
    )
  }
}

CartDetail.propTypes = {
  session: shape({
    uuid: string,
  }),
  cart: CartPropTypes.isRequired,
  products: ProductListPropTypes.isRequired,
  cleanCart: func.isRequired,
  closeCart: func.isRequired,
  beginPurchase: func.isRequired,
  isCartOpened: bool.isRequired,
  ariaFocus: func,
  validateMergeCart: func.isRequired,
  t: func.isRequired,
  history: shape({
    push: func.isRequired,
  }).isRequired,
}

const mapStateToProps = ({ session }) => ({ session })

const ComposedCartDetail = connect(mapStateToProps)(
  withTranslate(withRouter(CartDetail)),
)

export {
  ComposedCartDetail as CartDetail,
  CartDetail as PlainCart,
  CART_CLASS,
  calcCartHeight,
}
