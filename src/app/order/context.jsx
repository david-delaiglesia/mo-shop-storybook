import { createContext, useContext } from 'react'

import { array } from 'prop-types'

import { OrderPropTypes } from 'domain/order'

const OrderContext = createContext()

function OrderProvider({ children, order }) {
  return <OrderContext.Provider value={order}>{children}</OrderContext.Provider>
}

OrderProvider.propTypes = {
  children: array.isRequired,
  order: OrderPropTypes,
}

function useOrder() {
  const order = useContext(OrderContext)
  return order
}

export { OrderProvider, useOrder }
