import { Component } from 'react'

import { func, number, string } from 'prop-types'

import { ProductCell } from 'app/catalog/components/product-cell'
import {
  LAYOUTS,
  sendAddProductToCartMetrics,
  sendDecreaseProductFromCartMetrics,
} from 'app/catalog/metrics'
import { CartPropTypes, CartService } from 'domain/cart'
import { ProductPropTypes } from 'domain/product'

class ProductSimilarCell extends Component {
  increaseProduct = () => {
    const { product, increaseProduct, source, cart, order } = this.props

    sendAddProductToCartMetrics({
      product,
      cart,
      source,
      layout: LAYOUTS.GRID,
      order,
    })
    increaseProduct(product)
  }

  decreaseProduct = () => {
    const { product, decreaseProduct, source, cart } = this.props

    sendDecreaseProductFromCartMetrics({
      product,
      cart,
      source,
      layout: LAYOUTS.GRID,
    })
    decreaseProduct(product)
  }

  openProduct = () => {
    const { product, openProduct } = this.props

    openProduct(product)
  }

  render() {
    const { product, cart } = this.props
    const orderLine = CartService.getOrderLine(cart, product.id)

    return (
      <ProductCell
        key={product.id}
        addProductToCart={this.increaseProduct}
        decreaseProductFromCart={this.decreaseProduct}
        openProduct={this.openProduct}
        orderLine={orderLine}
        product={product}
        isProductSimilarCell={true}
      />
    )
  }
}

ProductSimilarCell.propTypes = {
  product: ProductPropTypes,
  cart: CartPropTypes,
  order: number,
  source: string,
  openProduct: func.isRequired,
  increaseProduct: func.isRequired,
  decreaseProduct: func.isRequired,
}

export { ProductSimilarCell }
