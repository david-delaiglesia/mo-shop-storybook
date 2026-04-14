import { actionTypes } from './actions'

import { createReducer } from '@mercadona/mo.library.dashtil'

const INITIAL_STATE = ''

const language = createReducer(INITIAL_STATE, {
  [actionTypes.CHANGE_LANGUAGE]: (state, payload) => payload.language,
})

export { language }
