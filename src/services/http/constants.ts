export const HTTP_STATUS = {
  OK: 200,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  NOT_ACEPTABLE: 406,
  TIMEOUT: 408,
  CONFLICT: 409,
  GONE: 410,
  PRECONDITION_FAILED: 412,
  RANGE_NOT_SATISFIABLE: 416,
  AUTHENTICATION_REQUIRED: 418,
  MIT: 419,
  TOO_MANY_REQUESTS: 429,
  FORCE_UPDATE: 452,
  SERVER_ERROR: 500,
} as const

export const CUSTOM_ERRORS = {
  WAREHOUSE_CHANGED_NEW: 'warehouse-changed-new',
  LOCATION_PERMISSION_DENIED: 'location-permission-denied',
  LOCATION_UNHANDLED_ERROR: 'location-unhandled-error',
} as const

export const HttpXHeaders = {
  X_VERSION: 'x-version',
  X_CUSTOMER_DEVICE_ID: 'x-customer-device-id',
  X_EXPERIMENT_VARIANTS: 'x-experiment-variants',
} as const
