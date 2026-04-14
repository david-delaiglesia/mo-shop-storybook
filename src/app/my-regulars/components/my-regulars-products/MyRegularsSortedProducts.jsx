import { useSelector } from 'react-redux'

import { array, string } from 'prop-types'

import { ProductSection } from 'app/catalog/components/product-section'
import { LAYOUTS } from 'app/catalog/metrics'
import { SORTING_METHODS } from 'app/my-regulars/constants'
import { Product } from 'domain/product'

const removeDuplicatedValues = (value, index, array) =>
  array.indexOf(value) === index

const MyRegularsSortedProducts = ({
  sortingMethod,
  source,
  sourceCode,
  products,
}) => {
  const allProducts = useSelector((state) => state.products)

  if (sortingMethod === SORTING_METHODS.BY_CATEGORY) {
    const populatedProducts = products.map(
      (productId) => allProducts[productId],
    )

    const categoryNames = populatedProducts
      .map((product) => Product.getCategory(product))
      .sort((categoryA, categoryB) => categoryA.order - categoryB.order)
      .map((category) => category.name)
      .filter(removeDuplicatedValues)

    const productsSections = categoryNames.map((categoryName) => ({
      title: categoryName,
      products: populatedProducts
        .filter((product) => Product.getCategory(product).name === categoryName)
        .map((product) => product.id),
    }))

    return productsSections.map((section, index) => (
      <ProductSection
        key={index}
        name={section.title}
        products={section.products}
        source={source}
        sourceCode={sourceCode}
        layout={LAYOUTS.GRID}
      />
    ))
  }

  return (
    <ProductSection
      products={products}
      source={source}
      sourceCode={sourceCode}
      layout={LAYOUTS.GRID}
    />
  )
}

MyRegularsSortedProducts.propTypes = {
  sortingMethod: string.isRequired,
  source: string.isRequired,
  sourceCode: string.isRequired,
  products: array.isRequired,
}

export { MyRegularsSortedProducts }
