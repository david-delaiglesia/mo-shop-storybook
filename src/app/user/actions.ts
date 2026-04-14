import { createSession } from 'app/authentication/actions'
import { UserResponse } from 'app/user/interfaces'

export enum UserActionTypes {
  SET_LOGGED_USER = 'SET_LOGGED_USER',
  REMOVE_LOGGED_USER = 'REMOVE_LOGGED_USER',
  MODIFY_LOGGED_USER = 'MODIFY_LOGGED_USER',
  DELETE_USER_ACCOUNT = 'DELETE_USER_ACCOUNT',
}

export const loginSuccess = createSession

export const setLoggedUser = (user: UserResponse) => ({
  type: UserActionTypes.SET_LOGGED_USER,
  payload: user,
})

export const modifyLoggedUser = <PropertyType extends keyof UserResponse>(
  property: PropertyType,
  value: UserResponse[PropertyType],
) => ({
  payload: { property, value },
  type: UserActionTypes.MODIFY_LOGGED_USER,
})

export const removeLoggedUser = () => ({
  type: UserActionTypes.REMOVE_LOGGED_USER,
})

export const setAccountDeletionRequest = () => ({
  type: UserActionTypes.DELETE_USER_ACCOUNT,
})
