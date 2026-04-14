import { useContext } from 'react'

import { FlowIdContext } from './FlowIdContext'

export const useFlowIdContext = () => {
  const context = useContext(FlowIdContext)

  if (!context) {
    throw new Error('useFlowIdContext should be inside FlowIdContext')
  }

  return context
}
