import { camelCaseToSnakeCase } from '@mercadona/mo.library.dashtil'

import { Tracker } from 'services/tracker'

export const NotificationMetrics = {
  externalNotificationClick(payload: {
    orderId: number | string
    source: string
    type: string
  }) {
    Tracker.sendInteraction(
      'external_notification_click',
      camelCaseToSnakeCase(payload),
    )
  },
}
