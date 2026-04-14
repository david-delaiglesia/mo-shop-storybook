import { camelCaseToSnakeCase } from '@mercadona/mo.library.dashtil'

import { CART_MODE } from 'app/catalog/metrics'
import { Tracker } from 'services/tracker'
import { getEnglishShortWeekDay } from 'utils/dates'

const SOURCES = {
  MOBILE_BLOCKER: 'mobile_blocker',
  FORCE_UPDATE_ALERT: 'force_update_alert',
  UNAVAILABLE_DAY_PRODUCT_ALERT: 'unavailable_day_product_alert',
  EDIT_PURCHASE_UNAVAILABLE_DAY_PRODUCT_ALERT:
    'edit_purchase_unavailable_day_product_alert',
  UNAVAILABLE_PRODUCTS_MINIMUN_PRICE_ALERT:
    'unavailable_products_minimum_price_alert',
}

const EVENTS = {
  DOWNLOAD_APP_BUTTON_CLICK: 'download_app_button_click',
  FORCE_UPDATE_ALERT_CONFIRM_CLICK: 'force_update_alert_confirm_click',
  OLD_BROWSER_POPUP: 'old_browser_popup',
  OLD_BROWSER_POPUP_CHOICE_CLICK: 'old_browser_popup_choice_click',
  LOG_NETWORK_RECOVERED: 'log_network_recovered',
  LOST_CONNECTIVITY_EDITING_ORDER: 'lost_connectivity_editing_order',
  PICK_OTHER_DAY_UNAVAILABLE_DAY_PRODUCT_ALERT_CLICK:
    'pick_other_day_unavailable_day_product_alert_click',
  CONTINUE_UNAVAILABLE_DAY_PRODUCT_ALERT_CLICK:
    'continue_unavailable_day_product_alert_click',
  CONTINUE_MINIMUN_PRICE_ALERT_CLICK: 'continue_minimum_price_alert_click',
  EDIT_PURCHASE_CONTINUE_UNAVAILABLE_DAY_PRODUCT_ALERT:
    'edit_purchase_continue_unavailable_day_product_alert_click',
  UNSAVED_EDITION_MODAL_VIEW: 'unsaved_edition_modal_view',
  UNSAVED_EDITION_MODAL_CLICK: 'unsaved_edition_modal_click',
}

function sendMobileBlockerViewMetrics() {
  Tracker.sendViewChange(SOURCES.MOBILE_BLOCKER)
}

function sendDownloadAppButtonClickMetrics() {
  Tracker.sendInteraction(EVENTS.DOWNLOAD_APP_BUTTON_CLICK)
}

function sendForceUpdateAlertViewMetrics() {
  Tracker.sendViewChange(SOURCES.FORCE_UPDATE_ALERT)
}

function sendForceUpdateAlertConfirmClickMetrics() {
  Tracker.sendInteraction(EVENTS.FORCE_UPDATE_ALERT_CONFIRM_CLICK)
}

function sendOldBrowserPopupViewMetrics() {
  Tracker.waitForSession(() => Tracker.sendViewChange(EVENTS.OLD_BROWSER_POPUP))
}

function sendOldBrowserPopupClickMetrics(browser) {
  Tracker.sendInteraction(EVENTS.OLD_BROWSER_POPUP_CHOICE_CLICK, {
    option: browser,
  })
}

function sendLogNetworkRecoveredMetrics(disconnectionTime) {
  Tracker.sendInteraction(EVENTS.LOG_NETWORK_RECOVERED, {
    disconnection_time: disconnectionTime,
  })
}

function sendLostConnectivityEditingOrderMetrics() {
  Tracker.sendInteraction(EVENTS.LOST_CONNECTIVITY_EDITING_ORDER)
}

function sendUnavailableDayProductAlertViewMetrics(
  cartId,
  blinkingProductsIdsList,
  day,
  cartMode,
  purchaseId,
) {
  const weekday = getEnglishShortWeekDay(day).toLowerCase()
  Tracker.sendViewChange(SOURCES.UNAVAILABLE_DAY_PRODUCT_ALERT, {
    cart_id: cartId,
    merca: blinkingProductsIdsList,
    weekday,
    cart_mode: cartMode,
    purchase_id: purchaseId,
  })
}

