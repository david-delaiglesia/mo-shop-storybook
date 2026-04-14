import { UserActionTypes } from './actions'

import { createReducer } from '@mercadona/mo.library.dashtil'

import { UserResponse } from 'app/user/interfaces'

type UserState = Partial<UserResponse>

const INITIAL_STATE: UserState = {}

export const userReducer = createReducer(INITIAL_STATE, {
  [UserActionTypes.SET_LOGGED_USER]: (_, payload: UserResponse) => ({
    ...payload,
  }),

  [UserActionTypes.MODIFY_LOGGED_USER]: <
    PropertyType extends keyof UserResponse,
  >(
    state: UserState,
    payload: { property: PropertyType; value: UserResponse[PropertyType] },
  ) => ({
    ...state,
    [payload.property]: payload.value,
  }),

  [UserActionTypes.REMOVE_LOGGED_USER]: () => INITIAL_STATE,

  [UserActionTypes.DELETE_USER_ACCOUNT]: (state) => ({
    ...state,
    has_requested_account_deletion: true,
  }),
})
