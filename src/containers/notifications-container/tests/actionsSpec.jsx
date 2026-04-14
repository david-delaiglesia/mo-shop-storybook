import * as actions from '../actions'
import { actionTypes } from '../actions'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

describe('<NotificationsContainer/> · Actions', () => {
  const notification = {
    text: 'test',
    uuid: 'test',
  }

  const mockStore = configureMockStore([thunk])
  const store = mockStore()

  beforeEach(() => {
    store.clearActions()
  })

  it('createNotification should return expected action ', () => {
    const expectedAction = {
      type: actionTypes.CREATE_NOTIFICATION,
      payload: notification,
    }
    store.dispatch(actions.createNotification(notification))
    const resultActions = store.getActions()
    expect(resultActions[0]).toEqual(expectedAction)
  })

  it('deleteNotification should return expected action ', () => {
    const expectedAction = {
      type: actionTypes.DELETE_NOTIFICATION,
      payload: notification,
    }
    store.dispatch(actions.deleteNotification(notification))
    const resultActions = store.getActions()
    expect(resultActions[0]).toEqual(expectedAction)
  })
})
