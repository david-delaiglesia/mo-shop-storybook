import { Component } from 'react'

import { bool, func, object } from 'prop-types'

import { compose } from '@mercadona/mo.library.dashtil'
import { Icon } from '@mercadona/mo.library.shop-ui/icon'

import { withPopOver } from 'app/cart/components/cart-button/withPopOver'
import { withTranslate } from 'app/i18n/containers/i18n-provider'
import { Cart } from 'domain/cart'
import { getLocalePrize } from 'utils/maths.js'

import './assets/CartButton.css'

const BUTTON_STYLE = {
  BUBBLE_WIDTH: 24,
  BUBBLE_BIG_WIDTH: 30,
  BUTTON_DEFAULT_WIDTH: 120,
  BUTTON_BIG_WIDTH: 129,
  PRICE_DEFAULT_WIDTH: 44,
  PRICE_BIG_WIDTH: 57,
}

class CartButton extends Component {
  constructor() {
    super()

    this.cartButtonRef = null

    this.setCartButtonRef = this.setCartButtonRef.bind(this)
  }

  componentDidUpdate(prevProps) {
    if (!this.props.isCartOpened && prevProps.isCartOpened) {
      this.cartButtonRef.focus()
    }
  }

  getButtonSize(totalPrice) {
    if (totalPrice.toString().length >= 6) {
      return `${BUTTON_STYLE.BUTTON_BIG_WIDTH}px`
    }
    return `${BUTTON_STYLE.BUTTON_DEFAULT_WIDTH}px`
  }

  getPriceLabelSize(totalPrice) {
    if (totalPrice.toString().length >= 6) {
      return `${BUTTON_STYLE.PRICE_BIG_WIDTH}px`
    }
    return `${BUTTON_STYLE.PRICE_DEFAULT_WIDTH}px`
  }

  calculateCartBubbleSize(quantity) {
    let width = BUTTON_STYLE.BUBBLE_WIDTH

    if (quantity.toString().length > 2) {
      width = BUTTON_STYLE.BUBBLE_BIG_WIDTH
    }

    return { borderRadius: `${width / 2}px`, width: `${width}px` }
  }

  setCartButtonRef(node) {
    this.cartButtonRef = node
  }

  renderCartEmpty() {
    const { onClick, t } = this.props

    return (
      <button
        ref={this.setCartButtonRef}
        onClick={onClick}
        aria-label={t('cart.aria_open')}
        className="cart-button--empty"
      >
        <Icon icon="cart-28" />
      </button>
    )
  }

  renderCart(quantity, totalCart) {
    const { onClick, t } = this.props

    totalCart = getLocalePrize(totalCart)
    const bubbleStyle = this.calculateCartBubbleSize(quantity)
    const priceSize = this.getPriceLabelSize(totalCart)
    const buttonSize = this.getButtonSize(totalCart)

    return (
      <button
        ref={this.setCartButtonRef}
        style={{ minWidth: buttonSize }}
        aria-label={t('cart.aria_open')}
        onClick={onClick}
        className="cart-button"
        data-testid="cart-button"
      >
        <Icon icon="cart-28" />
        <span
          style={bubbleStyle}
          className="cart-button__bubble subhead1-b"
          data-testid="cart-button-quantity"
        >
          {quantity}
        </span>
        <label
          style={{ width: priceSize }}
          className="cart-button__label caption2-sb"
          data-testid="cart-button-total"
        >
          {totalCart} €
        </label>
      </button>
    )
  }

  render() {
    const { cart } = this.props
    const quantity = Cart.getTotalUnits(cart)

    if (quantity === 0) {
      return this.renderCartEmpty()
    }
    const cartTotal = Cart.getTotal(cart)
    return this.renderCart(quantity, cartTotal)
  }
}

CartButton.propTypes = {
  cart: object,
  isCartOpened: bool.isRequired,
  onClick: func.isRequired,
  t: func.isRequired,
}

const ComposedCartButton = compose(withTranslate)(CartButton)

const CartButtonWithPopOver = withPopOver(ComposedCartButton)

export { ComposedCartButton as CartButton, CartButtonWithPopOver, BUTTON_STYLE }
