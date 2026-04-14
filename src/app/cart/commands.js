import {
  addProductToCart,
  clearCart,
  decreaseProductFromCart,
  removeProductFromCart,
  replaceCart,
  substituteCartProducts,
} from './actions'
import { monitoring } from 'monitoring'

import { CartClient } from 'app/cart/client'
import { deserializeCart } from 'app/cart/serializer'
import { OrderClient } from 'app/order/client'
import { Cart, CartService } from 'domain/cart'
import { debouncePromise } from 'libs/debounce'
import { addArrayProduct } from 'pages/product/actions'
import { Storage } from 'services/storage'
import { STORAGE_KEYS } from 'services/storage/constants'
import { orderLineMapper } from 'utils/serializer'

const CartActionsTracker = () => {
  let count = []
  const STATUS = {
    WAITING: 'WAITING',
    UPDATING: 'UPDATING',
  }
  const add = () => {
    if (count.find(({ status }) => status === STATUS.WAITING)) return
    count.push({ status: STATUS.WAITING })
  }
  const update = () => {
    const match = count.find(({ status }) => status === STATUS.WAITING)
    if (!match) return
    match.status = STATUS.UPDATING
  }
  const remove = () => {
    count = count.filter(({ status }) => status !== STATUS.UPDATING)
  }
  const isWaiting = () => {
    return !count.find(({ status }) => status === STATUS.WAITING)
  }
  return {
    add,
    update,
    remove,
    isWaiting,
  }
}

const cartActionsTracker = CartActionsTracker()

export async function getCartAndSaveInStore(store) {
  const { session } = store.getState()

  if (!session.isAuth) {
    const storageCart = await getCartFromStorage()
    if (!storageCart) return

    saveCart(storageCart, store)
    return
  }

  const remoteCart = await CartClient.getCart(session.uuid)
  saveCart(remoteCart, store)
}

async function getCartFromStorage() {
  const storageCart = Storage.getItem(STORAGE_KEYS.CART)

  if (!storageCart?.lines || storageCart.lines.length === 0) return

  return validateCart(storageCart)
}

async function validateCart(cart) {
  try {
    return await CartClient.validate(cart)
  } catch (e) {
    if (!e.status) return

    Storage.removeItem(STORAGE_KEYS.CART)
  }
}

function updateStorageCart(cart) {
  const serializedCart = deserializeCart(cart)
  Storage.setItem(STORAGE_KEYS.CART, serializedCart)
}

export function saveCart(cart, store) {
  const { orderProducts, miniOrderProducts } = orderLineMapper(cart.products)
  store.dispatch(addArrayProduct(orderProducts))
  store.dispatch(replaceCart({ ...cart, products: miniOrderProducts }))
  updateStorageCart({ ...cart, products: miniOrderProducts })
}

const debounceUpdateCart = debouncePromise(getFromStoreAndUpdateCart, 500)

const debounceUpdateCartDraft = debouncePromise(handleUpdateCartDraft, 500)

export async function handleUpdateCartDraft(uuid, id, updatedCart, origin) {
  try {
    const updatedCartDraft = await OrderClient.updateCartDraft(
      uuid,
      id,
      updatedCart,
      origin,
    )
    return updatedCartDraft
  } catch {
    monitoring.sendMessage('Failed to update the cart draft')
  }
}

function filterParentObjectByProductVersion(data) {
  for (const key in data.products) {
    if (!data.products[key].version) {
      return data
    }
  }

  return null
}

export async function getFromStoreAndUpdateCartAfterOffline(store) {
  const {
    session,
    cart,
    ui: {
      productModal: { editingOrder },
    },
  } = store.getState()

  if (editingOrder) return

  updateStorageCart(cart)

  const cartToUpdate = filterParentObjectByProductVersion(cart)

  if (!session.isAuth) return
  if (!cartToUpdate) return

  cartActionsTracker.update()
  const updatedCart = await updateCart(session, cartToUpdate ?? cart)
  cartActionsTracker.remove()

  return updatedCart
}

export async function getFromStoreAndUpdateCart(store) {
  const {
    session,
    cart,
    ui: {
      productModal: { editingOrder },
    },
  } = store.getState()

  if (editingOrder) return

  updateStorageCart(cart)

  if (!session.isAuth) return

  cartActionsTracker.update()
  const updatedCart = await updateCart(session, cart)
  cartActionsTracker.remove()

  return updatedCart
}

export function updateCartFromEditOrder(store) {
  const { session, cart } = store.getState()

  updateStorageCart(cart)
  return updateCart(session, cart)
}

export async function updateCart(session, cart) {
  return CartClient.updateCart(session.uuid, cart)
}

export async function addProductToCartAndUpdate(
  { product, sourceCode, id },
  store,
) {
  const {
    cart: previousCart,
    session: { uuid },
    ui,
  } = store.getState()
  const { editingOrder } = ui.productModal

  cartActionsTracker.add()
  store.dispatch(addProductToCart({ product, sourceCode }))

  if (editingOrder && id) {
    const updatedCart = CartService.addProduct(previousCart, {
      product,
      sourceCode,
    })

    const origin = Cart.getOrigin(updatedCart)
    await debounceUpdateCartDraft(uuid, id, updatedCart, origin)
  }

  try {
    const cart = await debounceUpdateCart(store)
    const isCartUpdated = CartService.isUpdated(previousCart, cart)
    const isDifferentCart = previousCart.id !== cart?.id

    const listenCartUpdate =
      cartActionsTracker.isWaiting() && (isDifferentCart || isCartUpdated)

    if (listenCartUpdate) {
      saveCart(cart, store)
    }
  } catch {
    monitoring.sendMessage('Failed to update the cart')
  }
}

export async function decreaseProductFromCartAndUpdate(
  { product, sourceCode, id },
  store,
) {
  const {
    cart: previousCart,
    session: { uuid },
    ui,
  } = store.getState()
  const { editingOrder } = ui.productModal

  cartActionsTracker.add()
  store.dispatch(decreaseProductFromCart({ product, sourceCode }))

  if (editingOrder && id) {
    const updatedCart = CartService.decreaseProduct(previousCart, {
      product,
      sourceCode,
    })

    const origin = Cart.getOrigin(updatedCart)
    await debounceUpdateCartDraft(uuid, id, updatedCart, origin)
  }

  try {
    const cart = await debounceUpdateCart(store)

    const isCartUpdated = CartService.isUpdated(previousCart, cart)
    const isDifferentCart = previousCart.id !== cart?.id

    const listenCartUpdate =
      cartActionsTracker.isWaiting() && (isDifferentCart || isCartUpdated)
    if (listenCartUpdate) {
      saveCart(cart, store)
    }
  } catch {
    monitoring.sendMessage('Failed to update the cart')
  }
}

export function clearCartAndUpdate(store) {
  store.dispatch(clearCart())
  debounceUpdateCart(store)
}

export function clearCartAndUpdateFromEditOrder(store) {
  store.dispatch(clearCart())
  updateCartFromEditOrder(store)
}

export async function removeProductFromCartAndUpdate(product, store) {
  const { session } = store.getState()
  store.dispatch(removeProductFromCart(product))
  const cart = await debounceUpdateCart(store)

  if (!session.isAuth) return

  saveCart(cart, store)
}

export async function substituteProductFromCartAndUpdate(
  alternativeCart,
  product,
  store,
) {
  cartActionsTracker.add()
  store.dispatch(substituteCartProducts(alternativeCart, product))
  const cart = await debounceUpdateCart(store)

  saveCart(cart, store)
}
