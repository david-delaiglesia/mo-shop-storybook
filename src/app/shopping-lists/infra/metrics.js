import { ShoppingListsMetrics as ShoppingListsMetricsDomain } from 'app/shopping-lists/domain/ShoppingListsMetrics'
import { Cart } from 'domain/cart'
import { Tracker } from 'services/tracker'

export const SHOPPING_LISTS_SOURCE = 'shopping_lists'

const createNewListButtonClick = (source) => {
  Tracker.sendInteraction('create_new_shopping_list_button_click', {
    source,
  })
}

const saveNewListButtonClick = (name, source) => {
  Tracker.sendInteraction('save_new_shopping_list_button_click', {
    source,
    name,
  })
}

const listsView = (listsCount) => {
  Tracker.sendInteraction('shopping_lists_view', {
    lists_count: listsCount,
  })
}

const listItemClick = (listId, name, productsQuantity, order, cart_mode) => {
  Tracker.sendInteraction('shopping_list_click', {
    list_id: listId,
    list_name: name,
    products_count: productsQuantity,
    order,
    cart_mode,
  })
}

const listDetailView = (listId, name, productsQuantity, cart_mode) => {
  Tracker.sendInteraction('shopping_list_detail_view', {
    list_id: listId,
    name,
    products_count: productsQuantity,
    cart_mode,
  })
}

const heartListIconClick = (productId) => {
  Tracker.sendInteraction('add_to_shopping_list_icon_click', {
    product_id: productId,
  })
}

const selectListToToggleProduct = (
  isInList,
  productId,
  listId,
  listName,
  productsQuantity,
) => {
  Tracker.sendInteraction('select_shopping_list_to_save_add_product', {
    is_in_list: isInList,
    product_id: productId,
    list_id: listId,
    list_name: listName,
    list_item_count: productsQuantity,
  })
}

const deleteFromListButtonClick = (productId, listId, listName, order) => {
  Tracker.sendInteraction('delete_from_shopping_list_button_click', {
    product_id: productId,
    list_id: listId,
    list_name: listName,
    order,
  })
}

const moreActionsShoppingListButtonClick = (
  listName,
  listId,
  productsCount,
) => {
  Tracker.sendInteraction('more_actions_shopping_list_button_click', {
    list_name: listName,
    list_id: listId,
    products_count: productsCount,
  })
}

const deleteShoppingListButtonClick = (listName, listId, productsCount) => {
  Tracker.sendInteraction('delete_shopping_list_button_click', {
    list_name: listName,
    list_id: listId,
    products_count: productsCount,
  })
}

const confirmDeleteShoppingListButtonClik = (
  listName,
  listId,
  productsCount,
) => {
  Tracker.sendInteraction('confirm_delete_shopping_list_button_click', {
    list_name: listName,
    list_id: listId,
    products_count: productsCount,
  })
}

const cancelDeleteShoppingListButtonClick = (
  listName,
  listId,
  productsCount,
) => {
  Tracker.sendInteraction('cancel_delete_shopping_list_button_click', {
    list_name: listName,
    list_id: listId,
    products_count: productsCount,
  })
}

const openSearchDialog = (listId, listName, productCount) => {
  Tracker.sendInteraction('shopping_list_add_products_button_click', {
    list_id: listId,
    list_name: listName,
    products_count: productCount,
  })
}

const addProductsSearchResults = (
  listId,
  listName,
  query,
  numberOfResults,
  mercas,
) => {
  Tracker.sendInteraction('shopping_lists_add_products_search_results', {
    query,
    number_of_results: numberOfResults,
    mercas,
    list_id: listId,
    list_name: listName,
  })
}

const clickOnProductFromSearch = (
  action,
  listId,
  listName,
  productCount,
  productId,
  productName,
) => {
  Tracker.sendInteraction('shopping_list_add_products_product_click', {
    list_id: listId,
    list_name: listName,
    products_count: productCount,
    product_id: productId,
    product_name: productName,
    action,
  })
}

