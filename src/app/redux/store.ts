import { rootReducer } from './reducers'
import { composeWithDevTools } from '@redux-devtools/extension'
import { applyMiddleware, legacy_createStore as createStore } from 'redux'
import thunk from 'redux-thunk'

import { I18nClient } from 'app/i18n/client'
import { Session } from 'services/session'

interface InitialState {
  session: {
    isAuth: boolean
    uuid: string
    warehouse: string
    postalCode: string
  }
  user: object
  products: object
  checkout: null
  search: object
  ui: {
    overlay: boolean
    isModalOpened: boolean
    cartUI: { opened: boolean; highlight: boolean }
    productModal: {
      productId: null
      editingOrder: boolean
      source: null
      sourceCode: null
      productSlug: null
    }
  }
  network: object
  language: string
  notifications: never[]
  pendingActionUuid: undefined
}
// TODO: Fix it moving initial state from each slice or just remove it to set it as undefined
const getInitialState = (): InitialState => ({
  session: Session.get(),
  user: {},

  products: {},
  checkout: null,
  search: {},

  ui: {
    overlay: false,
    isModalOpened: false,
    cartUI: { opened: false, highlight: false },
    productModal: {
      productId: null,
      editingOrder: false,
      source: null,
      sourceCode: null,
      productSlug: null,
    },
  },

  network: {
    isOffline: false,
  },

  language: I18nClient.getCurrentLanguage(),

  notifications: [],
  pendingActionUuid: undefined,
})

const middlewares = [thunk]

const devToolsConfig = {
  name: 'global',
  instanceId: 'global',
  actionsDenylist: ['REDUX_STORAGE_SAVE'],
}
const composeEnhancers = composeWithDevTools(devToolsConfig)

const enhancer = composeEnhancers(applyMiddleware(...middlewares))

const createReduxStore = () =>
  createStore(rootReducer, getInitialState(), enhancer)

export { createReduxStore }

export type AppStore = ReturnType<typeof createReduxStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
