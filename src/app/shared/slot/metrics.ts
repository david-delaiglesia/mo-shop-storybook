import { camelCaseToSnakeCase } from '@mercadona/mo.library.dashtil'

import { Checkout } from 'app/checkout'
import { Order } from 'app/order'
import { Tracker } from 'services/tracker'

export const SlotMetrics = {
  slotNotAvailableView(
    payload:
      | {
          userFlow: 'edit_order'
          orderId: Order['id']
        }
      | {
          userFlow: 'checkout'
          checkoutId: Checkout['id']
        },
  ) {
    Tracker.sendInteraction(
      'slot_not_available_view',
      camelCaseToSnakeCase(payload),
    )
  },
}
