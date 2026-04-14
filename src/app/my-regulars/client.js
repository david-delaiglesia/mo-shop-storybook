import { serializeMyRegulars } from './serializer'

import { HttpWithErrorHandler } from 'services/http'

async function getMyRegulars(userUuid, warehouse) {
  const path = `/customers/${userUuid}/recommendations/myregulars/`
  const options = { params: { wh: warehouse } }

  return HttpWithErrorHandler.auth()
    .get(path, options)
    .then(serializeMyRegulars)
}

async function removeMyRegularProduct(userUuid, productId) {
  const path = `/customers/${userUuid}/recommendations/myregulars/products/${productId}/`

  return HttpWithErrorHandler.auth().delete(path)
}

const MyRegularsClient = {
  getMyRegulars,
  removeMyRegularProduct,
}

export { MyRegularsClient }
