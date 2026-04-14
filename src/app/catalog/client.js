import {
  camelCaseToSnakeCase,
  snakeCaseToCamelCase,
} from '@mercadona/mo.library.dashtil'

import {
  serializeHomeSection,
  serializeHomeSections,
  serializeProductDetail,
  serializeProductSimilar,
} from 'app/catalog/serializer'
import { HttpWithErrorHandler } from 'services/http'
import { Storage } from 'services/storage'

async function getRecommendations() {
  const path = '/recommendations/home/'

  return HttpWithErrorHandler.auth().get(path)
}

async function getSeasons() {
  const path = '/seasons/'

  const cachedSeason = Storage.getItem(path)
  if (cachedSeason && cachedSeason.results.length > 0) {
    return Promise.resolve(cachedSeason)
  }

  return HttpWithErrorHandler.get(path).then((response) => {
    Storage.setItem(path, response)
    return response
  })
}

async function getSectionDetail({ id, source }) {
  const path = id ? `/home/${source}/${id}/` : `/home/${source}/`

  const cachedSeasonDetail = Storage.getItem(path)
  if (cachedSeasonDetail) {
    return Promise.resolve(serializeHomeSection(cachedSeasonDetail))
  }

  return HttpWithErrorHandler.get(path).then((response) => {
    Storage.setItem(path, response)
    return serializeHomeSection(response)
  })
}

/**
 * @param {{ apiPath: string }} params
 * @returns {Promise<{
 *  "title": string
 *  "type": "info" | "warning"
 *  "eventKey": string
 * }>}
 */
async function getSectionAuthDynamicDetails({ apiPath }) {
  return HttpWithErrorHandler.auth()
    .get(apiPath, {
      shouldCatchErrors: false,
    })
    .then(snakeCaseToCamelCase)
}

/**
 * @param {{ apiPath: string, postalCode: string }} params
 * @returns {Promise<{
 *  "title": string
 *  "type": "info" | "warning"
 *  "eventKey": string
 * }>}
 */
async function getSectionDynamicDetails({ apiPath, postalCode }) {
  const params = camelCaseToSnakeCase({ postalCode })

  return HttpWithErrorHandler.get(apiPath, {
    shouldCatchErrors: false,
    params,
  }).then(snakeCaseToCamelCase)
}

async function getAuthSectionDetail({ id, source, uuid, queryParams }) {
  const options = {
    shouldCatchErrors: false,
  }
  const referencePath = id
    ? `/customers/${uuid}/home/${source}/${id}/${queryParams}`
    : `/customers/${uuid}/home/${source}/${queryParams}`

  const path = id
    ? `/customers/${uuid}/home/${source}/${id}/`
    : `/customers/${uuid}/home/${source}/`

  const cachedSeasonDetail = Storage.getItem(referencePath)
  if (cachedSeasonDetail) {
    return Promise.resolve(serializeHomeSection(cachedSeasonDetail))
  }
  return HttpWithErrorHandler.auth()
    .get(path, options)
    .then((response) => {
      Storage.setItem(referencePath, response)
      return serializeHomeSection(response)
    })
}

async function getCategories(warehouse) {
  const path = '/categories/'
  const options = { params: { wh: warehouse } }

  const cachedCategories = Storage.getItem(path)
  if (cachedCategories) {
    return Promise.resolve(cachedCategories)
  }

  return HttpWithErrorHandler.get(path, options).then((response) => {
    Storage.setItem(path, response)
    return response
  })
}

async function getCategoryDetail(id, warehouse) {
  const path = `/categories/${id}/`
  const options = { params: { wh: warehouse } }

  const cachedCategory = Storage.getItem(path)
  if (cachedCategory) {
    return Promise.resolve(cachedCategory)
  }

  return HttpWithErrorHandler.get(path, options).then((response) => {
    Storage.setItem(path, response)
    return response
  })
}

async function getProductDetail(id, warehouse) {
  const options = {
    shouldCatchErrors: false,
    params: { wh: warehouse },
  }
  return HttpWithErrorHandler.get(`/products/${id}/`, options).then(
    serializeProductDetail,
  )
}

async function getCategoryDetailWithUpdatedWarehouse(
  id,
  warehouse,
  shouldHideTemporarilyUnavailableProducs,
  isAuth,
) {
  const path = `/categories/${id}/`
  const options = {
    params: {
      wh: warehouse,
      ...(shouldHideTemporarilyUnavailableProducs && {
        display_temporarily_unavailable: false,
      }),
    },
  }
  if (isAuth) {
    return HttpWithErrorHandler.auth()
      .get(path, options)
      .then((response) => {
        Storage.setItem(path, response)
        return response
      })
  }
  return HttpWithErrorHandler.get(path, options).then((response) => {
    Storage.setItem(path, response)
    return response
  })
}

async function getProductXSelling(id, warehouse, exclude = '') {
  const options = {
    shouldCatchErrors: false,
    params: { exclude, wh: warehouse },
  }

  return HttpWithErrorHandler.get(`/products/${id}/xselling/`, options)
}

async function getProductSimilar(id, warehouse, exclude = '') {
  const options = {
    params: { wh: warehouse, exclude },
  }
  return HttpWithErrorHandler.get(`/products/${id}/similars/`, options).then(
    serializeProductSimilar,
  )
}

async function getHomeSections(postalCode, isHighlightedGroupEnabled) {
  const params = {
    ...(postalCode && { postal_code: postalCode }),
  }
  return HttpWithErrorHandler.get('/home/', { params }).then((response) =>
    serializeHomeSections(response, isHighlightedGroupEnabled),
  )
}

async function getAuthHomeSections(userId, isHighlightedGroupEnabled) {
  const path = `/customers/${userId}/home/`
  return HttpWithErrorHandler.auth()
    .get(path)
    .then((response) =>
      serializeHomeSections(response, isHighlightedGroupEnabled),
    )
}

const CatalogClient = {
  getHomeSections,
  getAuthHomeSections,
  getSeasons,
  getSectionDetail,
  getAuthSectionDetail,
  getSectionDynamicDetails,
  getSectionAuthDynamicDetails,
  getCategories,
  getCategoryDetail,
  getCategoryDetailWithUpdatedWarehouse,
  getProductDetail,
  getProductXSelling,
  getProductSimilar,
  getRecommendations,
}

export { CatalogClient }