function sendPickAnotherDayUnavailableDayProductAlert(
  cartId,
  blinkingProductsIdsList,
  day,
  cartMode,
  purchaseId,
) {
  const weekday = getEnglishShortWeekDay(day).toLowerCase()
  Tracker.sendInteraction(
    EVENTS.PICK_OTHER_DAY_UNAVAILABLE_DAY_PRODUCT_ALERT_CLICK,
    {
      cart_id: cartId,
      merca: blinkingProductsIdsList,
      weekday,
      cart_mode: cartMode,
      purchase_id: purchaseId,
    },
  )
}

function sendContinueUnavailableDayProductAlert(
  cartId,
  blinkingProductsIdsList,
  day,
  cartMode,
  purchaseId,
) {
  const weekday = getEnglishShortWeekDay(day).toLowerCase()
  Tracker.sendInteraction(EVENTS.CONTINUE_UNAVAILABLE_DAY_PRODUCT_ALERT_CLICK, {
    cart_id: cartId,
    merca: blinkingProductsIdsList,
    weekday,
    cart_mode: cartMode,
    purchase_id: purchaseId,
  })
}

function sendUnavailableProductsMinimunPriceAlertViewMetrics() {
  Tracker.sendViewChange(SOURCES.UNAVAILABLE_PRODUCTS_MINIMUN_PRICE_ALERT, {
    cart_mode: CART_MODE.PURCHASE,
  })
}

function sendContinueMinimunPriceAlert() {
  Tracker.sendInteraction(EVENTS.CONTINUE_MINIMUN_PRICE_ALERT_CLICK)
}

function sendEditPurchaseUnavailableDayProductAlertViewMetrics(
  orderId,
  blinkingProductId,
  weekday,
) {
  Tracker.sendViewChange(SOURCES.EDIT_PURCHASE_UNAVAILABLE_DAY_PRODUCT_ALERT, {
    purchase_id: orderId,
    merca: blinkingProductId,
    weekday,
  })
}

function sendEditPurchaseContinueUnavailableDayProductAlertClickMetrics(
  orderId,
  blinkingProductId,
  weekday,
) {
  Tracker.sendViewChange(
    EVENTS.EDIT_PURCHASE_CONTINUE_UNAVAILABLE_DAY_PRODUCT_ALERT,
    {
      purchase_id: orderId,
      merca: blinkingProductId,
      weekday,
    },
  )
}

function sendUnsavedEditionModalViewMetrics(orderId, isShowhedByTime) {
  Tracker.sendInteraction(EVENTS.UNSAVED_EDITION_MODAL_VIEW, {
    order_id: orderId,
    isShowhedByTime,
  })
}

function sendUnsavedEditionModalClickMetrics(orderId, option) {
  Tracker.sendInteraction(EVENTS.UNSAVED_EDITION_MODAL_CLICK, {
    order_id: orderId,
    option,
  })
}

export const SharedMetrics = {
  abTestExposure({ experimentId, variantId }) {
    Tracker.sendInteraction(
      'ab_test_exposure',
      camelCaseToSnakeCase({ experimentId, variantId }),
    )
  },
}

export {
  sendOldBrowserPopupClickMetrics,
  sendOldBrowserPopupViewMetrics,
  sendMobileBlockerViewMetrics,
  sendDownloadAppButtonClickMetrics,
  sendForceUpdateAlertViewMetrics,
  sendForceUpdateAlertConfirmClickMetrics,
  sendLogNetworkRecoveredMetrics,
  sendLostConnectivityEditingOrderMetrics,
  sendUnavailableDayProductAlertViewMetrics,
  sendPickAnotherDayUnavailableDayProductAlert,
  sendContinueUnavailableDayProductAlert,
  sendUnavailableProductsMinimunPriceAlertViewMetrics,
  sendContinueMinimunPriceAlert,
  sendEditPurchaseUnavailableDayProductAlertViewMetrics,
  sendEditPurchaseContinueUnavailableDayProductAlertClickMetrics,
  sendUnsavedEditionModalViewMetrics,
  sendUnsavedEditionModalClickMetrics,
}
