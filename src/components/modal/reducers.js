import { actionTypes } from './actions'

import { createReducer } from '@mercadona/mo.library.dashtil'

const INITIAL_STATE = false

const isModalOpened = createReducer(INITIAL_STATE, {
  [actionTypes.TOGGLE_MODAL]: (state) => !state,
})

export { isModalOpened }
