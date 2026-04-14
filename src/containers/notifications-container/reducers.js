import { actionTypes } from './actions'

import { createReducer } from '@mercadona/mo.library.dashtil'

export const INITIAL_STATE = []

export const notifications = createReducer(INITIAL_STATE, {
  [actionTypes.CREATE_NOTIFICATION]: createNotification,
  [actionTypes.DELETE_NOTIFICATION]: deleteNotification,
})

function createNotification(notifications, payload) {
  const isExists = notifications.find(
    (notification) => notification.uuid === payload.uuid,
  )
  if (isExists) {
    return notifications
  }

  return [...notifications, payload]
}

function deleteNotification(notifications, payload) {
  let index = notifications.findIndex((i) => i.uuid === payload)
  notifications.splice(index, 1)
  return [...notifications]
}
