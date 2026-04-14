import { actionTypes } from './actions'

import { createReducer } from '@mercadona/mo.library.dashtil'

const INITIAL_STATE = false

const overlay = createReducer(INITIAL_STATE, {
  [actionTypes.TOGGLE_OVERLAY]: (state) => !state,
  [actionTypes.OPEN_OVERLAY]: () => true,
  [actionTypes.CLOSE_OVERLAY]: () => false,
})

export { overlay }
