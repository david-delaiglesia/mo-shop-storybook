import { algoliasearch } from 'algoliasearch'

import { I18nClient } from 'app/i18n/client'
import {
  sendAlgoliaClickMetrics,
  sendAlgoliaConversionMetrics,
  sendAlgoliaConversionWithoutSearchMetrics,
} from 'app/search/metrics'
import { Session } from 'services/session'
import { constants } from 'utils/constants'
import { LANGUAGES } from 'utils/languages'

const ALGOLIA_ID = import.meta.env.VITE_ALGOLIA_ID
const ALGOLIA_KEY = import.meta.env.VITE_ALGOLIA_KEY
const ALGOLIA_NAME = import.meta.env.VITE_ALGOLIA_NAME
const { EN, ES, CA } = LANGUAGES
const validIndexLanguages = [EN, ES, CA]

const client = algoliasearch(ALGOLIA_ID, ALGOLIA_KEY)

const search = (options) => {
  const { query, brands, category, warehouse, analytics = true } = options
  const facetFilters = buildQueryFacets(category)
  const filters = buildQueryFilters(brands)
  const indexName = getIndexName(warehouse)
  const analyticsTags = buildAnalyticsTags()
  const { uuid } = Session.get()

  const config = {
    query,
    clickAnalytics: true,
    facetFilters,
    filters,
    analyticsTags,
    userToken: uuid,
    getRankingInfo: true,
    analytics,
  }

  return getResults(indexName, config)
}

const getResults = async (indexName, config) => {
  try {
    const { query, ...params } = config
    const content = await client.searchSingleIndex({
      indexName,
      searchParams: { query, ...params },
    })
    const { hits, queryID } = content
    return { query, hits, queryID }
  } catch {
    return null
  }
}

function getIndexLanguage(currentLanguage) {
  const isCurrentLanguageValid = validIndexLanguages.includes(currentLanguage)

  if (!isCurrentLanguageValid) {
    return constants.DEFAULT_LANGUAGE
  }

  return currentLanguage
}

function getIndexName(warehouse) {
  const currentLanguage = I18nClient.getCurrentLanguage()
  const indexLanguage = getIndexLanguage(currentLanguage)
  const localizedIndex = `${ALGOLIA_NAME}_${warehouse}_${indexLanguage}`

  return localizedIndex
}

function buildQueryFilters(brands = []) {
  if (!brands.length) return

  let query = `brand: "${brands[0]}"`
  for (const brand of brands) {
    query += ` OR brand: "${brand}"`
  }

  return query
}

function buildQueryFacets(category = {}) {
  if (!category.id) return

  const facetsKey = 'categories.'.repeat(category.level + 1) + 'id'
  return [`${facetsKey}:${category.id}`]
}

function buildAnalyticsTags() {
  return ['web']
}

function sendClickMetrics(search, product, warehouse) {
  const indexName = getIndexName(warehouse)

  sendAlgoliaClickMetrics(search, product, indexName)
}

function sendConversionMetrics(search, product, warehouse) {
  const indexName = getIndexName(warehouse)

  sendAlgoliaConversionMetrics(search, product, indexName)
}

function sendConversionWithoutSearchMetrics(product, warehouse) {
  const indexName = getIndexName(warehouse)

  sendAlgoliaConversionWithoutSearchMetrics(product, indexName)
}

export const SearchClient = {
  search,
  sendClickMetrics,
  sendConversionMetrics,
  sendConversionWithoutSearchMetrics,
}
