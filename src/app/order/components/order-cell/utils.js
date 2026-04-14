import { Tracker } from 'services/tracker'
import { eventTypes } from 'wrappers/metrics'

export const viewProducts = (orderId, history) => () => {
  Tracker.sendInteraction(eventTypes.MY_ORDERS_SEE_PRODUCTS_CLICK)
  history.push(`/user-area/orders/${orderId}?products`)
}
