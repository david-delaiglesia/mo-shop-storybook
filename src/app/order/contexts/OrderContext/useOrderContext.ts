import { useContext } from 'react'

import {
  OrderContext,
  OrderContextState,
  fallbackOrderContextState,
} from './OrderContext'

export const useOrderContext = (): OrderContextState => {
  const context = useContext(OrderContext)

  if (!context) {
    // TODO: Uncomment the line once the context is properly set up on finish bizum flow
    // throw new Error('useOrderContext must be within OrderProvider')
    return fallbackOrderContextState
  }

  return context
}
