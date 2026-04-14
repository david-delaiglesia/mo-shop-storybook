export const getNextSubcategory = (categories, categoryId) => {
  const parentCategory = categories.find((category) =>
    category.categories.some((subcategory) => subcategory.id === categoryId),
  )

  if (!parentCategory) {
    return null
  }

  const nextSubcategoryIndex =
    parentCategory.categories.findIndex(
      (subcategory) => subcategory.id === categoryId,
    ) + 1
  const isLastSubcategory =
    parentCategory.categories.length <= nextSubcategoryIndex

  if (isLastSubcategory) {
    return null
  }

  return parentCategory.categories[nextSubcategoryIndex]
}
