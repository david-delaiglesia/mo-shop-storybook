import { Component } from 'react'
import { connect } from 'react-redux'

import { cancelCheckout, createCheckout } from './actions'
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux'

import { replaceCart } from 'app/cart/actions'
import { CheckoutClient } from 'app/checkout/client'
import { CheckoutCheckUser } from 'app/checkout/components/checkout-check-user'
import { CheckoutLayout } from 'app/checkout/components/checkout-layout'
import { CheckoutLogin } from 'app/checkout/components/checkout-login'
import { CheckoutPasswordRecovery } from 'app/checkout/components/checkout-password-recovery'
import { CheckoutSignUp } from 'app/checkout/components/checkout-sign-up'
import WaitingResponse from 'components/waiting-response'
import { AuthenticateUserContainer } from 'containers/authenticate-user-container'
import { Cart } from 'domain/cart'
import { PATHS } from 'pages/paths'
import { addArrayProduct } from 'pages/product/actions'
import { CHECKOUT_NAVBAR_HEIGHT } from 'system-ui/constants'

class CreateCheckout extends Component {
  constructor() {
    super()

    this.state = {
      waitingApiResponse: true,
    }

    this.goBack = this.goBack.bind(this)
    this.renderCorrectChildren = this.renderCorrectChildren.bind(this)
  }

  componentDidMount() {
    const { isAuth } = this.props

    if (!isAuth) return

    this.toggleWaitingApiResponse()
  }

  async componentDidUpdate(prevProps) {
    const { waitingApiResponse } = this.state
    const { isAuth, checkoutId: currentCheckoutId, userUuid } = this.props

    if (!isAuth) return

    if (!waitingApiResponse && currentCheckoutId) {
      this.redirectToCheckout(currentCheckoutId)
      return
    }

    const hasAuthenticatedRecently = !prevProps.isAuth && this.props.isAuth
    if (hasAuthenticatedRecently) {
      await this.handleCreateCheckout(userUuid)
      return
    }
  }
  async handleCreateCheckout(userUuid) {
    const { cart } = this.props

    if (Cart.isEmpty(cart)) return

    const checkout = await CheckoutClient.create(userUuid, cart)

    if (!checkout) return

    this.props.actions.createCheckout(checkout)
    this.toggleWaitingApiResponse()
  }

  toggleWaitingApiResponse() {
    this.setState({ waitingApiResponse: !this.state.waitingApiResponse })
  }

  redirectToCheckout(id) {
    this.props.history.replace(`/checkout/${id}`)
  }

  goBack() {
    this.props.actions.cancelCheckout()
    this.props.history.push(PATHS.HOME)
  }

  renderCorrectChildren() {
    const { isAuth } = this.props

    if (!isAuth) {
      const authFormPaddingTop = { paddingTop: `${CHECKOUT_NAVBAR_HEIGHT}px` }
      return (
        <div style={authFormPaddingTop}>
          <AuthenticateUserContainer
            checkUserComponent={CheckoutCheckUser}
            signUpComponent={CheckoutSignUp}
            loginComponent={CheckoutLogin}
            passwordRecoveryComponent={CheckoutPasswordRecovery}
            isBeingAuthorizedFromCheckout
          />
        </div>
      )
    }

    if (this.state.waitingApiResponse) {
      return <WaitingResponse />
    }

    return null
  }

  render() {
    return (
      <CheckoutLayout
        goBack={this.goBack}
        renderChildren={this.renderCorrectChildren}
      />
    )
  }
}

CreateCheckout.propTypes = {
  history: PropTypes.shape({
    replace: PropTypes.func.isRequired,
    push: PropTypes.func.isRequired,
    goBack: PropTypes.func.isRequired,
  }).isRequired,
  actions: PropTypes.shape({
    createCheckout: PropTypes.func.isRequired,
    cancelCheckout: PropTypes.func.isRequired,
    addArrayProduct: PropTypes.func.isRequired,
    replaceCart: PropTypes.func.isRequired,
  }).isRequired,
  cart: PropTypes.object.isRequired,
  userUuid: PropTypes.string,
  isAuth: PropTypes.bool.isRequired,
  checkoutId: PropTypes.number,
}

const mapStateToProps = ({ checkout, session, cart }) => ({
  cart,
  checkoutId: checkout?.id,
  isAuth: session.isAuth,
  userUuid: session.uuid,
})

const mapDispatchToProps = (dispatch) => ({
  actions: {
    createCheckout: bindActionCreators(createCheckout, dispatch),
    cancelCheckout: bindActionCreators(cancelCheckout, dispatch),
    addArrayProduct: bindActionCreators(addArrayProduct, dispatch),
    replaceCart: bindActionCreators(replaceCart, dispatch),
  },
})

const ConnectedCreateCheckout = connect(
  mapStateToProps,
  mapDispatchToProps,
)(CreateCheckout)

export { ConnectedCreateCheckout as CreateCheckout }
