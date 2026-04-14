import { createSession, removeSession, updateSession } from './actions'

import { clearCart } from 'app/cart/actions'
import {
  addProductToCartAndUpdate,
  getCartAndSaveInStore,
  getFromStoreAndUpdateCart,
} from 'app/cart/commands'
import { removeLoggedUser, setLoggedUser } from 'app/user/actions'
import { Cart } from 'domain/cart'
import { Cache } from 'services/cache'
import { Session } from 'services/session'
import { Storage } from 'services/storage'
import { STORAGE_KEYS } from 'services/storage/constants'
import { Support } from 'services/support'
import { Tracker } from 'services/tracker'

export const updateDeliveryArea = ({ warehouse, postalCode }, store) => {
  if (warehouse) {
    Session.saveWarehouse(warehouse)
    Tracker.setUserProperties({ warehouse })
    store.dispatch(updateSession({ warehouse }))
  }

  if (postalCode) {
    Session.savePostalCode(postalCode)
    Tracker.setUserProperties({ postal_code: postalCode })
    store.dispatch(updateSession({ postalCode }))
  }
}

export function updatePostalCode(postalCode, store) {
  if (!postalCode) return

  Session.savePostalCode(postalCode)
  store.dispatch(updateSession({ postalCode }))
}

export async function register(user, auth, store) {
  Session.saveUser(auth)

  store.dispatch(createSession(user))
  store.dispatch(setLoggedUser(user))

  Support.identify(user)

  getFromStoreAndUpdateCart(store)
}

export async function login(user, store) {
  store.dispatch(createSession(user))
  store.dispatch(setLoggedUser(user))

  Support.identify(user)

  const { cart } = store.getState()

  if (Cart.isEmpty(cart)) {
    await getCartAndSaveInStore(store)
  }

  await getFromStoreAndUpdateCart(store)
}

export async function loginSuggestion(user, store) {
  const { products, cart: cartBeforeLogin } = store.getState()

  store.dispatch(createSession(user))
  store.dispatch(setLoggedUser(user))

  Support.identify(user)

  await getCartAndSaveInStore(store)

  const [productId] = Object.keys(cartBeforeLogin.products)
  const product = products[productId]
  const orderLine = cartBeforeLogin.products[productId]
  const sourceCode = orderLine.sources[0].replace('+', '')

  addProductToCartAndUpdate({ product, sourceCode }, store)
}

export function logout(store) {
  Session.remove()

  store.dispatch(removeSession())
  store.dispatch(removeLoggedUser())
  store.dispatch(clearCart())

  Storage.removeItem(STORAGE_KEYS.CART)

  Support.logout()
  Tracker.logout()
  Cache.clearAndReload()
}