const clickOnCancelEditRecommendedQuantity = (
  listId,
  listName,
  productId,
  productName,
  quantity,
) => {
  Tracker.sendInteraction('cancel_shopping_list_product_edit_quantity_click', {
    list_id: listId,
    list_name: listName,
    product_id: productId,
    display_name: productName,
    quantity: quantity,
  })
}

const clickOnEditRecommendedQuantityDisabled = (
  listId,
  listName,
  productId,
  productName,
  order,
) => {
  Tracker.sendInteraction(
    'shopping_list_product_edit_quantity_button_disabled_click',
    {
      list_id: listId,
      list_name: listName,
      product_id: productId,
      display_name: productName,
      order,
    },
  )
}

const clickOnEditRecommendedQuantity = (
  listId,
  listName,
  productId,
  productName,
  order,
) => {
  Tracker.sendInteraction('shopping_list_product_edit_quantity_click', {
    list_id: listId,
    list_name: listName,
    product_id: productId,
    display_name: productName,
    order,
  })
}

const clickOnMoreActionsButton = (
  listId,
  listName,
  productId,
  productName,
  order,
) => {
  Tracker.sendInteraction('shopping_list_product_options_click', {
    list_id: listId,
    list_name: listName,
    product_id: productId,
    display_name: productName,
    order,
  })
}

const clickOnSaveRecommendedQuantity = (
  listId,
  listName,
  productId,
  productName,
  previousQuantity,
  quantity,
) => {
  Tracker.sendInteraction('confirm_shopping_list_product_edit_quantity_click', {
    list_id: listId,
    list_name: listName,
    product_id: productId,
    display_name: productName,
    previous_quantity: previousQuantity,
    new_quantity: quantity,
  })
}

const clickOnIncreaseRecommendedQuantity = (
  listId,
  listName,
  productId,
  productName,
  previousQuantity,
  quantity,
) => {
  Tracker.sendInteraction('shopping_list_product_increment_quantity_click', {
    list_id: listId,
    list_name: listName,
    product_id: productId,
    display_name: productName,
    previous_quantity: previousQuantity,
    new_quantity: quantity,
  })
}

const clickOnAddListToCart = (products, listDetail, cart) => {
  const listUnits =
    ShoppingListsMetricsDomain.calculateUnitsFromProductList(products)
  const originalCartLines = ShoppingListsMetricsDomain.serializeCartProducts(
    cart?.products,
  ).length
  const originalCartUnits = Cart.getTotalUnits(cart)
  const unpublishedProductsQuantity = listDetail.items.filter(
    (item) => !item.product.published,
  ).length

  Tracker.sendInteraction('shopping_list_add_all_to_cart_click', {
    list_id: listDetail.id,
    list_name: listDetail.name,
    cart_id: cart?.id,
    cart_version: cart?.version || 0,
    current_cart_lines: originalCartLines,
    current_cart_units: originalCartUnits,
    list_lines: listDetail.items.length,
    list_units: listUnits,
    list_unpublished_products: unpublishedProductsQuantity,
  })
}

const addAllToCartCompleted = (originalCart, updatedCart, listDetail) => {
  const originalCartLines = ShoppingListsMetricsDomain.serializeCartProducts(
    originalCart?.products,
  ).length
  const originalCartUnits = Cart.getTotalUnits(originalCart)

  const updatedCartProducts = ShoppingListsMetricsDomain.serializeCartProducts(
    updatedCart?.products,
  )
  const updatedCartLines = updatedCartProducts.length
  const updatedCartUnits =
    ShoppingListsMetricsDomain.calculateUnitsFromCart(updatedCartProducts)

  const unpublishedProductsInCartQuantity = updatedCartProducts.filter(
    (product) => !product.published,
  ).length

  Tracker.sendInteraction('shopping_list_add_all_to_cart_completed', {
    list_id: listDetail.id,
    list_name: listDetail.name,
    original_cart_lines: originalCartLines,
    original_cart_units: originalCartUnits,
    new_cart_lines: updatedCartLines,
    new_cart_units: updatedCartUnits,
    new_cart_unpublished_lines: unpublishedProductsInCartQuantity,
    cart_id: updatedCart?.id,
    new_cart_version: updatedCart?.version || 0,
  })
}

