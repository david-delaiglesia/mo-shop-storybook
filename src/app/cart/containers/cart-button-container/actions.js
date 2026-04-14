export const actionTypes = {
  OPEN_CART: 'OPEN_CART',
  CLOSE_CART: 'CLOSE_CART',
  TOGGLE_CART: 'TOGGLE_CART',
  ENABLE_HIGHLIGHT_CART: 'ENABLE_HIGHLIGHT_CART',
  DISABLE_HIGHLIGHT_CART: 'DISABLE_HIGHLIGHT_CART',
}

export function openCart() {
  return {
    type: actionTypes.OPEN_CART,
  }
}

export function closeCart() {
  return {
    type: actionTypes.CLOSE_CART,
  }
}

export function toggleCart() {
  return {
    type: actionTypes.TOGGLE_CART,
  }
}

export function enableHighlightCart() {
  return {
    type: actionTypes.ENABLE_HIGHLIGHT_CART,
  }
}

export function disableHighlightCart() {
  return {
    type: actionTypes.DISABLE_HIGHLIGHT_CART,
  }
}
