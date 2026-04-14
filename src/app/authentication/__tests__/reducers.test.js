import { actionTypes } from '../actions'
import { sessionReducer } from '../reducers'

describe('Session reducer', () => {
  const INITIAL_STATE = {}

  it('should handle default action', () => {
    const expectedSession = {}

    const receivedSession = sessionReducer()

    expect(receivedSession).toEqual(expectedSession)
  })

  it('should handle UPDATE_SESSION action', () => {
    const uuid = '07cc5a97-41a4-40a2-88bb-22c154b45784'
    const postalCode = '46021'
    const expectedSession = { isAuth: true, uuid, postalCode }
    const state = { isAuth: true, uuid }
    const action = {
      type: actionTypes.UPDATE_SESSION,
      payload: expectedSession,
    }

    const receivedSession = sessionReducer(state, action)

    expect(receivedSession).toEqual(expectedSession)
  })

  it('should handle LOGIN action', () => {
    const uuid = '07cc5a97-41a4-40a2-88bb-22c154b45784'
    const expectedSession = { isAuth: true, uuid }
    const state = INITIAL_STATE
    const action = {
      type: actionTypes.CREATE_SESSION,
      payload: expectedSession,
    }

    const receivedSession = sessionReducer(state, action)

    expect(receivedSession).toEqual(expectedSession)
  })

  it('should handle LOGOUT action', () => {
    const expectedSession = { isAuth: false, uuid: undefined }
    const state = INITIAL_STATE
    const action = {
      type: actionTypes.REMOVE_SESSION,
    }

    const receivedSession = sessionReducer(state, action)

    expect(receivedSession).toEqual(expectedSession)
  })
})
