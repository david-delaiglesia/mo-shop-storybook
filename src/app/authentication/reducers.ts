import { actionTypes } from './actions'

import { createReducer } from '@mercadona/mo.library.dashtil'

interface SessionState {
  isAuth?: boolean
  uuid?: string
  warehouse?: string
  postalCode?: string
}

export const INITIAL_STATE: SessionState = {}

export const sessionReducer = createReducer(INITIAL_STATE, {
  [actionTypes.CREATE_SESSION]: (
    state,
    payload: Pick<SessionState, 'uuid'>,
  ) => ({
    ...state,
    isAuth: true,
    uuid: payload.uuid,
  }),
  [actionTypes.UPDATE_SESSION]: (state, payload: Partial<SessionState>) => ({
    ...state,
    ...payload,
  }),
  [actionTypes.REMOVE_SESSION]: (state) => ({
    ...state,
    isAuth: false,
    uuid: undefined,
  }),
})
