import { serializePaymentMethods } from './serializer'

import { snakeCaseToCamelCase } from '@mercadona/mo.library.dashtil'

import { Http, HttpWithErrorHandler, NetworkError } from 'services/http'

function getIframe(ok, ko, userUuid) {
  const path = `/customers/${userUuid}/payment-cards/new/`

  const options = {
    params: {
      ok_url: ok,
      ko_url: ko,
    },
  }

  return HttpWithErrorHandler.auth()
    .get(path, options)
    .then(({ params, ...response }) => ({
      ...snakeCaseToCamelCase(response),
      params,
    }))
}

/**
 * @returns {Promise<import('./interfaces').PaymentAuthentication>}
 */
function getTokenAuthnIframe({
  okUrl,
  koUrl,
  userUuid,
  checkoutId,
  shouldAutoConfirm,
}) {
  const options = {
    body: JSON.stringify({
      ok_url: okUrl,
      ko_url: koUrl,
      checkout_auto_confirm: shouldAutoConfirm ? 'yes' : 'no',
    }),
  }
  const path = `/customers/${userUuid}/checkouts/${checkoutId}/payment-cards/new/`

  return HttpWithErrorHandler.auth()
    .post(path, options)
    .then(({ params, ...response }) => ({
      ...snakeCaseToCamelCase(response),
      params,
    }))
}

function remove(paymentId, userUuid) {
  const path = `/customers/${userUuid}/payment-cards/${paymentId}/`

  return HttpWithErrorHandler.auth().delete(path)
}

function getListByUserId(userUuid) {
  const path = `/customers/${userUuid}/payment-cards/`

  return Http.auth()
    .get(path)
    .then(serializePaymentMethods)
    .catch(NetworkError.publish)
}

export const PaymentClient = {
  getIframe,
  getTokenAuthnIframe,
  remove,
  getListByUserId,
}
