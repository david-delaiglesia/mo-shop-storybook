import { ResponsesBuilder } from '__tests__/RequestsBuilder'

export class DeliveryAreaResponsesBuilder extends ResponsesBuilder {
  addPostalCodeValidationResponse(postalCode = '46010') {
    this._addRequest({
      path: `/postal-codes/actions/retrieve-pc/${postalCode}/`,
      status: 201,
    })

    return this
  }

  addPostalCodeValidationErrorResponse(postalCode = '46010') {
    this._addRequest({
      path: `/postal-codes/actions/retrieve-pc/${postalCode}/`,
      status: 404,
    })

    return this
  }
}
