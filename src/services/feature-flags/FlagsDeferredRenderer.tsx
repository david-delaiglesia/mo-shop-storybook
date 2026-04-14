import { useFlagsStatus } from '@unleash/proxy-client-react'
import { ReactNode } from 'react'

interface FlagsDeferredRendererProps {
  children: ReactNode
}

export const FlagsDeferredRenderer = ({
  children,
}: FlagsDeferredRendererProps) => {
  const { flagsReady } = useFlagsStatus()

  if (!flagsReady) {
    return null
  }
  return children
}
