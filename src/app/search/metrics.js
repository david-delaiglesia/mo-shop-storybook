import { sendAlgoliaInsightsMetrics } from './metrics-utils'

import { Session } from 'services/session'
import { Tracker } from 'services/tracker'

const EVENTS = {
  FACETS_CATEGORY_CLICK: 'facets_category_click',
  FACETS_BRAND_CLICK: 'facets_brand_click',
}

const ALGOLIA_ID = import.meta.env.VITE_ALGOLIA_ID
const ALGOLIA_KEY = import.meta.env.VITE_ALGOLIA_KEY

const HEADERS = {
  'X-Algolia-API-KEY': ALGOLIA_KEY,
  'X-Algolia-Application-Id': ALGOLIA_ID,
}

function getStrictlyPositivePosition(hits, productId) {
  return hits.indexOf(productId) + 1
}

function sendAlgoliaClickMetrics(search, product, indexName) {
  const { uuid } = Session.get()

  const body = {
    events: [
      {
        eventName: 'click',
        eventType: 'click',
        index: indexName,
        userToken: uuid ?? 'anonymous',
        objectIDs: [product.id],
        queryID: search.queryID,
        positions: [getStrictlyPositivePosition(search.hits, product.id)],
      },
    ],
  }

  const fetchOptions = {
    method: 'POST',
    headers: new Headers(HEADERS),
    body: JSON.stringify(body),
  }

  sendAlgoliaInsightsMetrics(fetchOptions)
}

async function sendAlgoliaConversionMetrics(search, product, indexName) {
  const { uuid } = Session.get()

  const body = {
    events: [
      {
        eventName: 'conversion',
        eventType: 'conversion',
        index: indexName,
        userToken: uuid ?? 'anonymous',
        objectIDs: [product.id],
        queryID: search.queryID,
      },
    ],
  }

  const fetchOptions = {
    method: 'POST',
    headers: new Headers(HEADERS),
    body: JSON.stringify(body),
  }

  sendAlgoliaInsightsMetrics(fetchOptions)
}

async function sendAlgoliaConversionWithoutSearchMetrics(product, indexName) {
  const { uuid } = Session.get()

  const body = {
    events: [
      {
        eventName: 'conversion_without_search',
        eventType: 'conversion',
        index: indexName,
        userToken: uuid ?? 'anonymous',
        objectIDs: [product.id],
      },
    ],
  }

  const fetchOptions = {
    method: 'POST',
    headers: new Headers(HEADERS),
    body: JSON.stringify(body),
  }

  sendAlgoliaInsightsMetrics(fetchOptions)
}

function sendFacetsCategoryClickMetrics({ category, search }) {
  const { query, hits } = search
  const { level, name } = category

  const options = {
    level,
    name,
    text: query,
    count: hits.length,
  }

  Tracker.sendInteraction(EVENTS.FACETS_CATEGORY_CLICK, options)
}

function sendFacetsBrandClickMetrics({ brand, search }) {
  const { query, hits } = search

  const options = {
    name: brand,
    text: query,
    count: hits.length,
  }

  Tracker.sendInteraction(EVENTS.FACETS_BRAND_CLICK, options)
}

export {
  sendFacetsCategoryClickMetrics,
  sendFacetsBrandClickMetrics,
  sendAlgoliaClickMetrics,
  sendAlgoliaConversionMetrics,
  sendAlgoliaConversionWithoutSearchMetrics,
}
