function normalizeProductList(products) {
  const normalizedProducts = products.reduce((products, product) => {
    products[product.id] = product
    return products
  }, [])

  return normalizedProducts
}

export { normalizeProductList }
