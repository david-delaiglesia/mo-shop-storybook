import { PriceInstructions } from 'domain/price-instructions'

const calculateUnitsFromProductList = (products) => {
  return products.reduce((acc, product) => {
    const isBulkProduct = PriceInstructions.isBulk(product.price_instructions)
    if (isBulkProduct) {
      return acc + 1
    }

    return acc + product.recommended_quantity
  }, 0)
}

const calculateUnitsFromCart = (products) => {
  return products.reduce((acc, product) => {
    const isBulkProduct = PriceInstructions.isBulk(product.priceInstructions)
    if (isBulkProduct) {
      return acc + 1
    }

    return acc + product.quantity
  }, 0)
}

const serializeCartProducts = (products) => {
  return Object.keys(products || {}).map((key) => products[key])
}

export const ShoppingListsMetrics = {
  calculateUnitsFromProductList,
  calculateUnitsFromCart,
  serializeCartProducts,
}
