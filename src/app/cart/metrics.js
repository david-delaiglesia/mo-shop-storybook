import { SORTING_METHOD_METRICS } from 'app/cart/constants'
import { Cart, CartService } from 'domain/cart'
import { Tracker } from 'services/tracker'

export const SOURCES = {
  CART: 'cart',
  PRODUCT_LIMITATIONS: 'product_limitations',
}

const EVENTS = {
  ADD_PRODUCT_TO_ONGOING_ORDER: 'add_product_to_order_click',
  CART_SORTING_METHOD_CLICK: 'cart_sorting_method_click',
  FOCUS_RECOVERY_CLICK: 'focus_recovery_click',
  CLEAN_CART_CONFIRMATION_CLICK: 'clean_cart_confirmation_click',
  START_CHECKOUT_CLICK: 'start_checkout_click',
  CART_OPTION_SAVE_CART_AS_LIST_CLICK: 'cart_option_save_cart_as_list_click',
  SAVE_NEW_SHOPPING_LIST_BUTTON_CLICK: 'save_new_shopping_list_button_click',
  CART_TO_LIST_TOOLTIP_VIEW: 'sl_cart_to_list_tooltip_view',
  CART_TO_LIST_TOOLTIP_CLOSE: 'sl_cart_to_list_tooltip_close',
}

function sendOpenCartMetrics(cart, products) {
  const cartWithoutUnpublishedProducts =
    CartService.filterCartProductsByPublished(cart, products)

  const properties = {
    cart_id: cart.id,
    item_count: Cart.getItemsQuantity(cartWithoutUnpublishedProducts),
    total_units: Cart.getTotalUnits(cartWithoutUnpublishedProducts),
    total_price: Cart.getTotal(cartWithoutUnpublishedProducts),
    unpublished_products: Cart.getUnpublishedQuantity(cart),
    ongoing_order: !!cart.openOrderId,
  }
  Tracker.sendViewChange(SOURCES.CART, properties)
}

function sendStartCheckoutClickMetrics(cart, products) {
  const properties = {
    cart_id: cart.id,
    price: Cart.getTotal(cart),
    products_count: Object.keys(cart.products).length,
    units_count: Cart.getTotalUnits(cart),
    water_liters: CartService.getWater(cart, products),
  }
  Tracker.sendInteraction(EVENTS.START_CHECKOUT_CLICK, properties)
}

function sendProductLimitationViewMetrics(properties) {
  Tracker.sendViewChange(SOURCES.PRODUCT_LIMITATIONS, properties)
}

function sendAddCartToOngoingOrderMetrics(cart, products) {
  const options = {
    cart_id: cart.id,
    price: Cart.getTotal(cart),
    products_count: Object.keys(cart.products).length,
    units_count: Cart.getTotalUnits(cart),
    water_liters: CartService.getWater(cart, products),
  }
  Tracker.sendInteraction(EVENTS.ADD_PRODUCT_TO_ONGOING_ORDER, options)
}

function sendCartSortingMethodClickMetrics(cart, method) {
  Tracker.sendInteraction(EVENTS.CART_SORTING_METHOD_CLICK, {
    cart_id: cart.id,
    method: SORTING_METHOD_METRICS[method],
  })
}

function sendFocusRecoveryClickMetrics() {
  Tracker.sendInteraction(EVENTS.FOCUS_RECOVERY_CLICK)
}

function sendCleanCartConfirmationClick(cart) {
  const options = {
    items_count: CartService.getItemsCount(cart),
    cart_id: cart.id,
  }
  Tracker.sendInteraction(EVENTS.CLEAN_CART_CONFIRMATION_CLICK, options)
}

function sendSaveCartAsListClick() {
  Tracker.sendInteraction(EVENTS.CART_OPTION_SAVE_CART_AS_LIST_CLICK)
}

function sendSaveNewShoppingListClick(listName) {
  Tracker.sendInteraction(EVENTS.SAVE_NEW_SHOPPING_LIST_BUTTON_CLICK, {
    source: 'cart',
    name: listName,
  })
}

function sendCartToListTooltipViewMetrics() {
  Tracker.sendInteraction(EVENTS.CART_TO_LIST_TOOLTIP_VIEW)
}

function sendCartToListTooltipCloseMetrics(source) {
  Tracker.sendInteraction(EVENTS.CART_TO_LIST_TOOLTIP_CLOSE, {
    source,
  })
}

export {
  sendOpenCartMetrics,
  sendStartCheckoutClickMetrics,
  sendProductLimitationViewMetrics,
  sendAddCartToOngoingOrderMetrics,
  sendCartSortingMethodClickMetrics,
  sendFocusRecoveryClickMetrics,
  sendCleanCartConfirmationClick,
  sendSaveCartAsListClick,
  sendSaveNewShoppingListClick,
  sendCartToListTooltipViewMetrics,
  sendCartToListTooltipCloseMetrics,
}
