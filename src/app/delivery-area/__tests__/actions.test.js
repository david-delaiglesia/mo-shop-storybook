import * as actions from '../actions'
import { actionTypes } from '../actions'

describe('Delivery area actions', () => {
  it('should create an action to open the delivery area modal', () => {
    const expectedAction = {
      type: actionTypes.OPEN_DELIVERY_AREA_MODAL,
    }

    expect(actions.openDeliveryArea()).toEqual(expectedAction)
  })

  it('should create an action to close the delivery area modal', () => {
    const expectedAction = {
      type: actionTypes.CLOSE_DELIVERY_AREA_MODAL,
    }

    expect(actions.closeDeliveryArea()).toEqual(expectedAction)
  })
})
