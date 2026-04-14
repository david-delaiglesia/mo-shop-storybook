import { actionTypes } from './actions'

import { createReducer } from '@mercadona/mo.library.dashtil'

const INITIAL_STATE = null

const pendingActionUuid = createReducer(INITIAL_STATE, {
  [actionTypes.SET_PENDING_ACTION]: (pendingAction, payload) => payload,
  [actionTypes.CLEAR_PENDING_ACTION]: () => null,
})

export { pendingActionUuid }
