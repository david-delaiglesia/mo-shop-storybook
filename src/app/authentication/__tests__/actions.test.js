import * as actions from '../actions'
import { actionTypes } from '../actions'

describe('Postal code actions', () => {
  const session = {
    isAuth: false,
    postalCode: '46021',
    warehouse: 'vlc1',
  }

  it('should create an action to save a postal code', () => {
    const expectedAction = {
      type: actionTypes.UPDATE_SESSION,
      payload: session,
    }

    expect(actions.updateSession(session)).toEqual(expectedAction)
  })

  it('should create an action to login', () => {
    const expectedAction = {
      type: actionTypes.CREATE_SESSION,
      payload: session,
    }

    expect(actions.createSession(session)).toEqual(expectedAction)
  })

  it('should create an action to login', () => {
    const expectedAction = {
      type: actionTypes.REMOVE_SESSION,
    }

    expect(actions.removeSession()).toEqual(expectedAction)
  })
})
