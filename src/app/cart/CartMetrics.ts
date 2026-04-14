import { Tracker } from 'services/tracker'

export const CartMetrics = {
  orderSizeLimitAlertView(areasExceeded: {
    ambient: boolean
    chilled: boolean
    frozen: boolean
  }) {
    Tracker.sendInteraction('order_size_limit_alert_view', {
      dry_exceeded: areasExceeded.ambient,
      chill_exceeded: areasExceeded.chilled,
      frozen_exceeded: areasExceeded.frozen,
    })
  },
}
