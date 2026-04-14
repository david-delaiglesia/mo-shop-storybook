function populateOrderLinesInCart(cart, products) {
  const orderLines = Object.values(cart.products)
  const orderLinesArray = orderLines.map((orderLine) => ({
    ...orderLine,
    product: products[orderLine.id],
  }))

  const orderLinesObject = orderLinesArray.reduce((orderLines, orderLine) => {
    orderLines[orderLine.id] = orderLine
    return orderLines
  }, {})

  return orderLinesObject
}

export function getCart(state) {
  const { cart, products } = state
  const eagerOrderLines = populateOrderLinesInCart(cart, products)

  return {
    ...cart,
    products: eagerOrderLines,
  }
}
