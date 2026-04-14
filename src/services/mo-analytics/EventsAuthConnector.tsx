import { useEffect } from 'react'

import { MOAnalytics } from './mo-analytics'

import { useUserUUID } from 'app/authentication'

export const EventsAuthConnector = () => {
  const userId: string | undefined = useUserUUID()

  useEffect(() => {
    if (userId) {
      MOAnalytics.setUserId(userId)
      return
    }

    MOAnalytics.anonymize()
  }, [userId])

  return null
}
