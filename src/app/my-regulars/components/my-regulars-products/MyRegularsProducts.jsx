import { MyRegularsSortedProducts } from './MyRegularsSortedProducts'
import { array, func, object, string } from 'prop-types'

import { withTranslate } from 'app/i18n/containers/i18n-provider'
import { RecommendationProvider } from 'wrappers/recommendation-provider'

const MyRegularsProducts = ({
  source,
  sourceCode,
  recommendations,
  products,
  removeMyRegularProduct,
  sortingMethod,
}) => {
  return (
    <RecommendationProvider
      recommendations={recommendations}
      removeMyRegularProduct={removeMyRegularProduct}
    >
      <MyRegularsSortedProducts
        sortingMethod={sortingMethod}
        source={source}
        sourceCode={sourceCode}
        products={products}
      />
    </RecommendationProvider>
  )
}

MyRegularsProducts.propTypes = {
  source: string.isRequired,
  sourceCode: string.isRequired,
  recommendations: object.isRequired,
  products: array.isRequired,
  removeMyRegularProduct: func.isRequired,
  sortingMethod: string.isRequired,
  t: func.isRequired,
}

const MyRegularsProductsWithTranslate = withTranslate(MyRegularsProducts)

export { MyRegularsProductsWithTranslate as MyRegularsProducts }
