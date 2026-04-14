import * as actions from '../actions'
import { actionTypes } from '../actions'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

describe('<CartContainer/> · Actions', () => {
  const product = {
    id: 8001,
  }

  const products = [{ id: 9001 }, { id: 8009 }]

  const mockStore = configureMockStore([thunk])
  const store = mockStore()

  beforeEach(() => {
    store.clearActions()
  })

  it('addProductToCart should return expected action ', () => {
    const expectedAction = {
      type: actionTypes.ADD_PRODUCT,
      payload: product,
    }
    store.dispatch(actions.addProduct(product))
    const resultActions = store.getActions()
    expect(resultActions[0]).toEqual(expectedAction)
  })

  it('decreaseProductFromCart should return expected action', () => {
    const expectedAction = {
      type: actionTypes.ADD_ARRAY_PRODUCTS,
      payload: products,
    }
    store.dispatch(actions.addArrayProduct(products))
    const resultActions = store.getActions()
    expect(resultActions[0]).toEqual(expectedAction)
  })
})
