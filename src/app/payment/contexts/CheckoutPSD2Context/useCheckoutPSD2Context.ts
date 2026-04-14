import { useContext } from 'react'

import { CheckoutPSD2Context } from './CheckoutPSD2Context'

export const useCheckoutPSD2Context = () => {
  const context = useContext(CheckoutPSD2Context)

  return context
}