const clickOnDecreaseRecommendedQuantity = (
  listId,
  listName,
  productId,
  productName,
  previousQuantity,
  quantity,
) => {
  Tracker.sendInteraction('shopping_list_product_decrease_quantity_click', {
    list_id: listId,
    list_name: listName,
    product_id: productId,
    display_name: productName,
    previous_quantity: previousQuantity,
    new_quantity: quantity,
  })
}

const suggestionsLoaded = (
  listId,
  listName,
  suggestions,
  productCount,
  source,
) => {
  Tracker.sendInteraction('sl_suggestions_loaded', {
    list_id: listId,
    list_name: listName,
    suggestions: suggestions.map((suggestion) => suggestion.id).join(','),
    list_products_count: productCount,
    source,
  })
}

const suggestionsViewed = (
  listId,
  listName,
  suggestions,
  productCount,
  source,
) => {
  Tracker.sendInteraction('sl_suggestions_view', {
    list_id: listId,
    list_name: listName,
    suggestions: suggestions.map((suggestion) => suggestion.id).join(','),
    list_products_count: productCount,
    source,
  })
}

const suggestionAdded = (
  listId,
  listName,
  productId,
  productName,
  suggestions,
  order,
  source,
  action,
) => {
  Tracker.sendInteraction('sl_suggestion_click', {
    list_id: listId,
    list_name: listName,
    product_id: productId,
    display_name: productName,
    order,
    suggestions: suggestions.map((suggestion) => suggestion.id).join(','),
    source,
    action,
  })
}

const suggestionsReloadClick = (listId, listName, suggestions) => {
  Tracker.sendInteraction('sl_suggestions_reload_click', {
    list_id: listId,
    list_name: listName,
    suggestions: suggestions.map((suggestion) => suggestion.id).join(','),
    source: 'text',
  })
}

const orderShoppingList = (method) => {
  Tracker.sendInteraction('sl_sorting_method_click', {
    method,
  })
}

const whatsNewViewed = () => {
  Tracker.sendInteraction('sl_whats_new_modal_view')
}

const whatsNewNavigateToShoppingLists = () => {
  Tracker.sendInteraction('sl_whats_new_modal_click', { option: 'go_to_lists' })
}

const whatsNewUnderstood = () => {
  Tracker.sendInteraction('sl_whats_new_modal_click', { option: 'understood' })
}

export const ShoppingListsMetrics = {
  listsView,
  listItemClick,
  listDetailView,
  openSearchDialog,
  heartListIconClick,
  saveNewListButtonClick,
  clickOnMoreActionsButton,
  clickOnProductFromSearch,
  createNewListButtonClick,
  deleteFromListButtonClick,
  selectListToToggleProduct,
  deleteShoppingListButtonClick,
  clickOnEditRecommendedQuantity,
  moreActionsShoppingListButtonClick,
  cancelDeleteShoppingListButtonClick,
  confirmDeleteShoppingListButtonClik,
  clickOnAddListToCart,
  clickOnCancelEditRecommendedQuantity,
  clickOnEditRecommendedQuantityDisabled,
  clickOnSaveRecommendedQuantity,
  addProductsSearchResults,
  addAllToCartCompleted,
  clickOnIncreaseRecommendedQuantity,
  clickOnDecreaseRecommendedQuantity,
  suggestionsLoaded,
  suggestionsViewed,
  suggestionAdded,
  suggestionsReloadClick,
  orderShoppingList,
  whatsNewViewed,
  whatsNewNavigateToShoppingLists,
  whatsNewUnderstood,
}
