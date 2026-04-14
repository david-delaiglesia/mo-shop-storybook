import { actionTypes } from '../actions'
import { notifications as notificationsReducer } from '../reducers'

describe('NotificationsContainer · Reducers', () => {
  it('notifications reducer should return empty if no data is provided', () => {
    expect(notificationsReducer()).toEqual([])
  })

  it('should handle CREATE_NOTIFICATION', () => {
    const expectedResult = [{ text: 'test', uuid: 'test' }]
    expect(
      notificationsReducer([], {
        type: actionTypes.CREATE_NOTIFICATION,
        payload: { text: 'test', uuid: 'test' },
      }),
    ).toEqual(expectedResult)
  })

  it('should handle DELETE_NOTIFICATION', () => {
    const notifications = [{ text: 'test', uuid: 'test' }]
    expect(
      notificationsReducer(notifications, {
        type: actionTypes.DELETE_NOTIFICATION,
        payload: { text: 'test', uuid: 'test' },
      }),
    ).toEqual([])
  })
})
