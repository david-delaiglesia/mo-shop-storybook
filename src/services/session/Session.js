import { monitoring } from 'monitoring'

import { DEFAULT_WAREHOUSE } from 'app/delivery-area/constants'
import { Cookie } from 'services/cookie'
import { Storage } from 'services/storage'
import { STORAGE_KEYS } from 'services/storage/constants'

const { VITE_DELIVERY_COOKIE, VITE_COOKIE_DOMAIN } = import.meta.env

function hasUser() {
  return !!Storage.getItem(STORAGE_KEYS.USER)
}

function get() {
  const { warehouse, postalCode } = getDeliveryAreaInfo()

  const isAuth = hasUser()
  const { userUuid: deprecatedUserUuid, uuid: storageUuid } =
    Storage.getItem(STORAGE_KEYS.USER) || {}
  const uuid = storageUuid || deprecatedUserUuid

  if (!storageUuid && deprecatedUserUuid) {
    const user = Storage.getItem(STORAGE_KEYS.USER) || {}
    Storage.setItem(STORAGE_KEYS.USER, { ...user, uuid: deprecatedUserUuid })
  }

  return { isAuth, uuid, warehouse, postalCode }
}

function setDeliveryAreaCookie(newCookie) {
  const currentCookie = Cookie.get(VITE_DELIVERY_COOKIE) || {}

  const updatedCookie = {
    ...currentCookie,
    ...newCookie,
  }

  Cookie.save(updatedCookie, VITE_DELIVERY_COOKIE, VITE_COOKIE_DOMAIN, {
    secure: true,
    samesite: 'none',
  })
}

function getDeliveryAreaInfo() {
  const cookie = Cookie.get(import.meta.env.VITE_DELIVERY_COOKIE) || {}

  const warehouse = cookie.warehouse || DEFAULT_WAREHOUSE
  const postalCode = cookie.postalCode

  return { warehouse, postalCode }
}

function saveUser(session) {
  monitoring.identify({
    id: session.uuid,
  })
  Storage.setItem(STORAGE_KEYS.USER, { ...session, userUuid: session.uuid })
}

function remove() {
  monitoring.anonymize()
  Storage.removeItem(STORAGE_KEYS.USER)
}

function getToken() {
  const localUser = Storage.getItem(STORAGE_KEYS.USER)

  if (!localUser) {
    return
  }

  return localUser.token
}

function saveWarehouse(warehouse) {
  if (!warehouse) {
    return
  }

  const cookie = { warehouse: String(warehouse) }
  setDeliveryAreaCookie(cookie)
}

function savePostalCode(postalCode) {
  if (!postalCode) {
    return
  }

  const cookie = { postalCode: String(postalCode) }
  setDeliveryAreaCookie(cookie)
}

export const Session = {
  get,
  remove,
  getToken,
  saveUser,
  saveWarehouse,
  savePostalCode,
  hasUser,
}
