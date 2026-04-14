import { ResponsesBuilder } from '__tests__/RequestsBuilder'
import { ADDRESS_ACCURACY } from 'app/address'

export class AddressResponsesBuilder extends ResponsesBuilder {
  addEmptyResponse() {
    this._addRequest({
      path: '/customers/1/addresses/',
      responseBody: { results: [] },
    })

    return this
  }

  addGetResponse(addresses) {
    this._addRequest({
      path: '/customers/1/addresses/',
      responseBody: { results: addresses },
    })

    return this
  }

  addMultipleGetResponse(responses) {
    this._addRequest({
      path: '/customers/1/addresses/',
      multipleResponses: responses.map((response) => ({
        responseBody: { results: response },
      })),
    })

    return this
  }

  addCreationResponse(addressRequest, addressResponse) {
    this._addRequest({
      path: '/customers/1/address/',
      requestBody: JSON.parse(JSON.stringify(addressRequest)),
      responseBody: addressResponse,
      method: 'post',
    })

    return this
  }

  addCreationErrorResponse(exception, addressRequest) {
    this._addRequest({
      path: '/customers/1/address/',
      requestBody: addressRequest,
      method: 'post',
      status: 400,
      responseBody: {
        errors: [exception.toJSON()],
      },
    })

    return this
  }

  addValidationResponse({ latitude, longitude, postal_code }) {
    this._addRequest({
      path: `/customers/1/addresses/validate/?lang=en&wh=vlc1&${new URLSearchParams(
        { latitude, longitude, postal_code },
      )}`,
      method: 'get',
      status: 200,
      catchParams: true,
    })

    return this
  }

  addValidationErrorResponse(exception, { latitude, longitude, postal_code }) {
    this._addRequest({
      path: `/customers/1/addresses/validate/?lang=en&wh=vlc1&${new URLSearchParams(
        { latitude, longitude, postal_code },
      )}`,
      method: 'get',
      status: 400,
      catchParams: true,
      responseBody: {
        errors: [exception.toJSON()],
      },
    })

    return this
  }

  /**
   * Accuracy {ADDRESS_ACCURACY}
   */
  addAccuracyResponse(
    { flowId, street, number, postalCode, town },
    accuracy,
    suggestedPostalCode,
  ) {
    const flowByAccuracy = {
      [ADDRESS_ACCURACY.HIGH]: 'manual_form',
      [ADDRESS_ACCURACY.MEDIUM]: 'map_coordinates',
      [ADDRESS_ACCURACY.LOW]: 'map_cp',
    }

    const responseBody = {
      accuracy,
      flow: flowByAccuracy[accuracy],
      location: {
        latitude: 39.4780024,
        longitude: -0.4226101,
      },
      bounds: {
        northeast: {
          latitude: 39.4793513802915,
          longitude: -0.4212611197084979,
        },
        southwest: {
          latitude: 39.47665341970851,
          longitude: -0.423959080291502,
        },
      },
      suggested_postal_code: suggestedPostalCode ?? null,
    }

    this._addRequest({
      path: `/customers/1/addresses/accuracy/?lang=en&wh=vlc1&flow_id=${encodeURIComponent(
        flowId,
      )}&street=${encodeURIComponent(street)}&number=${encodeURIComponent(
        number,
      )}&postal_code=${encodeURIComponent(
        postalCode,
      )}&town=${encodeURIComponent(town)}`,
      method: 'get',
      catchParams: true,
      responseBody,
    })

    return this
  }

  addPostalCodeViewportResponse(postalCode) {
    this._addRequest({
      path: `/customers/1/addresses/viewport/?postal_code=${postalCode}/`,
      responseBody: {
        southwest: {
          lat: 39.4756457,
          lng: -0.3968569,
        },
        northeast: {
          lat: 39.4922619,
          lng: 39.4756457,
        },
      },
    })

    return this
  }

  addSuggestionAddress(
    suggestionId,
    { street, number, postal_code, town, longitude, latitude, comments },
  ) {
    this._addRequest({
      path: `/customers/1/addresses/suggestion/?lang=en&wh=vlc1&id=${suggestionId}`,
      responseBody: {
        street,
        number,
        postal_code,
        town,
        longitude,
        latitude,
        comments,
      },
      catchParams: true,
    })

    return this
  }

  addDeleteResponse(addressId) {
    this._addRequest({
      path: `/customers/1/addresses/${addressId}/`,
      status: 204,
      method: 'delete',
    })

    return this
  }

  addPostalCodeForward(
    { postalCode = '46010' },
    response = { town: 'València' },
  ) {
    this._addRequest({
      path: `/customers/1/addresses/forward/?lang=en&wh=vlc1&postal_code=${postalCode}`,
      status: 200,
      responseBody: response,
      catchParams: true,
    })

    return this
  }

  addPostalCodeForwardError({ postalCode = '46010' }) {
    this._addRequest({
      path: `/customers/1/addresses/forward/?lang=en&wh=vlc1&postal_code=${postalCode}`,
      status: 400,
      catchParams: true,
    })

    return this
  }

  addMapAddressReverse({ street, postalCode, town, number, userFlow }) {
    const coordinates = { latitude: 39.4756457, longitude: -0.3968569 }

    this._addRequest({
      path: `/customers/1/addresses/reverse/?${new URLSearchParams({
        lang: 'en',
        wh: 'vlc1',
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        user_flow: userFlow,
        flow_id: '10000000-1000-4000-8000-100000000000',
      })}`,
      status: 200,
      responseBody: {
        street,
        postal_code: postalCode,
        town,
        number,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
      },
      catchParams: true,
    })

    return this
  }

  addMapAddressReverseError(exception) {
    const coordinates = { latitude: 39.4756457, longitude: -0.3968569 }

    this._addRequest({
      path: `/customers/1/addresses/reverse/?lang=en&wh=vlc1&latitude=${coordinates.latitude}&longitude=${coordinates.longitude}`,
      status: 404,
      responseBody: {
        errors: [exception.toJSON()],
      },
    })

    return this
  }
}
