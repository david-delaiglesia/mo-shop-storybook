import { connect } from 'react-redux'

import { func, object } from 'prop-types'

import { OrderClient } from 'app/order/client'
import { OrderContactContainer } from 'app/order/containers/order-contact-container'
import { Order } from 'domain/order'

const OrderContactInfoContainer = ({ order, session, updateOrder }) => {
  const { phone_national_number, phone_country_code, id } = order

  const updateContactInfo = async (contactInfo) => {
    const updatedOrder = await OrderClient.updateContactInfo(
      session.uuid,
      id,
      contactInfo,
    )
    updateOrder(updatedOrder)
  }

  return (
    <OrderContactContainer
      phoneNationalNumber={phone_national_number}
      phoneCountryCode={phone_country_code}
      confirmData={updateContactInfo}
      showEditButton={Order.isEditable(order)}
      checkoutId={id}
      orderId={id}
    />
  )
}

OrderContactInfoContainer.propTypes = {
  order: object.isRequired,
  updateOrder: func.isRequired,
  session: object.isRequired,
}

const mapStateToProps = ({ session }) => ({
  session,
})

const ComposedOrderContactInfoContainer = connect(mapStateToProps)(
  OrderContactInfoContainer,
)

export { ComposedOrderContactInfoContainer as OrderContactInfoContainer }
