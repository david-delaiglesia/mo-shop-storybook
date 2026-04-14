import { Component } from 'react'
import { connect } from 'react-redux'

import {
  disableHighlightCart,
  toggleCart,
} from '../../containers/cart-button-container/actions'
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux'

import { withTranslate } from 'app/i18n/containers/i18n-provider'
import PopOver from 'components/pop-over'
import { toggleOverlay } from 'containers/overlay-container/actions'
import { withClickOutside } from 'wrappers/click-out-handler'

import './assets/withPopOver.css'

export function withPopOver(WrappedComponent) {
  class WithPopOver extends Component {
    constructor(props) {
      super(props)

      this.state = {
        wrappedRef: null,
      }
      this.closePopOver = this.closePopOver.bind(this)
      this.openCart = this.openCart.bind(this)
    }

    closePopOver() {
      this.props.actions.disableHighlightCart()
    }

    openCart() {
      const { toggleOverlay, toggleCart, disableHighlightCart } =
        this.props.actions

      toggleOverlay()
      toggleCart()
      disableHighlightCart()
    }

    render() {
      return (
        <div className="cart-button__overlay">
          <CartButtonContentWithClickOut
            {...this.props}
            handleClickOutside={this.closePopOver}
            openCart={this.openCart}
            closePopOver={this.closePopOver}
          />
        </div>
      )
    }
  }

  WithPopOver.displayName = `withPopOver(${getDisplayName(WrappedComponent)})`

  WithPopOver.propTypes = {
    actions: PropTypes.shape({
      toggleOverlay: PropTypes.func.isRequired,
      toggleCart: PropTypes.func.isRequired,
      disableHighlightCart: PropTypes.func.isRequired,
    }).isRequired,
  }

  const CartButtonOverlayContent = (props) => {
    const { openCart, closePopOver, t } = props

    return (
      <div className="cart-button__pop-over">
        <WrappedComponent {...props} />
        <PopOver
          title={t('commons.order.cart_updated.title')}
          message={t('commons.order.cart_updated.message')}
          buttonText={t('commons.order.cart_updated.review')}
          buttonClick={openCart}
          close={closePopOver}
        />
      </div>
    )
  }

  CartButtonOverlayContent.propTypes = {
    openCart: PropTypes.func,
    closePopOver: PropTypes.func,
    t: PropTypes.func.isRequired,
  }

  const CartButtonContentWithClickOut = withClickOutside(
    CartButtonOverlayContent,
  )

  return connect(null, mapDispatchToProps)(withTranslate(WithPopOver))
}

const getDisplayName = (WrappedComponent) => {
  return (
    WrappedComponent && (WrappedComponent.displayName || WrappedComponent.name)
  )
}

const mapDispatchToProps = (dispatch) => ({
  actions: {
    disableHighlightCart: bindActionCreators(disableHighlightCart, dispatch),
    toggleOverlay: bindActionCreators(toggleOverlay, dispatch),
    toggleCart: bindActionCreators(toggleCart, dispatch),
  },
})
