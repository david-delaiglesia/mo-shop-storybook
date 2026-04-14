import { useContext } from 'react'

import { OrderPSD2Context } from './OrderPSD2Context'

export const useOrderPSD2Context = () => {
  const context = useContext(OrderPSD2Context)

  return context
}
