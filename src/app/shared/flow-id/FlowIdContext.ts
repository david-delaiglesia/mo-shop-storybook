import { createContext } from 'react'

interface FlowIdContextValue {
  flowId: string
}

export const FlowIdContext = createContext<FlowIdContextValue | null>(null)
FlowIdContext.displayName = 'FlowIdContext'
