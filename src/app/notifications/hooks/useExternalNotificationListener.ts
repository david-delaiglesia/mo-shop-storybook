import { useEffect } from 'react'

import { NotificationMetrics } from '../metrics'

import { useSearchParams } from 'hooks/useSearchParams'

const EXTERNAL_NOTIFICATION_SOURCE_PARAM = 'external_notification_source'
const EXTERNAL_NOTIFICATION_TYPE_PARAM = 'external_notification_type'

export const useExternalNotificationListener = ({
  orderId,
}: {
  orderId: string
}) => {
  const { searchParams, clearSearchParams } = useSearchParams()

  useEffect(() => {
    const notificationSource = searchParams.get(
      EXTERNAL_NOTIFICATION_SOURCE_PARAM,
    )
    const notificationType = searchParams.get(EXTERNAL_NOTIFICATION_TYPE_PARAM)

    if (notificationType && notificationSource) {
      NotificationMetrics.externalNotificationClick({
        orderId,
        source: notificationSource,
        type: notificationType,
      })

      clearSearchParams([
        EXTERNAL_NOTIFICATION_TYPE_PARAM,
        EXTERNAL_NOTIFICATION_SOURCE_PARAM,
      ])
    }
  }, [searchParams])
}
