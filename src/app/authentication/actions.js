export const actionTypes = {
  CREATE_SESSION: 'CREATE_SESSION',
  UPDATE_SESSION: 'UPDATE_SESSION',
  REMOVE_SESSION: 'REMOVE_SESSION',
}

export const createSession = (session) => ({
  type: actionTypes.CREATE_SESSION,
  payload: session,
})

export const updateSession = (session) => ({
  type: actionTypes.UPDATE_SESSION,
  payload: session,
})

export const removeSession = () => ({
  type: actionTypes.REMOVE_SESSION,
})
