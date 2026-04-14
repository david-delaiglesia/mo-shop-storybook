import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router'

import { func } from 'prop-types'

import { openCart } from 'app/cart/containers/cart-button-container/actions'
import { withTranslate } from 'app/i18n/containers/i18n-provider'
import OrderHeader from 'app/order/components/order-header'
import { openOverlay } from 'containers/overlay-container/actions'
import { cancelCheckout } from 'pages/create-checkout/actions'
import { PATHS } from 'pages/paths'

const CheckoutHeader = ({ t }) => {
  const dispatch = useDispatch()
  const history = useHistory()

  const goBack = () => {
    dispatch(cancelCheckout)
    dispatch(openOverlay)
    dispatch(openCart)
    history.push(PATHS.HOME)
  }

  const headerStyles = {
    position: 'fixed',
    width: '100%',
    top: 0,
  }

  return (
    <OrderHeader
      text={t('checkout.header.label')}
      ariaLabel={t('checkout.header.aria')}
      callback={goBack}
      style={headerStyles}
    />
  )
}

CheckoutHeader.propTypes = {
  t: func.isRequired,
}

const CheckoutHeaderWithTranslate = withTranslate(CheckoutHeader)

export { CheckoutHeaderWithTranslate as CheckoutHeader }
