import {
  applyMiddleware,
  compose,
  legacy_createStore as createStore,
} from 'redux'
import thunk from 'redux-thunk'

import { actionTypes as cartActionTypes } from 'app/cart/actions'
import { setEditingOrderMode } from 'app/catalog/actions'
import { rootReducer } from 'app/redux/reducers'
import { actionTypes as alertActionTypes } from 'app/shared/alert/actions'
import { actionTypes } from 'containers/notifications-container/actions'

const randomName = Math.random().toString(36).substring(7)

const ACTIONS_TO_PROPAGATE = [
  actionTypes.CREATE_NOTIFICATION,
  cartActionTypes.CLEAR_CART,
  alertActionTypes.SHOW_ALERT,
  alertActionTypes.HIDE_ALERT,
]

function createEditPurchaseStore(
  name = randomName,
  initialState = {},
  globalDispatch,
) {
  const propagateAction = () => (next) => (action) => {
    const result = next(action)
    if (ACTIONS_TO_PROPAGATE.includes(action.type)) {
      globalDispatch(action)
    }
    return result
  }

  const middlewares = [thunk, propagateAction]

  const state = {
    ...initialState,
    ui: {
      ...initialState.ui,
      productModal: { productId: null, editingOrder: true },
    },
  }

  const composedEnhancers = compose(
    applyMiddleware(...middlewares),
    window.devToolsExtension
      ? window.devToolsExtension({ name, instanceId: name })
      : (f) => f, // Remove in prod
  )

  const editPurchaseStore = createStore(rootReducer, state, composedEnhancers)

  globalDispatch(setEditingOrderMode())

  return editPurchaseStore
}

export default createEditPurchaseStore
