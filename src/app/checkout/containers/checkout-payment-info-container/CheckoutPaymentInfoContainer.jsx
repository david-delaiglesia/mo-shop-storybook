import { CheckoutClient } from '../../client'
import { func } from 'prop-types'

import { useUserUUID } from 'app/authentication'
import { useCheckoutContext } from 'app/checkout/contexts/CheckoutContext'
import { OrderPaymentContainer } from 'app/order/containers/order-payment-container'
import { CardService } from 'domain/card'

const isDisabled = ({ address, slot, customerPhone }) =>
  !address || !slot || !customerPhone

export const CheckoutPaymentInfoContainer = ({
  incrementEditMode,
  decrementEditMode,
}) => {
  const { checkout, refetchCheckout } = useCheckoutContext()
  const customerId = useUserUUID()

  const updatePaymentInfo = async (selectedPaymentInfo) => {
    await CheckoutClient.updatePaymentInfo(
      customerId,
      checkout.id,
      selectedPaymentInfo,
    )

    refetchCheckout()
  }

  return (
    <OrderPaymentContainer
      payment={checkout.paymentMethod}
      incrementEditMode={incrementEditMode}
      decrementEditMode={decrementEditMode}
      confirmData={updatePaymentInfo}
      hidden={isDisabled(checkout)}
      checkoutId={checkout.id}
      orderId={checkout.id}
      showExpirationDisclaimer={CardService.willBeExpiredOnSlotDelivery(
        checkout.paymentMethod,
        checkout.slot,
      )}
    />
  )
}

CheckoutPaymentInfoContainer.propTypes = {
  incrementEditMode: func.isRequired,
  decrementEditMode: func.isRequired,
}
