import { actionTypes } from './actions'

import { createReducer } from '@mercadona/mo.library.dashtil'

const INITIAL_STATE = {}

const network = createReducer(INITIAL_STATE, {
  [actionTypes.SET_NETWORK_OFFLINE]: (state, payload) => ({
    ...payload,
  }),
  [actionTypes.SET_NETWORK_ONLINE]: (state, payload) => ({
    ...payload,
  }),
})

export { network }
