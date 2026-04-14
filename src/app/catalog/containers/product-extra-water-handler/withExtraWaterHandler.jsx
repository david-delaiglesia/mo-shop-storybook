import { Component } from 'react'
import { connect } from 'react-redux'

import extraWaterImage from './assets/extra@2x.png'
import { func, number, object } from 'prop-types'

import { showAlert } from 'app/shared/alert/actions'
import { CartPropTypes, CartService } from 'domain/cart'
import { ProductListPropTypes, ProductPropTypes } from 'domain/product'
import { Tracker } from 'services/tracker'

export function withExtraWaterHandler(WrappedComponent) {
  class WithExtraWaterHandler extends Component {
    addProductIfFits = () => {
      const {
        product,
        addProductToCart,
        cart,
        products,
        config,
        recommendedQuantity,
        showAlert,
      } = this.props
      const waterLimit = config.maximumWaterLitersForCartOrder

      if (
        CartService.canAddProduct({
          cart,
          products,
          product,
          increment: recommendedQuantity,
          waterLimit,
        })
      ) {
        return addProductToCart()
      }

      const currentCartWater = CartService.getWater(cart, products)

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
    }

    render() {
      const props = {
        ...this.props,
        addProductToCart: this.addProductIfFits,
      }

      return <WrappedComponent {...props} />
    }
  }

  WithExtraWaterHandler.displayName = `WithExtraWaterHandler(${getDisplayName(
    WrappedComponent,
  )})`

  WithExtraWaterHandler.propTypes = {
    recommendedQuantity: number,
    addProductToCart: func.isRequired,
    product: ProductPropTypes.isRequired,
    cart: CartPropTypes.isRequired,
    config: object,
    products: ProductListPropTypes.isRequired,
    showAlert: func.isRequired,
  }

  return connect(mapStateToProps, mapDispatchToProps)(WithExtraWaterHandler)
}

const getDisplayName = (WrappedComponent) => {
  return (
    WrappedComponent && (WrappedComponent.displayName || WrappedComponent.name)
  )
}

const mapStateToProps = ({ cart, products, config }, { productId }) => ({
  products,
  cart,
  product: products[productId],
  config,
})

const mapDispatchToProps = { showAlert }
