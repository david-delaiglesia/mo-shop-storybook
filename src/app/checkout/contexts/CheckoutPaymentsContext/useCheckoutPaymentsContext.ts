import { useContext } from 'react'

import { CheckoutPaymentsContext } from './CheckoutPaymentsContext'

export const useCheckoutPaymentsContext = () => {
  const context = useContext(CheckoutPaymentsContext)

  return context
}
