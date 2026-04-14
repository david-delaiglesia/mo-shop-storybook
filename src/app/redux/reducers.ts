import { combineReducers } from 'redux'

import { sessionReducer } from 'app/authentication/reducers'
import { cartUI } from 'app/cart/containers/cart-button-container/reducers'
import { cart } from 'app/cart/reducers'
import { productModal } from 'app/catalog/reducers'
import { config } from 'app/config/reducers'
import { isDeliveryAreaOpened } from 'app/delivery-area/reducers'
import { language } from 'app/i18n/reducers'
import { search } from 'app/search/reducers'
import { alert } from 'app/shared/alert/reducers'
// Import all reducers here:
import { userReducer } from 'app/user/reducers'
import { headerType } from 'components/header-switch/reducers'
import { isModalOpened } from 'components/modal/reducers'
import { notifications } from 'containers/notifications-container/reducers'
import { network } from 'containers/offline-inspector-container/reducers'
import { overlay } from 'containers/overlay-container/reducers'
import { checkout } from 'pages/create-checkout/reducers'
import { products } from 'pages/product/reducers'
import { pendingActionUuid } from 'wrappers/feedback/reducers'

export const rootReducer = combineReducers({
  session: sessionReducer,
  config,
  user: userReducer,
  cart,
  products,
  checkout,
  search,
  ui: combineReducers({
    overlay,
    isModalOpened,
    isDeliveryAreaOpened,
    cartUI,
    productModal,
    headerType,
    alert,
  }),
  network,
  language,
  notifications,
  pendingActionUuid,
})
