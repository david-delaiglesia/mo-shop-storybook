import { CartService } from 'domain/cart'

export function orderLineMapper(products = []) {
  const orderProducts = {}
  const orderLines = {}

  let order = products.length

  for (let orderLine of products) {
    order -= 1
    const {
      orderLineId,
      product,
      quantity,
      priceInstructions,
      sources,
      version,
    } = orderLine
    const { id, badges } = product
    const total = CartService.calcTotal(
      priceInstructions || product.price_instructions,
      quantity,
    )
    const is_water = badges.is_water
    const requires_age_check = badges.requires_age_check
    const published = product.published

    orderProducts[id] = product

    orderLines[id] = {
      orderLineId,
      quantity,
      total,
      order,
      is_water,
      requires_age_check,
      id,
      priceInstructions: priceInstructions || product.price_instructions,
      sources,
      version,
      published,
    }
  }

  return { orderProducts, miniOrderProducts: orderLines }
}

export function preparedOrderLineMapper(products = []) {
  const orderProducts = {}
  let order = products.length

  for (let orderLine of products) {
    order -= 1
    const {
      product,
      preparedQuantity,
      orderedQuantity,
      originalPriceInstructions,
    } = orderLine
    let quantity = preparedQuantity

    if (quantity === null) {
      quantity = orderedQuantity
    }

    const { id } = product
    const total = CartService.calcTotal(
      originalPriceInstructions || product.price_instructions,
      quantity,
    )

    orderProducts[id] = {
      ...product,
      ...orderLine,
      total,
      order,
    }
  }

  return orderProducts
}
