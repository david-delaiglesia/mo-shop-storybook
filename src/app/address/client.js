import { ReverseGeocodingNotFoundException } from './exceptions'
import { serializeAddresses } from './serializer'

import {
  camelCaseToSnakeCase,
  snakeCaseToCamelCase,
} from '@mercadona/mo.library.dashtil'

import { ManagedException } from 'app/shared/exceptions'
import { HttpWithErrorHandler, NetworkError } from 'services/http'
import { encodeObjectValues } from 'utils/objects'

function makeDefault(userId, addressId) {
  const path = `/customers/${userId}/addresses/${addressId}/make_default/`

  return HttpWithErrorHandler.auth().patch(path)
}

async function getListByUserId(userId) {
  const path = `/customers/${userId}/addresses/`

  return HttpWithErrorHandler.auth().get(path).then(serializeAddresses)
}

async function remove(userId, addressId) {
  const path = `/customers/${userId}/addresses/${addressId}/`

  return HttpWithErrorHandler.auth().delete(path)
}

export const AddressClient = {
  makeDefault,
  getListByUserId,
  remove,

  /**
   * @param {string} customerId
   * @param {{
   *   flowId: string
   *   street: string
   *   number: string
   *   postalCode: string
   *   town: string
   *   detail?: string
   *   comments?: string
   *   longitude: number
   *   latitude: number
   * }} address
   * @returns {Promise<{
   *   id: number
   *   address: string
   *   addressDetail: string
   *   postalCode: string
   *   town: string
   *   permanentAddress: boolean
   *   longitude: number
   *   latitude: number
   *   comments: string
   * }>}
   * @throws {AddressOutOfDeliveryException | CoordinatesOutsideAllowedCountryException | PostalCodeWithoutServiceException}
   */
  save(customerId, address) {
    const path = `/customers/${customerId}/address/`
    const options = {
      body: JSON.stringify(camelCaseToSnakeCase(address)),
      shouldCatchErrors: false,
    }

    return HttpWithErrorHandler.auth()
      .post(path, options)
      .then(snakeCaseToCamelCase)
  },

  /**
   * @param {string} customerId
   * @param {{
   *   flowId: string
   *   street: string
   *   number: string
   *   postalCode: string
   *   town: string
   * }} address
   * @returns {Promise<{
   *   "accuracy": 'high' | 'medium' | 'low',
   *   "flow": string,
   *   "location": {
   *     "latitude": number,
   *     "longitude": number
   *   },
   *   "bounds": {
   *     "northeast": {
   *       "latitude": number,
   *       "longitude": number
   *     },
   *     "southwest": {
   *       "latitude": number,
   *       "longitude": number
   *     },
   *   },
   *   "suggestedPostalCode"?: string
   * }>}
   */
  getAccuracy(customerId, address) {
    const path = `/customers/${customerId}/addresses/accuracy/`

    return HttpWithErrorHandler.auth()
      .get(path, { params: camelCaseToSnakeCase(encodeObjectValues(address)) })
      .then(snakeCaseToCamelCase)
  },

  /**
   * @param {string} customerId
   * @param {string} suggestionId
   * @returns {Promise<{
   *   street: string | null
   *   number: string | null
   *   postalCode: string | null
   *   town: string | null
   *   longitude: number
   *   latitude: number
   *   comments: string | null
   * }>}
   */
  getSuggestion(customerId, suggestionId) {
    const path = `/customers/${customerId}/addresses/suggestion/`

    return HttpWithErrorHandler.auth()
      .get(path, { params: { id: suggestionId } })
      .then(snakeCaseToCamelCase)
  },

  /**
   * @param {{ postalCode: string }} address
   * @returns {Promise<null | {
   *   town: string
   * }>}
   */
  async getAddressForward(customerId, { postalCode }) {
    try {
      const result = await HttpWithErrorHandler.auth().get(
        `/customers/${customerId}/addresses/forward/`,
        {
          params: camelCaseToSnakeCase({ postalCode }),
          shouldCatchErrors: false,
        },
      )

      return snakeCaseToCamelCase(result)
    } catch {
      return null
    }
  },

  /**
   * @param {string} customerId
   * @param {{ latitude: number, longitude: number, userFlow: string, flowId: string }} params
   * @returns {Promise<null | {
   *   street: string
   *   postalCode: string
   *   town: string
   *   number: string
   *   latitude: number
   *   longitude: number
   * }>}
   */
  async getAddressReverse(customerId, params) {
    try {
      const result = await HttpWithErrorHandler.auth().get(
        `/customers/${customerId}/addresses/reverse/`,
        {
          params: camelCaseToSnakeCase(params),
          shouldCatchErrors: false,
        },
      )

      return snakeCaseToCamelCase(result)
    } catch (error) {
      if (ManagedException.isManagedError(error)) {
        const exception = await ManagedException.getException(error)

        if (ReverseGeocodingNotFoundException.isException(exception)) {
          return null
        }
      }

      NetworkError.publish(error)
      return null
    }
  },

  /**
   * @param {string} customerId
   * @param {{ latitude: number, longitude: number, postalCode: string }} address
   * @returns {Promise<void>}
   * @throws {AddressOutOfDeliveryException | CoordinatesOutsideAllowedCountryException | PostalCodeWithoutServiceException}
   * @deprecated Remove after remove flag ADDRESS_POSTAL_CODE_CORRECTION
   */
  async getAddressValidation(customerId, { latitude, longitude, postalCode }) {
    return HttpWithErrorHandler.auth().get(
      `/customers/${customerId}/addresses/validate/`,
      {
        params: camelCaseToSnakeCase({ latitude, longitude, postalCode }),
        shouldCatchErrors: false,
      },
    )
  },
}
