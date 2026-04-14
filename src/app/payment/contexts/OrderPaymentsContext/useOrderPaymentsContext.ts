import { useContext } from 'react'

import {
  OrderPaymentsContext,
  OrderPaymentsContextState,
} from './OrderPaymentsContext'

export const useOrderPaymentsContext = (): OrderPaymentsContextState | null => {
  const context = useContext(OrderPaymentsContext)

  return context
}
