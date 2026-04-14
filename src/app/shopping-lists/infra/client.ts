import { serializeSuggestions } from './serializer'
import { serializeProductShoppingLists } from './serializer-typed'

import { snakeCaseToCamelCase } from '@mercadona/mo.library.dashtil'
import { HttpClientRequestOptions } from '@mercadona/mo.library.web-services/http'

import {
  ProductShoppingListsResponse,
  ShoppingListWhatsNewResponse,
  ShoppingLists,
  ShoppingListsResponse,
} from 'app/shopping-lists/domain/ShoppingList'
import { Http, HttpWithErrorHandler } from 'services/http'

const getAll = (customerId: string): Promise<ShoppingLists> => {
  return HttpWithErrorHandler.auth()
    .get<ShoppingListsResponse>(`/customers/${customerId}/shopping-lists/`)
    .then(snakeCaseToCamelCase<ShoppingLists>)
}

const createList = async (
  customerId: string,
  listName: string,
): Promise<string> => {
  const path = `/customers/${customerId}/shopping-lists/`
  const options = {
    body: JSON.stringify({ name: listName }),
    shouldCatchErrors: false,
  }

  return HttpWithErrorHandler.auth()
    .post<{ id: string }>(path, options)
    .then((response) => {
      return response.id
    })
}

const fetchProductShoppingLists = async (
  customerId: string,
  productId: string,
) => {
  const path = `/customers/${customerId}/shopping-lists/products/${productId}/shopping-lists-with-product-checks/`

  return HttpWithErrorHandler.auth()
    .get<ProductShoppingListsResponse>(path)
    .then((response) => {
      return serializeProductShoppingLists(response)
    })
}

const addProductToShoppingList = (
  customerId: string,
  productId: string,
  shoppingListId: string,
) => {
  const path = `/customers/${customerId}/shopping-lists/${shoppingListId}/products/`
  const options = {
    body: JSON.stringify({ merca_code: productId }),
    shouldCatchErrors: false,
  }

  return HttpWithErrorHandler.auth().post(path, options)
}

const fetchShoppingListDetail = (customerId: string, listId: string) => {
  const path = `/customers/${customerId}/shopping-lists/${listId}/`

  return HttpWithErrorHandler.auth()
    .get(path)
    .then((response) => {
      return response
    })
}

const deleteProductFromShoppingList = (
  customerId: string,
  listId: string,
  productId: string,
) => {
  const path = `/customers/${customerId}/shopping-lists/${listId}/products/${productId}/`

  return HttpWithErrorHandler.auth().delete(path)
}

const deleteShoppingList = (customerId: string, listId: string) => {
  const path = `/customers/${customerId}/shopping-lists/${listId}/`
  const options = {
    shouldCatchErrors: false,
  }

  return HttpWithErrorHandler.auth().delete(
    path,
    // TODO: use proper type
    options as HttpClientRequestOptions,
  )
}

const createShoppingListWithProduct = (
  customerId: string,
  listName: string,
  productId: string,
) => {
  const path = `/customers/${customerId}/shopping-lists/create-with-product/`
  const options = {
    shouldCatchErrors: false,
    body: JSON.stringify({ merca_code: productId, name: listName }),
  }

  return HttpWithErrorHandler.auth().post(path, options)
}

const saveRecommendedQuantity = (
  customerId: string,
  listId: string,
  productId: string,
  quantity: number,
) => {
  const path = `/customers/${customerId}/shopping-lists/${listId}/products/${productId}/quantity/`
  const options = {
    body: JSON.stringify({ quantity }),
  }

  return HttpWithErrorHandler.auth().put(path, options)
}

const fetchSuggestions = async (customerId: string, listId: string) => {
  const path = `/customers/${customerId}/shopping-lists/${listId}/suggested-products/`

  return Http.auth().get(path).then(serializeSuggestions)
}

const fetchSearchSuggestions = async (customerId: string, listId: string) => {
  const path = `/customers/${customerId}/shopping-lists/${listId}/search/product-suggestions/`

  return Http.auth().get(path).then(serializeSuggestions)
}

const refreshSuggestions = (customerId: string, listId: string) => {
  const path = `/customers/${customerId}/shopping-lists/${listId}/refresh-suggested-products/`

  return Http.auth().post(path)
}

const fetchDisplayWhatsNew = async (
  userId: string,
): Promise<ShoppingListWhatsNewResponse> => {
  const path = `/customers/${userId}/tooltips/shopping-lists-whats-new/`

  return HttpWithErrorHandler.auth()
    .get(path)
    .then(snakeCaseToCamelCase<ShoppingListWhatsNewResponse>)
}

export const ShoppingListsClient = {
  getAll,
  createList,
  fetchSuggestions,
  refreshSuggestions,
  deleteShoppingList,
  fetchShoppingListDetail,
  saveRecommendedQuantity,
  addProductToShoppingList,
  fetchProductShoppingLists,
  deleteProductFromShoppingList,
  createShoppingListWithProduct,
  fetchDisplayWhatsNew,
  fetchSearchSuggestions,
}
