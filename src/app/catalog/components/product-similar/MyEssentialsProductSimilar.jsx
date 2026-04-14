import { Component } from 'react'
import { connect } from 'react-redux'

import { ProductSimilar } from './ProductSimilar'
import { ProductSimilarDetail } from './ProductSimilarDetail'
import { arrayOf, func, string } from 'prop-types'

import { compose, createThunk } from '@mercadona/mo.library.dashtil'

import {
  addProductToCartAndUpdate,
  decreaseProductFromCartAndUpdate,
} from 'app/cart/commands'
import { CatalogClient } from 'app/catalog/client'
import { SOURCE_CODES } from 'app/catalog/metrics'
import { CartPropTypes } from 'domain/cart'
import { ProductPropTypes } from 'domain/product'

class MyEssentialsProductSimilar extends Component {
  state = {
    productDetailToShow: null,
    converted: {},
  }

  increaseProduct = (product) => {
    const { addProductToCart } = this.props
    const { converted } = this.state

    const productAlreadyAdded = converted[product.id]
    const convertedUpdated = {
      ...converted,
      [product.id]: productAlreadyAdded ? productAlreadyAdded + 1 : 1,
    }

    this.setState({ converted: convertedUpdated })
    addProductToCart({ product, sourceCode: SOURCE_CODES.SIMILAR_MY_REGULARS })
  }

  decreaseProduct = (product) => {
    const { decreaseProductFromCart } = this.props
    const { converted } = this.state

    const convertedUpdated = Object.entries(converted).reduce(
      (acc, [productId, quantity]) => {
        if (productId === product.id) {
          if (quantity === 1) {
            return acc
          }

          return {
            ...acc,
            [productId]: quantity - 1,
          }
        }

        return {
          ...acc,
          [productId]: quantity,
        }
      },
      {},
    )

    this.setState({ converted: convertedUpdated })
    decreaseProductFromCart({
      product,
      sourceCode: SOURCE_CODES.SIMILAR_MY_REGULARS,
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

  closeSimilarProducts = () => {
    const { onClose } = this.props
    const { converted } = this.state

    const convertedIds = Object.keys(converted)
    const options = convertedIds.length > 0 ? { converted: convertedIds } : {}

    onClose(options)
  }

  render() {
    const { cart, product, similarProducts } = this.props
    const { productDetailToShow } = this.state
    const productsInCart = cart.products

    if (productDetailToShow) {
      const orderLine = productsInCart[productDetailToShow.id] || {
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
        cart={cart}
        product={product}
        similarProducts={similarProducts}
        increaseProduct={this.increaseProduct}
        decreaseProduct={this.decreaseProduct}
        openProductDetail={this.openProductDetail}
        onClose={this.closeSimilarProducts}
        inMyEssentials
      />
    )
  }
}

MyEssentialsProductSimilar.propTypes = {
  product: ProductPropTypes.isRequired,
  similarProducts: arrayOf(ProductPropTypes).isRequired,
  cart: CartPropTypes.isRequired,
  onClose: func.isRequired,
  addProductToCart: func.isRequired,
  decreaseProductFromCart: func.isRequired,
  warehouse: string.isRequired,
}

const mapStateToProps = ({ cart }) => ({ cart })

const mapDispatchToProps = {
  addProductToCart: createThunk(addProductToCartAndUpdate),
  decreaseProductFromCart: createThunk(decreaseProductFromCartAndUpdate),
}

const ComposedMyEssentialsProductSimilar = compose(
  connect(mapStateToProps, mapDispatchToProps),
)(MyEssentialsProductSimilar)

export { ComposedMyEssentialsProductSimilar as MyEssentialsProductSimilar }
