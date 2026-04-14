import { Order } from '.'
import { getStatus } from './metrics'

import { camelCaseToSnakeCase } from '@mercadona/mo.library.dashtil'

import { Tracker } from 'services/tracker'

export const OrderMetrics = {
  solvePaymentIssueClick(payload: {
    orderId: number
    status: 'reprepared-payment-issue' | 'payment-issue'
  }) {
    Tracker.sendInteraction(
      'solve_payment_issue_click',
      camelCaseToSnakeCase(payload),
    )
  },

  solvePaymentIssueView(payload: {
    orderId?: number
    paymentMethodIds?: number[]
    errorType?: string
    errorDescriptionDisplayed?: string
  }) {
    Tracker.sendInteraction(
      'solve_payment_issue_view',
      camelCaseToSnakeCase(payload),
    )
  },

  orderConfirmationView(payload: {
    orderId: Order['id']
    price: Order['summary']['total']
  }) {
    Tracker.sendInteraction(
      'order_confirmation_view',
      camelCaseToSnakeCase(payload),
    )
  },

  orderConfirmationOkClick(payload: { orderId: Order['id'] }) {
    Tracker.sendInteraction(
      'order_confirmation_ok_click',
      camelCaseToSnakeCase(payload),
    )
  },

  orderPaymentTimelineModalView() {
    Tracker.sendInteraction('order_payment_timeline_modal_view')
  },

  orderPaymentTimelineModalClick() {
    Tracker.sendInteraction('order_payment_timeline_modal_click')
  },

  addressNotChangedError(payload: {
    orderId: number
    currentAddressId: number
    newAddressId: number
  }) {
    Tracker.sendInteraction(
      'address_not_changed_error',
      camelCaseToSnakeCase(payload),
    )
  },

  purchaseView(payload: { order: Order }) {
    const status = getStatus(payload.order)

    Tracker.sendInteraction(
      'purchase_view',
      camelCaseToSnakeCase({ purchaseId: payload.order.id, status }),
    )
  },
}
