import { getDay } from 'utils/dates'

function mergeOrderLinesWithSameProduct(orderLines) {
  return orderLines.reduce((order, orderLine) => {
    const { product } = orderLine

    const hasCurrentProduct = order.find(isCurrentProduct(product))
    if (hasCurrentProduct) {
      return order
    }

    const repeated = orderLines.filter(isCurrentProduct(product))
    return [...order, mergeOrderLineQuantities(repeated)]
  }, [])
}

function isCurrentProduct(product) {
  return (currentOrderLine) => currentOrderLine.product.id === product.id
}

function mergeOrderLineQuantities(orderLines) {
  const initialQuantity = { quantity: 0 }

  return orderLines.reduce(
    (orderLine, repeatedLine) => ({
      ...orderLine,
      ...repeatedLine,
      quantity: orderLine.quantity + repeatedLine.quantity,
    }),
    initialQuantity,
  )
}

function hasAnyOrderWithSameAddressAndDay(orders, slot, address) {
  if (!orders || !slot) {
    return false
  }

  return orders.some(
    ({ slot: orderSlot, address: orderAddress }) =>
      getDay(orderSlot.start) === getDay(slot.start) &&
      orderAddress.id === address.id,
  )
}

export const OrderService = {
  mergeOrderLinesWithSameProduct,
  hasAnyOrderWithSameAddressAndDay,
}
