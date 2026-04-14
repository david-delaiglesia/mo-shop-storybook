import { cloneDeep } from 'utils/objects'

const orderByCategory = (response) => {
  const orderedCategories = generateOrderedCategories(response)
  const orderedCategoriesWithProducts = addProductsToCategories(
    response,
    orderedCategories,
  )

  return orderedCategoriesWithProducts
}

const generateOrderedCategories = (response) => {
  const clonedResponse = cloneDeep(response)

  const seenCategories = []
  const orderedCategories = clonedResponse.items
    .map((item) => {
      const category = item.product.categories[0]

      const isAlreadyAdded = seenCategories.some((seenCategory) => {
        return seenCategory === category.name
      })

      if (isAlreadyAdded) {
        return null
      }

      seenCategories.push(category?.name)
      return {
        id: category?.id,
        name: category?.name,
        order: category?.order,
        products: [],
      }
    })
    .filter((category) => category !== null)
    .sort((a, b) => a.order - b.order)

  return orderedCategories
}

const addProductsToCategories = (response, orderedCategories) => {
  const clonedResponse = cloneDeep(response)

  clonedResponse.items.forEach((item) => {
    const productCategoryId = item.product.categories[0].id

    const productCategory = orderedCategories.find((orderedCategory) => {
      return orderedCategory.id === productCategoryId
    })
    productCategory.products.push(item.product)
  })

  return orderedCategories
}

export { orderByCategory }
