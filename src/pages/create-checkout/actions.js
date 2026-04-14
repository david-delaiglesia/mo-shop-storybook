export const actionTypes = {
  CREATE_CHECKOUT: 'CREATE_CHECKOUT',
  CHANGE_CHECKOUT: 'CHANGE_CHECKOUT',
  CANCEL_CHECKOUT: 'CANCEL_CHECKOUT',
  UPDATE_CHECKOUT_ADDRESS: 'UPDATE_CHECKOUT_ADDRESS',
}

export function createCheckout(payload) {
  return {
    payload,
    type: actionTypes.CREATE_CHECKOUT,
  }
}

export function changeCheckout(payload) {
  return {
    payload,
    type: actionTypes.CHANGE_CHECKOUT,
  }
}

export function cancelCheckout() {
  return {
    type: actionTypes.CANCEL_CHECKOUT,
  }
}

export function updateCheckoutAddress(payload) {
  return {
    type: actionTypes.UPDATE_CHECKOUT_ADDRESS,
    payload,
  }
}
