import { actionTypes } from './actions'

import { createReducer } from '@mercadona/mo.library.dashtil'

const INITIAL_STATE = null

const checkout = createReducer(INITIAL_STATE, {
  [actionTypes.CREATE_CHECKOUT]: (checkout, payload) => payload,
  [actionTypes.CHANGE_CHECKOUT]: (checkout, payload) => ({
    ...checkout,
    ...payload,
  }),
  [actionTypes.CANCEL_CHECKOUT]: () => null,
  [actionTypes.UPDATE_CHECKOUT_ADDRESS]: (state, payload) => ({
    ...state,
    address: payload,
  }),
})

export { checkout }
