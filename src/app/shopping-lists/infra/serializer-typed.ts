import {
  ProductShoppingListItemResponse,
  ProductShoppingListsResponse,
} from 'app/shopping-lists/domain/ShoppingList'

export const serializeProductShoppingLists = (
  response: ProductShoppingListsResponse,
) => {
  const serializedLists = response.shopping_lists.map(
    ({
      id,
      name,
      products_quantity,
      in_list,
      thumbnail_images,
    }: ProductShoppingListItemResponse) => {
      return {
        id,
        name,
        productsQuantity: products_quantity,
        inList: in_list,
        thumbnailImages: thumbnail_images,
      }
    },
  )

  return { shoppingLists: serializedLists }
}
