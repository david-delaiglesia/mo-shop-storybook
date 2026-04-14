import { actionTypes } from './actions'

import { createReducer } from '@mercadona/mo.library.dashtil'

const INITIAL_STATE = {}

const cartUI = createReducer(INITIAL_STATE, {
  [actionTypes.OPEN_CART]: (cartUI) => ({
    ...cartUI,
    opened: true,
  }),
  [actionTypes.CLOSE_CART]: (cartUI) => ({
    ...cartUI,
    opened: false,
  }),
  [actionTypes.TOGGLE_CART]: (cartUI) => ({
    ...cartUI,
    opened: !cartUI.opened,
  }),
  [actionTypes.ENABLE_HIGHLIGHT_CART]: (cartUI) => ({
    ...cartUI,
    highlight: true,
  }),
  [actionTypes.DISABLE_HIGHLIGHT_CART]: (cartUI) => ({
    ...cartUI,
    highlight: false,
  }),
})

export { cartUI }
