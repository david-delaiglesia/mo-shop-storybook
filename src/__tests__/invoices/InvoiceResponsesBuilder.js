import { ResponsesBuilder } from '__tests__/RequestsBuilder'
import { KNOWN_ERRORS } from 'app/order/containers/order-detail-container/constants'

export class InvoiceResponsesBuilder extends ResponsesBuilder {
  addGetResponse(personalId = '') {
    this._addRequest({
      path: '/customers/1/bill-automation/',
      responseBody: {
        is_active: !!personalId,
        personal_id: personalId,
        billing_data_url: 'https://portal-facturas.com?billing_data_url',
        my_bills_url: 'https://portal-facturas.com?my_bills_url',
      },
    })

    return this
  }

  addMultipleGetResponses(personalIds = []) {
    this._addRequest({
      path: '/customers/1/bill-automation/',
      multipleResponses: personalIds.map((personalId) => ({
        responseBody: {
          is_active: !!personalId,
          personal_id: personalId,
          billing_data_url: 'https://portal-facturas.com?billing_data_url',
          my_bills_url: 'https://portal-facturas.com?my_bills_url',
        },
      })),
    })

    return this
  }

  addUpdateErrorResponse(
    personalId,
    code = KNOWN_ERRORS.PERSONAL_ID_NOT_REGISTERED,
  ) {
    this._addRequest({
      method: 'POST',
      path: '/customers/1/bill-automation/',
      requestBody: { personal_id: personalId, is_active: true },
      status: 404,
      responseBody: {
        code,
      },
    })

    return this
  }
}
