import { useUnleashClient } from '@unleash/proxy-client-react'
import { useEffect } from 'react'
import { useLocation } from 'react-router'

export const FeatureFlagFetchByRoute = () => {
  const location = useLocation()
  const unleashClient = useUnleashClient()

  useEffect(() => {
    unleashClient.updateToggles()
  }, [location.pathname, unleashClient])

  return null
}
