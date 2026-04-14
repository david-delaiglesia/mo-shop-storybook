import * as actions from '../actions'
import { actionTypes } from '../actions'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

describe('<Modal/> · Actions', () => {
  const mockStore = configureMockStore([thunk])
  const store = mockStore()

  beforeEach(() => {
    store.clearActions()
  })

  it('toggleModal should return expected action ', () => {
    const expectedAction = {
      type: actionTypes.TOGGLE_MODAL,
    }
    store.dispatch(actions.toggleModal())
    const resultActions = store.getActions()
    expect(resultActions[0]).toEqual(expectedAction)
  })
})
