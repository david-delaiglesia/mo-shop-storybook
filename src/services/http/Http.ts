import { NetworkError } from './NetworkError'
import { CUSTOM_ERRORS, HttpXHeaders } from './constants'

import { compose } from '@mercadona/mo.library.dashtil'
import {
  type HttpClientRequestOptions,
  type HttpClientSettings,
  createHttpClient,
  withAuth,
  withErrorHandler,
  withMiddleware,
  withQueryString,
} from '@mercadona/mo.library.web-services/http'

import { I18nClient } from 'app/i18n/client'
import { getActiveExperiments } from 'services/feature-flags'
import { DeliveryAreaPubSub } from 'services/http'
import { Session } from 'services/session'
import { Tracker } from 'services/tracker'

const API_HOST = import.meta.env.VITE_API_HOST
const APP_VERSION = import.meta.env.VITE_APP_VERSION

const getExperimentVariants = (): string => {
  return Object.entries(getActiveExperiments())
    .map(([key, value]) => `${key}=${value}`)
    .join(';')
}

const settings: HttpClientSettings = {
  getHeaders: function () {
    const deviceId = Tracker.getDeviceId()
    return {
      'content-type': 'application/json',
      [HttpXHeaders.X_VERSION]: APP_VERSION,
      [HttpXHeaders.X_EXPERIMENT_VARIANTS]: getExperimentVariants(),
      ...(deviceId && { [HttpXHeaders.X_CUSTOMER_DEVICE_ID]: deviceId }),
    } satisfies Record<string, string>
  },
  API_HOST,
}

function hasChangedWarehouse(response: Response) {
  if (!response.headers) {
    return response
  }

  const warehouseInHeader = response.headers.get('x-customer-wh')
  const postalCodeInHeader = response.headers.get('x-customer-pc')
  const { warehouse } = Session.get()

  if (!!warehouseInHeader && warehouseInHeader !== warehouse) {
    NetworkError.publish({ status: CUSTOM_ERRORS.WAREHOUSE_CHANGED_NEW })
  }

  DeliveryAreaPubSub.publish({
    warehouse: warehouseInHeader,
    postalCode: postalCodeInHeader,
  })

  return response
}

function getParams(
  options: HttpClientRequestOptions & { params?: Record<string, string> },
) {
  const { warehouse } = Session.get()
  const paramsWithLanguage: Record<string, string> = {
    lang: I18nClient.getCurrentLanguage(),
    wh: warehouse,
    ...options.params,
  }
  const keys = Object.keys(paramsWithLanguage)
  const queryString = keys
    .map((key) => `${key}=${paramsWithLanguage[key]}`)
    .join('&')

  return '?' + queryString
}

function getHeadersWithCredentials(options: HttpClientRequestOptions) {
  const headers = {
    authorization: `Bearer ${Session.getToken()}`,
  }

  if (!options) {
    return { headers }
  }

  return {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  }
}

const HttpWithErrorHandler = compose(
  withAuth(getHeadersWithCredentials),
  withMiddleware(hasChangedWarehouse),
  withQueryString(getParams),
  withErrorHandler(NetworkError.publish),
)(createHttpClient(settings))

const Http = compose(
  withAuth(getHeadersWithCredentials),
  withMiddleware(hasChangedWarehouse),
  withQueryString(getParams),
)(createHttpClient(settings))

export { HttpWithErrorHandler, Http }
