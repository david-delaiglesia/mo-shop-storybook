export const serializeSuggestions = (response) => {
  const serializedSuggestions = response.suggested_products.map(
    ({ id, display_name, thumbnail, price_instructions }) => {
      return {
        id,
        displayName: display_name,
        thumbnail,
        priceInstructions: price_instructions,
      }
    },
  )

  return serializedSuggestions
}
