export const actionTypes = {
  SET_PENDING_ACTION: 'SET_PENDING_ACTION',
  CLEAR_PENDING_ACTION: 'CLEAR_PENDING_ACTION',
}

export function setPendingAction(payload) {
  return {
    payload,
    type: actionTypes.SET_PENDING_ACTION,
  }
}

export function clearPendingAction() {
  return {
    type: actionTypes.CLEAR_PENDING_ACTION,
  }
}
