import { Component } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'

import { CartProductCellImage } from './CartProductCellImage'
import { func, number, object, shape, string } from 'prop-types'

import { compose, createThunk } from '@mercadona/mo.library.dashtil'

import { getAriaLabelForProductCell } from 'app/accessibility'
import {
  addProductToCartAndUpdate,
  decreaseProductFromCartAndUpdate,
} from 'app/cart/commands'
import { SOURCES } from 'app/cart/metrics'
import { setProductModalProductToShow } from 'app/catalog/actions'
import { ProductPrice } from 'app/catalog/components/product-price'
import {
  ProductQuantityButton,
  ProductQuantityButtonWithExtraWater,
} from 'app/catalog/components/product-quantity-button'
import {
  LAYOUTS,
  SOURCE_CODES,
  sendAddProductToCartMetrics,
  sendDecreaseProductFromCartMetrics,
} from 'app/catalog/metrics'
import { ProductPropTypes } from 'domain/product'
import { TAB_INDEX } from 'utils/constants'
import { CART_THEME } from 'utils/products'

import './CartProductCell.css'

const getAscendingProductCellOrder = (cart, product) => {
  const lastIndexFromCart = Object.keys(cart.products).length - 1
  const descendingOrder = cart.products[product.id].order
  const uiProductCellOrder = lastIndexFromCart - descendingOrder
  return uiProductCellOrder
}
class CartProductCell extends Component {
  showClass = ''
  productQuantityButton = {}

  constructor(props) {
    super(props)

    this.setQuantityButton(props)
  }

  setQuantityButton(props) {
    this.productQuantityButton = { component: ProductQuantityButton }

    if (props.product.badges.is_water) {
      this.productQuantityButton = {
        component: ProductQuantityButtonWithExtraWater,
      }
    }
  }

  addProduct = () => {
    const {
      product,
      cart,
      location,
      match: {
        params: { id },
      },
    } = this.props
    const order = getAscendingProductCellOrder(cart, product)

    sendAddProductToCartMetrics({
      product,
      cart,
      source: SOURCES.CART,
      layout: LAYOUTS.LIST,
      order,
      currentPath: location.pathname,
    })
    this.props.addProductToCart({ product, sourceCode: SOURCE_CODES.CART, id })
  }

  decrease = () => {
    const {
      product,
      cart,
      location,
      match: {
        params: { id },
      },
    } = this.props

    sendDecreaseProductFromCartMetrics({
      product,
      cart,
      source: SOURCES.CART,
      layout: LAYOUTS.LIST,
      currentPath: location.pathname,
    })
    this.props.decreaseProductFromCart({
      product,
      sourceCode: SOURCE_CODES.CART,
      id,
    })
  }

  openProduct = () => {
    const {
      product: { id, slug },
      warehouse,
    } = this.props

    this.props.setProductModalProductToShow(
      id,
      slug,
      SOURCES.CART,
      SOURCE_CODES.CART,
      warehouse,
    )
  }

  render() {
    const { product, productCart } = this.props

    const { component: ProductQuantityButton } = this.productQuantityButton
    const priceInstructions =
      productCart?.priceInstructions || product.price_instructions

    return (
      <div className="cart-product-cell" data-testid="cart-product-cell">
        <button
          className="cart-product-cell__image"
          aria-label={getAriaLabelForProductCell(product)}
          onClick={this.openProduct}
        >
          <CartProductCellImage thumbnail={product.thumbnail} />
        </button>
        <div className="cart-product-cell__info">
          <div
            tabIndex={TAB_INDEX.DISABLED}
            aria-hidden={true}
            className="cart-product-cell__description"
          >
            <label
              className="cart-product-cell__description-name subhead1-r"
              data-testid="cart-product-cell__description-name"
            >
              {product.display_name}
            </label>
            <ProductPrice priceInstructions={priceInstructions} />
          </div>
          <ProductQuantityButton
            productId={product.id}
            priceInstructions={product.price_instructions}
            quantity={productCart.quantity}
            theme={CART_THEME}
            size="small"
            addProductToCart={this.addProduct}
            decreaseProductFromCart={this.decrease}
          />
        </div>
      </div>
    )
  }
}

CartProductCell.propTypes = {
  product: ProductPropTypes,
  productCart: shape({
    total: number.isRequired,
    quantity: number.isRequired,
  }),
  cart: object.isRequired,
  addProductToCart: func.isRequired,
  decreaseProductFromCart: func.isRequired,
  setProductModalProductToShow: func.isRequired,
  location: shape({
    pathname: string.isRequired,
  }).isRequired,
  match: shape({
    params: shape({
      id: string,
    }),
  }),
  warehouse: string,
}

const mapStateToProps = ({ cart }) => ({ cart })

const mapDispatchToProps = {
  addProductToCart: createThunk(addProductToCartAndUpdate),
  decreaseProductFromCart: createThunk(decreaseProductFromCartAndUpdate),
  setProductModalProductToShow,
}

const ComposedCartProductCell = compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
)(CartProductCell)

export { ComposedCartProductCell as CartProductCell }
