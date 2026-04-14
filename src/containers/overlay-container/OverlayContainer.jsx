import { PureComponent } from 'react'
import { connect } from 'react-redux'

import { toggleOverlay } from './actions'
import { bool, object, string } from 'prop-types'
import { bindActionCreators } from 'redux'

import { closeCart } from 'app/cart/containers/cart-button-container/actions'
import { Overlay } from 'components/overlay'

class OverlayContainer extends PureComponent {
  constructor() {
    super()

    this.closeOverlay = this.closeOverlay.bind(this)
  }

  closeOverlay() {
    if (this.props.closeCart) {
      this.props.actions.toggleOverlay()
      this.props.actions.closeCart()
    }
  }

  render() {
    return <Overlay onClick={this.closeOverlay} {...this.props} />
  }
}

OverlayContainer.propTypes = {
  open: bool.isRequired,
  position: string.isRequired,
  actions: object.isRequired,
  closeCart: bool,
}

OverlayContainer.defaultProps = {
  closeCart: true,
}

function mapStateToProps(state) {
  return {
    open: state.ui.overlay,
  }
}

function mapDispatchToProps(dispatch) {
  const actions = {
    toggleOverlay: bindActionCreators(toggleOverlay, dispatch),
    closeCart: bindActionCreators(closeCart, dispatch),
  }
  return { actions }
}

export default connect(mapStateToProps, mapDispatchToProps)(OverlayContainer)
