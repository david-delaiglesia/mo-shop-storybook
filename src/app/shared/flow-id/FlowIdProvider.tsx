import { ReactNode, useMemo } from 'react'

import { FlowIdContext } from './FlowIdContext'
import { useFlowIdGenerator } from './useFlowIdGenerator'

interface FlowIdProviderProps {
  children: ReactNode
}

export const FlowIdProvider = ({ children }: FlowIdProviderProps) => {
  const flowId = useFlowIdGenerator()

  const contextValue = useMemo(() => ({ flowId }), [flowId])

  return (
    <FlowIdContext.Provider value={contextValue}>
      {children}
    </FlowIdContext.Provider>
  )
}
