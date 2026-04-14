import { useContext } from 'react'

import {
  CheckoutContext,
  CheckoutContextState,
  fallbackCheckoutContextState,
} from './CheckoutContext'

type StrictCheckoutContext<StrictDeferred extends boolean> =
  StrictDeferred extends true
    ? Required<CheckoutContextState>
    : CheckoutContextState

export const useCheckoutContext = <
  StrictDeferred extends boolean,
>(): StrictCheckoutContext<StrictDeferred> => {
  const context = useContext(CheckoutContext)

  if (!context) {
    return fallbackCheckoutContextState as StrictCheckoutContext<StrictDeferred>
  }

  return context as StrictCheckoutContext<StrictDeferred>
}
