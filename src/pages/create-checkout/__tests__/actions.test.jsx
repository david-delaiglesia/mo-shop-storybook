import * as actions from '../actions'
import { actionTypes } from '../actions'

describe('<Checkout/> · Actions', () => {
  const payload = {
    id: 1234,
  }

  it('should create an action to create a checkout', () => {
    const expectedAction = {
      type: actionTypes.CREATE_CHECKOUT,
      payload,
    }
    expect(actions.createCheckout(payload)).toEqual(expectedAction)
  })

  it('should create an action to change a checkout', () => {
    const expectedAction = {
      type: actionTypes.CHANGE_CHECKOUT,
      payload,
    }
    expect(actions.changeCheckout(payload)).toEqual(expectedAction)
  })

  it('should create an action to cancel a checkout', () => {
    const expectedAction = {
      type: actionTypes.CANCEL_CHECKOUT,
    }
    expect(actions.cancelCheckout()).toEqual(expectedAction)
  })
})
