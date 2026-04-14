import { Component } from 'react'
import { connect } from 'react-redux'

import { ProductSimilar } from './ProductSimilar'
import { ProductSimilarDetail } from './ProductSimilarDetail'
import { arrayOf, func, object, shape, string } from 'prop-types'

import { SOURCES } from 'app/cart/metrics'
import { CatalogClient } from 'app/catalog/client'
import extraWaterImage from 'app/catalog/containers/product-extra-water-handler/assets/extra@2x.png'
import productLimitImage from 'app/catalog/containers/product-limit-handler/assets/default-alert@2x.png'
import { SOURCE_CODES, sendFinishSubstitutionMetric } from 'app/catalog/metrics'
import { showAlert } from 'app/shared/alert/actions'
import { CartPropTypes, CartService } from 'domain/cart'
import { ProductPropTypes, ProductService } from 'domain/product'
import { Tracker } from 'services/tracker'

class CartProductSimilar extends Component {
  state = {
    alternativeCart: {
      products: {},
    },
    productLimitModalVisibility: false,
    productDetailToShow: null,
  }

  getSubstitutionCart = (cart, alternativeCart) => {
    return {
      ...cart,
      products: {
        ...cart.products,
        ...alternativeCart.products,
      },
    }
  }

  increaseProduct = (product) => {
    const { cart, products, showAlert, config } = this.props
    const { alternativeCart } = this.state

    const cartProduct = alternativeCart.products[product.id]

    const substitutionCart = this.getSubstitutionCart(cart, alternativeCart)
    const waterLimit = config.maximumWaterLitersForCartOrder

    if (
      !CartService.canAddProduct({
        cart: substitutionCart,
        products,
        product,
        waterLimit,
      })
    ) {
      const currentCartWater = CartService.getWater(
        this.getSubstitutionCart(cart, alternativeCart),
        products,
      )
      const waterLimitAlertOptions = {
        title: 'extra_water.title',
        imageSrc: extraWaterImage,
        description: {
          key: 'extra_water.description',
          interpolation: {
            max_liters: waterLimit,
            current_liters: currentCartWater,
          },
        },
      }
      Tracker.sendViewChange('water_quantity_limit_alert')
      showAlert(waterLimitAlertOptions)
      return
    }

    if (
      cartProduct &&
      !ProductService.canIncrementQuantity(product, cartProduct.quantity)
    ) {
      Tracker.sendViewChange('product_quantity_limit_alert', {
        product_id: product.id,
      })
      const productLimitAlertOptions = {
        title: 'alerts.products_limit.title',
        description: 'alerts.products_limit.message',
        confirmButtonText: 'alerts.products_limit.confirm',
        imageSrc: productLimitImage,
      }
      showAlert(productLimitAlertOptions)
      return
    }

    this.setState(({ alternativeCart }) => {
      const orderLine = CartService.formatProductToOrderLine(
        substitutionCart,
        product,
        SOURCE_CODES.SIMILAR_CART,
      )
      const alternativeCartUpdated = {
        ...alternativeCart,
        products: {
          ...alternativeCart.products,
          [orderLine.id]: orderLine,
        },
      }

      return {
        alternativeCart: alternativeCartUpdated,
      }
    })
  }

  decreaseProduct = (product) => {
    this.setState(({ alternativeCart }) => {
      return {
        alternativeCart: CartService.decreaseProduct(alternativeCart, {
          product,
          sourceCode: SOURCE_CODES.SIMILAR_CART,
        }),
      }
    })
  }

  openProductDetail = async (product) => {
    const { warehouse } = this.props
    const productDetail = await CatalogClient.getProductDetail(
      product.id,
      warehouse,
    )
    this.setState({ productDetailToShow: productDetail })
  }

  closeProductDetail = () => {
    this.setState({ productDetailToShow: null })
  }

  confirmSubstitutionCart = () => {
    const { confirmSubstitution, similarProducts, product, cart } = this.props
    const { alternativeCart } = this.state
    const similarProductIds = similarProducts.map(({ id }) => id)
    const converted = Object.keys(alternativeCart.products)

    sendFinishSubstitutionMetric({
      converted,
      choices: similarProductIds,
      productId: product.id,
      cartId: cart.id,
      source: SOURCES.CART,
    })

    confirmSubstitution(alternativeCart)
  }

  render() {
    const { cart, product, similarProducts, onCancel } = this.props
    const { alternativeCart, productDetailToShow } = this.state

    const alternativeCartWithId = {
      id: cart.id,
      ...alternativeCart,
    }

    if (productDetailToShow) {
      const orderLine = alternativeCart.products[productDetailToShow.id] || {
        quantity: 0,
      }
      return (
        <ProductSimilarDetail
          product={productDetailToShow}
          orderLine={orderLine}
          increaseProduct={this.increaseProduct}
          decreaseProduct={this.decreaseProduct}
          goBack={this.closeProductDetail}
        />
      )
    }

    return (
      <ProductSimilar
        cart={alternativeCartWithId}
        product={product}
        similarProducts={similarProducts}
        increaseProduct={this.increaseProduct}
        decreaseProduct={this.decreaseProduct}
        openProductDetail={this.openProductDetail}
        onCancel={onCancel}
        confirmSubstitutionCart={this.confirmSubstitutionCart}
      />
    )
  }
}

CartProductSimilar.propTypes = {
  product: ProductPropTypes.isRequired,
  warehouse: string.isRequired,
  similarProducts: arrayOf(ProductPropTypes).isRequired,
  onCancel: func.isRequired,
  confirmSubstitution: func.isRequired,
  cart: CartPropTypes.isRequired,
  products: shape({ [string]: ProductPropTypes }).isRequired,
  showAlert: func.isRequired,
  config: object,
}

const mapStateToProps = ({ cart, products, config }) => {
  return {
    cart,
    products,
    config,
  }
}

const mapDispatchToProps = { showAlert }

const ComposedCartProductSimilar = connect(
  mapStateToProps,
  mapDispatchToProps,
)(CartProductSimilar)

export { ComposedCartProductSimilar as CartProductSimilar }
