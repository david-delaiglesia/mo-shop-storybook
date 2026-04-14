import { ReactNode, useState } from 'react'

import { CheckoutSlotResetContext } from './CheckoutSlotResetContext'

interface CheckoutSlotResetProviderProps {
  children: ReactNode
}

export const CheckoutSlotResetProvider = ({
  children,
}: CheckoutSlotResetProviderProps) => {
  const [slotResetRequested, setSlotResetRequested] = useState(false)

  const requestSlotReset = () => setSlotResetRequested(true)
  const clearSlotReset = () => setSlotResetRequested(false)

  return (
    <CheckoutSlotResetContext.Provider
      value={{ slotResetRequested, requestSlotReset, clearSlotReset }}
    >
      {children}
    </CheckoutSlotResetContext.Provider>
  )
}
