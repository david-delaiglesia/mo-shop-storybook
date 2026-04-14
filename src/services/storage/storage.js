import { PREFIX, STORAGE_KEYS } from './constants'

import { createStorage } from '@mercadona/mo.library.web-services/storage'

const settings = {
  prefix: PREFIX,
  alwaysPersist: [
    STORAGE_KEYS.USER,
    STORAGE_KEYS.CART,
    STORAGE_KEYS.MY_REGULARS,
    STORAGE_KEYS.VERSION,
    STORAGE_KEYS.SCA_CONFIRM,
    STORAGE_KEYS.SCA_UPDATE_PAYMENT,
    STORAGE_KEYS.CHECKOUT_SCA_MODAL,
    STORAGE_KEYS.CART_TO_ONGOING_ORDER,
    STORAGE_KEYS.PERISHABLE_INFO,
    STORAGE_KEYS.FAILED_AUTH_PAYMENT_MODAL,
    STORAGE_KEYS.IS_MERGING_ONGOING_ORDER,
    STORAGE_KEYS.SHOPPING_LIST_DETAIL,
    STORAGE_KEYS.BIZUM_USED_DIALOG,
    STORAGE_KEYS.PSD2_AUTHENTICATION_UUID,
  ],
}

const Storage = createStorage(settings)

function setCheckoutSCAModalAsSeen() {
  Storage.setItem(STORAGE_KEYS.CHECKOUT_SCA_MODAL, { hasAlreadySeen: true })
}

function setFailedAuthPaymentModal(value = true) {
  Storage.setItem(STORAGE_KEYS.FAILED_AUTH_PAYMENT_MODAL, {
    hasAlreadySeen: value,
  })
}

function isFailedAuthPaymentModalSeen() {
  const { hasAlreadySeen } = Storage.getItem(
    STORAGE_KEYS.FAILED_AUTH_PAYMENT_MODAL,
  ) ?? { hasAlreadySeen: false }

  return hasAlreadySeen
}

function isCheckoutSCAModalSeen() {
  const { hasAlreadySeen } =
    Storage.getItem(STORAGE_KEYS.CHECKOUT_SCA_MODAL) || {}
  return Boolean(hasAlreadySeen)
}

const setShoppingListDetailOrderBy = (shoppingListId, orderBy) => {
  const storageValue = Storage.getItem(STORAGE_KEYS.SHOPPING_LIST_DETAIL)

  if (storageValue === undefined) {
    Storage.setItem(STORAGE_KEYS.SHOPPING_LIST_DETAIL, {
      listsOrders: { [shoppingListId]: orderBy },
    })

    return
  }

  storageValue.listsOrders[shoppingListId] = orderBy

  Storage.setItem(STORAGE_KEYS.SHOPPING_LIST_DETAIL, storageValue)
}

const getShoppingListDetailOrderBy = (shoppingListId) => {
  const storageValue = Storage.getItem(STORAGE_KEYS.SHOPPING_LIST_DETAIL)

  if (storageValue === undefined) return

  return storageValue.listsOrders[shoppingListId]
}

const deleteShoppingListOrderBy = (shoppingListId) => {
  const storageValue = Storage.getItem(STORAGE_KEYS.SHOPPING_LIST_DETAIL)

  if (storageValue === undefined) return

  delete storageValue.listsOrders[shoppingListId]

  Storage.setItem(STORAGE_KEYS.SHOPPING_LIST_DETAIL, storageValue)
}

const composedStorage = {
  ...Storage,
  setCheckoutSCAModalAsSeen,
  isCheckoutSCAModalSeen,
  setFailedAuthPaymentModal,
  isFailedAuthPaymentModalSeen,
  setShoppingListDetailOrderBy,
  getShoppingListDetailOrderBy,
  deleteShoppingListOrderBy,

  setPsd2AuthenticationUuid(uuid) {
    Storage.setItem(STORAGE_KEYS.PSD2_AUTHENTICATION_UUID, uuid)
  },
  getAndRemovePsd2AuthenticationUuid() {
    const uuid = Storage.getItem(STORAGE_KEYS.PSD2_AUTHENTICATION_UUID)
    Storage.removeItem(STORAGE_KEYS.PSD2_AUTHENTICATION_UUID)
    return uuid
  },
}

export { composedStorage as Storage }
