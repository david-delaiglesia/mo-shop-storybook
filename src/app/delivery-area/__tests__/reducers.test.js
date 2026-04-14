import { actionTypes } from '../actions'
import { isDeliveryAreaOpened } from '../reducers'

describe('Delivery Area reducers', () => {
  it('should handle default action', () => {
    const expectedState = false

    const receivedState = isDeliveryAreaOpened()

    expect(receivedState).toEqual(expectedState)
  })

  it('should handle OPEN_DELIVERY_AREA_MODAL action', () => {
    const state = false
    const action = {
      type: actionTypes.OPEN_DELIVERY_AREA_MODAL,
    }

    const receivedSession = isDeliveryAreaOpened(state, action)

    expect(receivedSession).toBeTruthy()
  })

  it('should handle CLOSE_DELIVERY_AREA_MODAL action', () => {
    const state = true
    const action = {
      type: actionTypes.CLOSE_DELIVERY_AREA_MODAL,
    }

    const receivedSession = isDeliveryAreaOpened(state, action)

    expect(receivedSession).toBeFalsy()
  })
})
