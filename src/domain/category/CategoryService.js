const getFirstCategoryId = (categories) => {
  const subCategories = categories[0]?.categories
  const firstCategoryId = subCategories[0]?.id

  return firstCategoryId
}

const getFirstSubcategoryId = (category) => {
  const subCategories = category.categories
  const firstCategoryId = subCategories[0]?.id

  return firstCategoryId
}

export const CategoryService = {
  getFirstCategoryId,
  getFirstSubcategoryId,
}
