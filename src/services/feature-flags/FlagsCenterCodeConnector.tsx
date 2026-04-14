import { useUnleashClient } from '@unleash/proxy-client-react'
import { useEffect } from 'react'

import { useSession } from 'app/authentication'

export const FlagsCenterCodeConnector = () => {
  const client = useUnleashClient()

  const { warehouse } = useSession()

  useEffect(() => {
    client.setContextField('centerCode', warehouse)
  }, [warehouse])

  return null
}
