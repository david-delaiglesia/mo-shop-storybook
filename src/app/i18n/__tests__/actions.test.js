import * as actions from '../actions'
import { actionTypes } from '../actions'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

describe('i18n actions', () => {
  const mockStore = configureMockStore([thunk])
  const store = mockStore({ response: {} })

  const language = 'es'

  beforeEach(() => {
    store.clearActions()
  })

  it('changeLanguage should return expected action', () => {
    const expectedAction = {
      type: actionTypes.CHANGE_LANGUAGE,
      payload: { language },
    }

    store.dispatch(actions.changeLanguage(language))

    const resultActions = store.getActions()
    expect(resultActions[0]).toEqual(expectedAction)
  })
})
