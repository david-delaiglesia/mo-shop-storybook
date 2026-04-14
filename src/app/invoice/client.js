import { serializeInvoiceDocument } from './serializer'

import {
  camelCaseToSnakeCase,
  snakeCaseToCamelCase,
} from '@mercadona/mo.library.dashtil'

import { HttpWithErrorHandler } from 'services/http'

export const InvoiceClient = {
  /**
   * @param {{ customerId: string; personalId: string; isActive: boolean}} params
   * @returns {Promise<void>}
   */
  async automateInvoice({ customerId, personalId, isActive }) {
    const path = `/customers/${customerId}/bill-automation/`
    const options = {
      body: JSON.stringify(camelCaseToSnakeCase({ personalId, isActive })),
      shouldCatchErrors: false,
    }
    return HttpWithErrorHandler.auth().post(path, options)
  },

  /**
   * @param {string} customerId
   * @returns {Promise<{isActive: boolean; personalId: string; billingDataUrl: string; myBillsUrl: string}>}
   */
  async getInvoiceAutomation(customerId) {
    const path = `/customers/${customerId}/bill-automation/`
    return HttpWithErrorHandler.auth().get(path).then(snakeCaseToCamelCase)
  },

  /**
   * @param {{ customerId: string; orderId: string; documentNumber: string}} args
   * @returns {Promise<{showAutomateModal: boolean}>}
   */
  async invoiceRequest({ customerId, orderId, documentNumber }) {
    const path = `/customers/${customerId}/orders/${orderId}/bill/`
    const options = {
      body: JSON.stringify({ personal_id: documentNumber }),
      shouldCatchErrors: false,
    }

    const response = await HttpWithErrorHandler.auth().post(path, options)
    return { showAutomateModal: response.show_modal }
  },

  getInvoiceDocument({ customerId, orderId }) {
    const path = `/customers/${customerId}/orders/${orderId}/bill/`
    const options = {
      shouldCatchErrors: false,
    }
    return HttpWithErrorHandler.auth()
      .get(path, options)
      .then(serializeInvoiceDocument)
  },

  /**
   * @param {{ customerId: string; orderId: string; documentNumber: string}} args
   * @returns {Promise<void>}
   */
  async modifyInvoice({ customerId, orderId, documentNumber }) {
    const path = `/customers/${customerId}/orders/${orderId}/bill/`
    const options = {
      body: JSON.stringify({ personal_id: documentNumber }),
      shouldCatchErrors: false,
    }

    await HttpWithErrorHandler.auth().patch(path, options)
  },
}
