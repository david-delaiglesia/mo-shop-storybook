function deserializeCartToStorage(cart) {
  const orderLines = cart.products
  const sortedOrderLines = Object.keys(orderLines)
    .map((id) => ({ ...orderLines[id] }))
    .sort((a, b) => b.order - a.order)

  const serializedOrderLines = sortedOrderLines.map(
    ({ orderLineId, product, quantity, priceInstructions, sources }) => {
      return {
        id: orderLineId,
        product,
        original_price_instructions: priceInstructions,
        quantity,
        sources,
      }
    },
  )

  const serializedCart = {
    id: cart.id,
    lines: serializedOrderLines,
  }

  return serializedCart
}

const deserializeOrderLines = (orderLines) => {
  return orderLines.map(
    ({ orderLineId, product, quantity, id, sources, version }) => {
      return {
        id: orderLineId,
        quantity,
        ...(version && { version }),
        product_id: product?.id ?? id,
        sources,
      }
    },
  )
}

function deserializeCart(cart) {
  const orderLines = cart.products
  const sortedOrderLines = Object.keys(orderLines)
    .map((id) => ({ ...orderLines[id] }))
    .sort((a, b) => b.order - a.order)

  const serializedOrderLines = deserializeOrderLines(sortedOrderLines)

  return {
    id: cart.id,
    ...(cart.version && { version: cart.version }),
    lines: serializedOrderLines,
  }
}

function deserializeCartFromShoppingList(cart) {
  const orderLines = cart.products
  const sortedOrderLines = Object.keys(orderLines)
    .map((id) => ({ ...orderLines[id] }))
    .sort((a, b) => a.order - b.order)
    .reverse()

  const serializedOrderLines = deserializeOrderLines(sortedOrderLines)

  return {
    id: cart.id,
    ...(cart.version && { version: cart.version }),
    lines: serializedOrderLines,
  }
}

function serializeOrderLine(orderLine) {
  const {
    id,
    quantity,
    product,
    original_price_instructions,
    sources,
    version,
  } = orderLine

  const baseLine = {
    quantity,
    product,
    ...(version && { version }),
    priceInstructions:
      original_price_instructions || product.price_instructions,
    sources,
  }
  if (!id) return baseLine
  return { orderLineId: id, ...baseLine }
}

function serializeCart(cart) {
  const { id, lines, open_order_id: openOrderId, version, origin } = cart

  return {
    id,
    openOrderId,
    ...(version && { version }),
    products: lines.map(serializeOrderLine),
    origin,
  }
}

function serializeCartListTooltip(cartListTooltip) {
  return {
    showTooltip: cartListTooltip?.show_tooltip,
  }
}

export {
  serializeCart,
  deserializeCart,
  deserializeCartToStorage,
  deserializeCartFromShoppingList,
  serializeCartListTooltip,
}
