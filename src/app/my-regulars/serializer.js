export function serializeMyRegulars(response) {
  if (!response || response.length === 0) return

  const serializedMyRegulars = response.reduce(
    (accumulator, currentValue) => {
      return {
        products: {
          ...accumulator.products,
          [currentValue.product.id]: currentValue.product,
        },

        recommendations: {
          ...accumulator.recommendations,
          [currentValue.product.id]: {
            recommendedQuantity: currentValue.recommended_quantity,
          },
        },

        productsArray: [...accumulator.productsArray, currentValue.product.id],
      }
    },
    { products: {}, recommendations: {}, productsArray: [] },
  )

  return serializedMyRegulars
}
