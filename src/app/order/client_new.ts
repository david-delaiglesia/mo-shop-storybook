import { Order } from '.'

import { snakeCaseToCamelCase } from '@mercadona/mo.library.dashtil'

import { Cart } from 'app/cart'
import { deserializeCart } from 'app/cart'
import {
  AuthenticationConfig,
  AuthenticationConfigResponse,
} from 'app/payment/interfaces'
import { Http } from 'services/http'
import { isResponse } from 'utils/response'

export const OrderClientTS = {
  async updateLines(
    userUuid: string,
    orderId: Order['id'] | string,
    cart: Cart,
  ): Promise<AuthenticationConfig | null> {
    const path = `/customers/${userUuid}/orders/${orderId}/lines/`
    const response = await Http.auth().put<AuthenticationConfigResponse>(path, {
      body: JSON.stringify({ lines: deserializeCart(cart).lines }),
    })

    if (isResponse(response) && response.status === 202) {
      const data: AuthenticationConfigResponse = await response.json()
      return snakeCaseToCamelCase<AuthenticationConfig>(data)
    }

    return null
  },

  getConfirmationDetails(
    customerId: string,
    orderId: Order['id'] | string,
  ): Promise<{ showPaymentTimingModal: boolean }> {
    return Http.auth()
      .get<{ show_payment_timing_modal: boolean }>(
        `/customers/${customerId}/orders/${orderId}/confirmation/`,
      )
      .then(snakeCaseToCamelCase<{ showPaymentTimingModal: boolean }>)
  },
}
