export const knownFeatureFlags = {
  // SHOP
  WEB_CUSTOM_EVENT_IMPLEMENTATION: 'web-custom-event-implementation',
  WEB_MO_ANALYTICS_DEVICE_ID: 'web-mo-analytics-device-id',
  WEB_MO_ANALYTICS_IMPRESSIONS_PAYLOAD: 'web-mo-analytics-impressions-payload',
  WEB_MO_ANALYTICS_CATEGORY_IMPRESSIONS:
    'web-mo-analytics-category-impressions',
  WEB_ADD_PRODUCT_CLICK_PAYLOAD: 'web-mo-analytics-add-product-click-payload',
  WEB_PRODUCT_DETAIL_VIEW_PAYLOAD:
    'web-mo-analytics-product-detail-view-payload',
  WEB_MO_ANALYTICS_PRICE_NUMBER_FORMAT: 'web-mo-analytics-price-number-format',
  WEB_MO_ANALYTICS_FLUSH_ERROR_MONITORING:
    'web-mo-analytics-flush-error-monitoring',
  WEB_XSELLING_ADD_PRODUCT_CLICK_PAGE: 'web-xselling-add-product-click-page',
  WEB_HIGHLIGHTED_GROUP: 'web-highlighted-group',
  WEB_VIDEO_SECTION: 'web_video_section',

  WEB_NEW_ARRIVAL_LABEL_REDESIGN: 'web-new-arrival-label-redesign',
  WEB_HIGHLIGHTED_GROUP_RESPONSIVE_IMAGES:
    'web-highlighted-group-responsive-images',
  WEB_CAROUSEL_HIDE_ALL_PRODUCTS_LINK: 'web-carousel-hide-all-products-link',
  WEB_CART_PRODUCT_THUMBNAIL_FALLBACK: 'web-cart-product-thumbnail-fallback',
  WEB_HOME_SECTION_WITHOUT_SUBTITLE: 'web-home-section-without-subtitle',
  SHOPPING_LISTS_TABS: 'web_shopping_lists_tabs',

  // AUTH
  LOGIN_MONITORING: 'web_login_monitoring',
  AKAMAI_STARTTS_MONITORING: 'web_akamai_startts_monitoring',

  // CHECKOUT
  RECAPTCHA_V2_FALLBACK: 'recaptcha_v2_fallback',

  BIZUM_REST_RESOLVE_PAYMENT_INCIDENT:
    'web_bizum_rest_resolve_payment_incident',
  UNIFY_PAYMENT_AUTHENTICATION_ERROR: 'web_unify_payment_authentication_error',
  CHECKOUT_NEW_CARD_ALWAYS_AUTO_CONFIRM:
    'web_checkout_new_card_always_autoconfirm',
  CHECKOUT_NEW_CONFIRM_STRATEGY: 'web_checkout_new_confirm_strategy',
  CHECKOUT_BIZUM_TOKEN_AUTHN_REST_STRATEGY:
    'web_checkout_bizum_token_authn_rest_strategy',
  CHECKOUT_ORDER_SIZE_LIMIT: 'web_checkout_order_size_limit',
  CHECKOUT_SLOT_NOT_AVAILABLE: 'web_checkout_slot_not_available',
  CHECKOUT_ADDRESS_NOT_IN_WAREHOUSE: 'web_checkout_address_not_in_warehouse',

  ADDRESS_POSTAL_CODE_CORRECTION: 'web_address_postal_code_correction',

  ORDER_EDIT_LINES_NEW_STRATEGY: 'web_order_edit_lines_new_strategy',

  // CALIDAD
  NEW_SUPPORT_CHAT: 'web_new_support_chat',
  WEB_NEW_SUPPORT_CHAT_TOGGLE_SOUND: 'web_new_support_chat_toggle_sound',
  WEB_NEW_SUPPORT_CHAT_MARKDOWN: 'web_new_support_chat_markdown',
} as const satisfies Record<string, string>

export const variants = {
  MAXIMUM_WATER_LITERS: 'maximum_water_liters',
} as const satisfies Record<string, string>

export const experiments: Partial<
  Record<ValueOf<typeof knownFeatureFlags>, ValueOf<typeof knownFeatureFlags>[]>
> = {}
