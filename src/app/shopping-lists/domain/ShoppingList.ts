export interface ShoppingListResponse {
  id: string
  name: string
  products_quantity: number
  thumbnail_images: string[]
}

export interface ShoppingListsResponse {
  shopping_lists: ShoppingListResponse[]
}

export interface ShoppingList {
  id: string
  name: string
  productsQuantity: number
  thumbnailImages: string[]
}

export interface ShoppingLists {
  shoppingLists: ShoppingList[]
}

export interface ShoppingListWhatsNewResponse {
  showTooltip: boolean
}

export interface ProductShoppingListItemResponse extends ShoppingListResponse {
  in_list: boolean
}

export interface ProductShoppingListsResponse {
  shopping_lists: ProductShoppingListItemResponse[]
}
