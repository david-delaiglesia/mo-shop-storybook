export const actionTypes = {
  CREATE_NOTIFICATION: 'CREATE_NOTIFICATION',
  DELETE_NOTIFICATION: 'DELETE_NOTIFICATION',
}

export function createNotification(payload) {
  payload.uuid = payload.uuid || crypto.randomUUID()

  return {
    payload,
    type: actionTypes.CREATE_NOTIFICATION,
  }
}

export function deleteNotification(payload) {
  return {
    payload,
    type: actionTypes.DELETE_NOTIFICATION,
  }
}
