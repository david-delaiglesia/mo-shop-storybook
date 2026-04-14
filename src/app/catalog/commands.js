import { CatalogClient } from 'app/catalog/client'
import { addArrayProduct } from 'pages/product/actions'

const getSimilarProductsAndUpdate = async (
  productId,
  warehouse,
  exclude,
  { dispatch },
) => {
  const similarProducts = await CatalogClient.getProductSimilar(
    productId,
    warehouse,
    exclude,
  )

  if (!similarProducts.length) return

  const productsForStore = similarProducts.reduce((acc, current) => {
    acc[current.id] = current
    return acc
  }, {})

  dispatch(addArrayProduct(productsForStore))
  return similarProducts
}

export { getSimilarProductsAndUpdate }
