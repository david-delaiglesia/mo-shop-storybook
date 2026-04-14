import { Product } from './Product'

const canIncrementQuantity = (product, currentQuantity) =>
  product.limit > currentQuantity

function getBlinkingProductsDayMatch(productList, selectedSlotDay) {
  const parsedDate = new Date(selectedSlotDay)
  const dayNumber = parsedDate.getDay()
  const blinkingProducts = productList.filter(({ product }) => {
    const hasValidUnavailableWeekdays = Product.hasValidUnavailableWeekdays(
      product,
      dayNumber,
    )

    const hasValidUnavailableFrom = Product.hasValidUnavailableFrom(
      product,
      selectedSlotDay,
    )

    if (!hasValidUnavailableWeekdays && !hasValidUnavailableFrom) return false

    return true
  })

  return blinkingProducts
}

export const ProductService = {
  canIncrementQuantity,
  getBlinkingProductsDayMatch,
}
