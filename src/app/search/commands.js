import {
  filterBrandsSearch,
  filterCategoriesSearch,
  updateSearch,
} from './actions'
import { SearchClient } from './client'

import { debounce } from 'libs/debounce'
import { addArrayProduct } from 'pages/product/actions'

function buildProducts(prevProducts, hit) {
  const { ...product } = hit
  return { ...prevProducts, [product.id]: product }
}

function sortBrandsAsc(brands) {
  return brands.sort((brandA, brandB) => brandA.localeCompare(brandB))
}

function buildBrands(prevBrands, brand) {
  if (!brand) {
    return prevBrands
  }

  const unorderedBrands = [
    ...prevBrands.filter((prevBrand) => prevBrand !== brand),
    brand,
  ]
  const brands = sortBrandsAsc(unorderedBrands)

  return brands
}

function sortCategoriesAsc(categories) {
  return categories.sort((categoryA, categoryB) =>
    categoryA.name.localeCompare(categoryB.name),
  )
}

function buildCategoriesNode(prevCategories, level) {
  const hasSubcategories = level.categories
  if (!hasSubcategories) {
    return level
  }

  const currentCategory = prevCategories.find(
    (category) => category.id === level.id,
  )
  if (!currentCategory) {
    return level
  }

  return {
    ...currentCategory,
    categories: buildCategoriesTree(
      currentCategory.categories,
      level.categories,
    ),
  }
}

function buildCategoriesTree(prevCategories, categories) {
  if (!categories) {
    return prevCategories
  }
  if (!categories.length) {
    return prevCategories
  }

  const modifiedCategoryNodes = categories.map((level) =>
    buildCategoriesNode(prevCategories, level),
  )

  const notModifiedCategoryNodes = prevCategories.filter(
    (category) =>
      !modifiedCategoryNodes.find(
        (transformedCategory) => transformedCategory.id === category.id,
      ),
  )

  const unorderedCategoriesTree = [
    ...notModifiedCategoryNodes,
    ...modifiedCategoryNodes,
  ]
  const categoriesTree = sortCategoriesAsc(unorderedCategoriesTree)

  return categoriesTree
}

function resultsSerializer(results = []) {
  const defaultResults = {
    products: {},
    hits: [],
    brands: [],
    categories: [],
  }

  return results.reduce(
    (prev, hit) => ({
      products: buildProducts(prev.products, hit),
      hits: [...prev.hits, hit.id],
      brands: buildBrands(prev.brands, hit.brand),
      categories: buildCategoriesTree(prev.categories, hit.categories),
    }),
    defaultResults,
  )
}

function saveResults(query, queryID, results, store) {
  const { hits, brands, categories, products } = resultsSerializer(results)

  store.dispatch(updateSearch(query, queryID, hits, categories, brands))
  store.dispatch(addArrayProduct(products))
}

const debounceSaveSearch = debounce(saveSearch, 100)

async function saveSearch(options, store) {
  const search = await SearchClient.search(options)
  if (!search) return
  const { query, queryID, hits } = search

  if (options.query !== query) return

  saveResults(query, queryID, hits, store)
}

function filterCategoriesResults(results, store) {
  const { hits, brands, products } = resultsSerializer(results)

  store.dispatch(filterCategoriesSearch(hits, brands))
  store.dispatch(addArrayProduct(products))
}

function filterBrandsResults(results, store) {
  const { hits, categories, products } = resultsSerializer(results)

  store.dispatch(filterBrandsSearch(hits, categories))
  store.dispatch(addArrayProduct(products))
}

export async function filterCategories(options, store) {
  const search = await SearchClient.search(options)
  if (!search) return
  const { hits } = search

  filterCategoriesResults(hits, store)
}

export async function filterBrands(options, store) {
  const search = await SearchClient.search(options)
  if (!search) return
  const { hits } = search

  filterBrandsResults(hits, store)
}

export function search(options, store) {
  debounceSaveSearch(options, store)
}
