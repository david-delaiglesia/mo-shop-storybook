import { createThunk } from '@mercadona/mo.library.dashtil'

import addToCartImage from 'app/assets/repeat-add@2x.png'
import replaceCartImage from 'app/assets/repeat-replace@2x.png'
import { repeatOrder } from 'app/order/commands'
import { hideAlert, showAlert } from 'app/shared/alert/actions'
import { Cart } from 'domain/cart'

const REPEAT_PURCHASE_MESSAGES = {
  REPLACE_MESSAGE: 'alerts.repeat_purchase.replace_message',
  ADD_MESSAGE: 'alerts.repeat_purchase.add_message',
}

/**
 * @deprecated Use showModal from ModalContext instead
 */
export const showRepeatPurchaseAlert = ({ cart, order }, { dispatch }) => {
  const alertOptions = {
    title: 'alerts.repeat_purchase.title',
    description: Cart.isEmpty(cart)
      ? REPEAT_PURCHASE_MESSAGES.ADD_MESSAGE
      : REPEAT_PURCHASE_MESSAGES.REPLACE_MESSAGE,
    imageSrc: Cart.isEmpty(cart) ? addToCartImage : replaceCartImage,
    confirmButtonText: 'alerts.repeat_purchase.confirm',
    confirmButtonAction: () => {
      dispatch(hideAlert())
      const repeatOrderAction = createThunk(repeatOrder)
      const oldCartId = cart.id
      dispatch(repeatOrderAction(order.id, oldCartId))
    },
    secondaryActionText: 'alerts.repeat_purchase.cancel',
    secondaryAction: () => {
      dispatch(hideAlert())
    },
  }

  dispatch(showAlert(alertOptions))
}
