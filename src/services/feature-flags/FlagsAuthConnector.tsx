import { useUnleashClient } from '@unleash/proxy-client-react'
import { useEffect } from 'react'

import { useUserUUID } from 'app/authentication'

export const FlagsAuthConnector = () => {
  const client = useUnleashClient()

  const userId: string | undefined = useUserUUID()

  useEffect(() => {
    if (userId) {
      client.setContextField('userId', userId)
      return
    }

    client.removeContextField('userId')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  return null
}
