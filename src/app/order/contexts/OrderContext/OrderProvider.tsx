import { ReactNode } from 'react'

import { OrderContext } from './OrderContext'

import { useOrderById } from 'app/order/hooks/useOrderById'

interface OrderProviderProps {
  orderId: number | string
  children: ReactNode
  deferred?: boolean
}

export const OrderProvider = ({
  orderId,
  children,
  deferred,
}: OrderProviderProps) => {
  const { order, isLoading, refetchOrder } = useOrderById(orderId)

  return (
    <OrderContext.Provider
      value={{
        order,
        isLoading,
        refetchOrder,
      }}
    >
      {deferred && (order ? children : null)}
      {!deferred && children}
    </OrderContext.Provider>
  )
}
