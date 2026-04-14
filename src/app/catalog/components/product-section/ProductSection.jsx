import { useEffect } from 'react'
import { useLocation, withRouter } from 'react-router-dom'

import { array, func, number, string } from 'prop-types'

import { FocusedElement, useAccessibilityFocus } from 'app/accessibility'
import { ProductCellSwitch } from 'app/catalog/components/product-cell-switch'
import { ProductImpression } from 'app/catalog/components/product-impression/ProductImpression.tsx'
import {
  addCampaignToUserProperties,
  sendHomeRecommendationsViewMetrics,
} from 'app/catalog/metrics'
import { ProductMetricsContext } from 'app/shared/product-metrics-context'
import NoResults from 'components/no-results'

import './ProductSection.css'

const SOURCES = {
  RECOMMENDATIONS: 'recommendations',
}

const ProductSection = ({
  products,
  name,
  subtitle,
  source,
  sourceCode,
  layout,
  sectionPosition,
  sectionId,
  categoryId,
  noResultsComponent: NoResults,
}) => {
  const hasProducts = products.length > 0

  useEffect(() => {
    if (source === SOURCES.RECOMMENDATIONS) {
      sendHomeRecommendationsViewMetrics()
    }
    addCampaignToUserProperties()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const { setFocusRef } = useAccessibilityFocus()

  const location = useLocation()

  const isPriceDropsLocation = location.pathname.includes('price-drops')
  const focusedElementRef = isPriceDropsLocation ? setFocusRef : null

  return (
    <section className="section" data-testid="section">
      {name && (
        <FocusedElement innerRef={focusedElementRef}>
          <h2 className="section__header headline1-b">{name}</h2>
        </FocusedElement>
      )}
      {subtitle && <p className="section__subtitle footnote1-r">{subtitle}</p>}
      {hasProducts ? (
        <div className="product-container">
          <ProductMetricsContext.Provider
            value={{
              sourceCode,
              source,
              layout,
              sectionPosition,
              sectionId,
              categoryId,
            }}
          >
            {products.map((product, index) => {
              return (
                <ProductImpression
                  key={product}
                  productId={product}
                  order={index}
                  source={source}
                  layout={layout}
                  sectionPosition={sectionPosition}
                  sectionId={sectionId}
                  categoryId={categoryId}
                >
                  <ProductCellSwitch productId={product} order={index} />
                </ProductImpression>
              )
            })}
          </ProductMetricsContext.Provider>
        </div>
      ) : (
        <NoResults />
      )}
    </section>
  )
}

ProductSection.propTypes = {
  name: string,
  subtitle: string,
  products: array.isRequired,
  source: string,
  sourceCode: string,
  layout: string,
  sectionPosition: number,
  sectionId: number,
  categoryId: number,
  noResultsComponent: func,
}

ProductSection.defaultProps = {
  noResultsComponent: NoResults,
}

const ComposedProductSection = withRouter(ProductSection)

export { ComposedProductSection as ProductSection }
