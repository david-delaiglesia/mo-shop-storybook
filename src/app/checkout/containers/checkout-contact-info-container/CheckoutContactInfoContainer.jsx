import { connect } from 'react-redux'

import { func, string } from 'prop-types'
import { bindActionCreators } from 'redux'

import { CheckoutClient } from 'app/checkout/client'
import { useCheckoutContext } from 'app/checkout/contexts/CheckoutContext'
import { OrderContactContainer } from 'app/order/containers/order-contact-container'
import { changeCheckout } from 'pages/create-checkout/actions'

const isDisabled = ({ address, slot }) => !address || !slot

const CheckoutContactInfoContainer = ({
  incrementEditMode,
  decrementEditMode,
  userUuid,
}) => {
  const { refetchCheckout, checkout } = useCheckoutContext()

  const updateContactInfo = async (contactInfo) => {
    await CheckoutClient.updateContactInfo(userUuid, checkout.id, contactInfo)

    refetchCheckout()
  }

  return (
    <OrderContactContainer
      phoneNationalNumber={checkout.phoneNationalNumber}
      phoneCountryCode={checkout.phoneCountryCode}
      incrementEditMode={incrementEditMode}
      decrementEditMode={decrementEditMode}
      hidden={isDisabled(checkout)}
      confirmData={updateContactInfo}
      checkoutId={checkout.id}
      orderId={checkout.id}
    />
  )
}

CheckoutContactInfoContainer.propTypes = {
  incrementEditMode: func.isRequired,
  decrementEditMode: func.isRequired,
  userUuid: string.isRequired,
  changeCheckout: func.isRequired,
}

const mapStateToProps = ({ session }) => ({
  userUuid: session.uuid,
})

const mapDispatchToProps = (dispatch) => ({
  changeCheckout: bindActionCreators(changeCheckout, dispatch),
})

const ComposedCheckoutContactInfoContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(CheckoutContactInfoContainer)

export { ComposedCheckoutContactInfoContainer as CheckoutContactInfoContainer }
