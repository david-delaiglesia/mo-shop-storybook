import { Component } from 'react'
import { connect } from 'react-redux'

import productLimitImage from './assets/default-alert@2x.png'
import { func, number } from 'prop-types'

import { showAlert } from 'app/shared/alert/actions'
import { ProductPropTypes } from 'domain/product'
import { Tracker } from 'services/tracker'

export function withProductLimitHandler(WrappedComponent) {
  class WithProductLimitHandler extends Component {
    isQuantityBelowLimit = () => {
      const { product, productQuantity } = this.props
      if (!product.limit || !productQuantity) {
        return true
      }

      return product.limit > productQuantity
    }

    addProductIfFits = () => {
      const { showAlert, addProductToCart, product } = this.props

      if (this.isQuantityBelowLimit()) {
        return addProductToCart()
      }

      Tracker.sendViewChange('product_quantity_limit_alert', {
        product_id: product.id,
      })
      const waterLimitAlertOptions = {
        title: 'alerts.products_limit.title',
        description: 'alerts.products_limit.message',
        confirmButtonText: 'alerts.products_limit.confirm',
        imageSrc: productLimitImage,
      }
      showAlert(waterLimitAlertOptions)
    }

    render() {
      const props = {
        ...this.props,
        addProductToCart: this.addProductIfFits,
      }

      return <WrappedComponent {...props} />
    }
  }

  WithProductLimitHandler.displayName = `WithProductLimitHandler(${getDisplayName(
    WrappedComponent,
  )})`

  WithProductLimitHandler.propTypes = {
    product: ProductPropTypes,
    productQuantity: number,
    addProductToCart: func.isRequired,
    showAlert: func.isRequired,
  }

  return connect(mapStateToProps, mapDispatchToProps)(WithProductLimitHandler)
}

const getDisplayName = (WrappedComponent) => {
  return (
    WrappedComponent && (WrappedComponent.displayName || WrappedComponent.name)
  )
}

const mapStateToProps = (state, ownProps) => {
  const cartProducts = state.cart.products
  const products = state.products
  const productId = ownProps.productId

  return {
    product: products[productId],
    productQuantity:
      cartProducts[productId] && cartProducts[productId].quantity,
  }
}

const mapDispatchToProps = { showAlert }
