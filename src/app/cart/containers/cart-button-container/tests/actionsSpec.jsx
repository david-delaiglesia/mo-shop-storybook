import * as actions from '../actions'
import { actionTypes } from '../actions'

import { createReduxStore } from 'app/redux'

describe('<CartButtonContainer /> · Actions', () => {
  const store = createReduxStore()

  beforeEach(() => {
    store.clearActions()
  })

  it('openCart should return expected action ', () => {
    const expectedAction = {
      type: actionTypes.OPEN_CART,
    }
    store.dispatch(actions.openCart())
    const resultActions = store.getActions()
    expect(resultActions[0]).toEqual(expectedAction)
  })

  it('closeCart should return expected action ', () => {
    const expectedAction = {
      type: actionTypes.CLOSE_CART,
    }
    store.dispatch(actions.closeCart())
    const resultActions = store.getActions()
    expect(resultActions[0]).toEqual(expectedAction)
  })

  it('toggleCart should return expected action ', () => {
    const expectedAction = {
      type: actionTypes.TOGGLE_CART,
    }
    store.dispatch(actions.toggleCart())
    const resultActions = store.getActions()
    expect(resultActions[0]).toEqual(expectedAction)
  })

  it('enableHighlightCart should return expected action ', () => {
    const expectedAction = {
      type: actionTypes.ENABLE_HIGHLIGHT_CART,
    }
    store.dispatch(actions.enableHighlightCart())
    const resultActions = store.getActions()
    expect(resultActions[0]).toEqual(expectedAction)
  })

  it('disableHighlightCart should return expected action ', () => {
    const expectedAction = {
      type: actionTypes.DISABLE_HIGHLIGHT_CART,
    }
    store.dispatch(actions.disableHighlightCart())
    const resultActions = store.getActions()
    expect(resultActions[0]).toEqual(expectedAction)
  })
})
