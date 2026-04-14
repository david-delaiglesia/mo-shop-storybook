import {
  productBase,
  productWithBulk,
  recommendedProduct,
  waterProduct,
} from './product'

const recommendations = [
  {
    product: {
      ...productBase,
    },
    recommended_quantity: 2,
    selling_method: 0,
  },
  {
    product: {
      ...recommendedProduct,
    },
    recommended_quantity: 3,
    selling_method: 0,
  },
  {
    product: { ...productWithBulk },
    recommended_quantity: 0.3,
    selling_method: 0,
  },
]

const recommendationsWithUnpublished = [
  {
    product: {
      ...productWithBulk,
      published: false,
    },
    recommended_quantity: 2,
    selling_method: 0,
  },
]

const recommendationsWithRecommendedQuantity = [
  {
    product: {
      ...productWithBulk,
    },
    recommended_quantity: 0.4,
    selling_method: 1,
  },
]

const manyRecommendations = [
  {
    product: { ...productBase },
    recommended_quantity: 3,
    selling_method: 0,
  },
  {
    product: { ...recommendedProduct },
    recommended_quantity: 1,
    selling_method: 0,
  },
  {
    product: { ...waterProduct },
    recommended_quantity: 2,
    selling_method: 0,
  },
]

export {
  recommendations,
  recommendationsWithUnpublished,
  manyRecommendations,
  recommendationsWithRecommendedQuantity,
}
