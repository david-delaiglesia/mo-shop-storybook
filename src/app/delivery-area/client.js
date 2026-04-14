import { serializeNextDeliveryDay, serializeSlots } from './serializer'

import {
  DeliveryAreaPubSub,
  Http,
  HttpWithErrorHandler,
  NetworkError,
} from 'services/http'
import { Session } from 'services/session'

async function update(postalCode) {
  const path = '/postal-codes/actions/change-pc/'
  const options = {
    shouldCatchErrors: false,
    body: JSON.stringify({ new_postal_code: postalCode }),
  }

  return HttpWithErrorHandler.put(path, options)
}

async function validate(postalCode) {
  const path = `/postal-codes/actions/retrieve-pc/${postalCode}/`
  const options = {
    shouldCatchErrors: false,
  }

  return HttpWithErrorHandler.auth().get(path, options)
}

function reloadPageMiddleware(response) {
  if (!response.headers) {
    return response
  }

  const warehouseInHeader = response.headers.get('x-customer-wh')
  const postalCodeInHeader = response.headers.get('x-customer-pc')
  const { warehouse } = Session.get()

  DeliveryAreaPubSub.publish({
    warehouse: warehouseInHeader,
    postalCode: postalCodeInHeader,
  })

  if (!!warehouseInHeader && warehouseInHeader !== warehouse) {
    window.location.reload()
  }

  return response
}

async function anonymousUpdate(postalCode) {
  const path = '/postal-codes/actions/change-pc/'
  const options = {
    shouldCatchErrors: false,
    body: JSON.stringify({ new_postal_code: postalCode }),
    middleware: reloadPageMiddleware,
  }

  return HttpWithErrorHandler.put(path, options)
}

async function notifyMe(email, postalCode) {
  const path = '/newsletters/'
  const options = {
    body: JSON.stringify({
      email,
      mailing_list: 'new_postal_code',
      params: { postal_code: postalCode },
    }),
  }

  return HttpWithErrorHandler.post(path, options)
}

async function getSlots(userId, addressId, slotSize) {
  const path = `/customers/${userId}/addresses/${addressId}/slots/`
  const options = {
    params: { size: slotSize },
  }

  return Http.auth()
    .get(path, options)
    .then(serializeSlots)
    .catch(NetworkError.publish)
}

async function getNextAvailableDay(postalCode) {
  const path = `/postal-codes/${postalCode}/next-available-delivery-day/`
  const options = {
    shouldCatchErrors: false,
  }

  return HttpWithErrorHandler.get(path, options).then(serializeNextDeliveryDay)
}

export const DeliveryAreaClient = {
  anonymousUpdate,
  validate,
  notifyMe,
  getSlots,
  update,
  getNextAvailableDay,
}
