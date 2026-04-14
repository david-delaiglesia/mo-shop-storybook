import { useEffect, useState } from 'react'

import { useSession } from 'app/authentication'
import { CatalogClient } from 'app/catalog/client'
import { HomeSectionNotificationContent } from 'app/home/interfaces'

export const useNotificationState = (
  notification: HomeSectionNotificationContent,
) => {
  const [state, setState] = useState<HomeSectionNotificationContent>(() => ({
    ...notification,
  }))
  const [isLoading, setIsLoading] = useState(() => !!notification.apiPath)
  const { isAuth, postalCode } = useSession()

  useEffect(() => {
    if (notification.apiPath) {
      const getDetails = isAuth
        ? CatalogClient.getSectionAuthDynamicDetails
        : (params: { apiPath: string }) =>
            CatalogClient.getSectionDynamicDetails({ ...params, postalCode })

      getDetails({
        apiPath: notification.apiPath,
      })
        .then((result) => {
          setState(result)
          setIsLoading(false)
        })
        .catch(() => {
          // Do nothing
        })
    }
  }, [notification.apiPath, isAuth])

  return { state, isLoading }
}
