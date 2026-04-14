const PATHS = {
  AUTHENTICATE_USER: '/authenticate-user',
  CATEGORIES: '/categories',
  CATEGORY: '/categories/:id',
  CREATE_CHECKOUT: '/checkout',
  CHECKOUT: '/checkout/:id',
  EDIT_ORDER_PRODUCTS: '/orders/:id/edit/products',
  HELP: '/help',
  HOME: '/',
  MY_REGULARS: '/my-products',
  NOT_FOUND: '/not-found',
  PASSWORD_RECOVERY: '/password-recovery/:token',
  PRODUCT: '/product/:id',
  PRODUCT_SLUG: '/product/:id/:slug',
  PURCHASE_CONFIRMATION: '/purchases/:id/confirmation',
  SEARCH_RESULTS: '/search-results',
  SEASON: '/home/:source/:id?',
  SERVER_ERROR: '/server-error',
  SERVICE_RATING: '/service-rating/:token',
  USER_AREA: '/user-area',
  USER_AREA_ADDRESS: '/user-area/address',
  USER_AREA_ORDERS: '/user-area/orders',
  USER_AREA_ORDERS_ID: '/user-area/orders/:id',
  USER_AREA_PAYMENTS: '/user-area/payments',
  USER_AREA_PERSONAL_INFO: '/user-area/personal-info',
  USER_AREA_INVOICES: '/user-area/invoices',
  SHOPPING_LISTS: '/shopping-lists',
  SHOPPING_LISTS_DETAIL: '/shopping-lists/:listId',
  SHOPPING_LISTS_MY_REGULARS: '/shopping-lists/my-regulars',
} as const

const URL_PARAMS = {
  AUTHENTICATE_USER: 'authenticate-user',
  FOCUS_ON_DETAIL: 'focus-on-detail',
  FOCUS_ON_CATEGORY: 'focus-on-category',
  CAMPAIGN: 'campaign',
} as const

export { PATHS, URL_PARAMS }
