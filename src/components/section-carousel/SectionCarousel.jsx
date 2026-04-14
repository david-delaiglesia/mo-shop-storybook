import { Link } from 'react-router-dom'

import classNames from 'classnames'
import { array, number, string } from 'prop-types'

import { Icon } from '@mercadona/mo.library.shop-ui/icon'

import { ProductCellSwitch } from 'app/catalog/components/product-cell-switch'
import { ProductImpression } from 'app/catalog/components/product-impression/ProductImpression'
import { useWindowWidth } from 'app/catalog/components/product-impression/useWindowWidth'
import {
  HOME_SECTION_TYPES,
  sendHomeSectionClickMetrics,
} from 'app/catalog/metrics'
import { ProductMetricsContext } from 'app/shared/product-metrics-context'
import { interpolateApiPathSections } from 'pages/routing'
import { knownFeatureFlags, useFlag } from 'services/feature-flags'
import { TAB_INDEX } from 'utils/constants'

import './SectionCarousel.css'

const SectionCarousel = ({
  name,
  subtitle,
  apiPath,
  apiPathText,
  source,
  sourceCode,
  layout,
  sectionPosition,
  products,
}) => {
  const sectionPath = interpolateApiPathSections(apiPath)
  const sectionPathWithHomeSectionType = `${sectionPath}?home_section_type=${HOME_SECTION_TYPES.AUT_CARROUSEL}`

  const isHideAllProductsLinkEnabled = useFlag(
    knownFeatureFlags.WEB_CAROUSEL_HIDE_ALL_PRODUCTS_LINK,
  )
  const isHomeSectionWithoutSubtitleEnabled = useFlag(
    knownFeatureFlags.WEB_HOME_SECTION_WITHOUT_SUBTITLE,
  )

  const sendClickMetrics = () => {
    sendHomeSectionClickMetrics({
      title: name,
      campaignId: source,
      homeSectionType: HOME_SECTION_TYPES.AUT_CARROUSEL,
    })
  }

  const { width } = useWindowWidth()

  const getMaximumVisibleProductsNumber = () => {
    if (width >= 1440) {
      return 6
    }
    if (width >= 1200) {
      return 5
    }
    if (width >= 992) {
      return 4
    }
    return 3
  }

  return (
    <section className="section-carousel">
      <div className="section-carousel__header">
        <div>
          {name && (
            <h2
              tabIndex={TAB_INDEX.ENABLED}
              className={classNames('headline1-b', {
                'section-carousel__title': subtitle,
                'section-carousel__title-no-subtitle':
                  isHomeSectionWithoutSubtitleEnabled && !subtitle,
              })}
            >
              {name}
            </h2>
          )}
          {subtitle && (
            <p className="section-carousel__subtitle footnote1-r">{subtitle}</p>
          )}
        </div>

        {isHideAllProductsLinkEnabled &&
          products.length > getMaximumVisibleProductsNumber() && (
            <Link
              className="section-carousel__link"
              to={sectionPathWithHomeSectionType}
              onClick={sendClickMetrics}
            >
              {apiPathText}
              <Icon icon="chevron-right" />
            </Link>
          )}
        {!isHideAllProductsLinkEnabled && (
          <Link
            className="section-carousel__link"
            to={sectionPathWithHomeSectionType}
            onClick={sendClickMetrics}
          >
            {apiPathText}
            <Icon icon="chevron-right" />
          </Link>
        )}
      </div>
      <div className="section-carousel__container">
        <ProductMetricsContext.Provider
          value={{ sourceCode, source, layout, sectionPosition }}
        >
          {products.length > 0 && (
            <div className="product-container">
              {products.map((product, index) => (
                <ProductImpression
                  key={product}
                  productId={product}
                  order={index}
                  source={source}
                  layout={layout}
                  sectionPosition={sectionPosition}
                >
                  <ProductCellSwitch
                    key={product}
                    productId={product}
                    order={index}
                  />
                </ProductImpression>
              ))}
            </div>
          )}
        </ProductMetricsContext.Provider>
      </div>
    </section>
  )
}

SectionCarousel.propTypes = {
  name: string,
  subtitle: string,
  apiPath: string,
  apiPathText: string,
  source: string,
  sourceCode: string,
  layout: string,
  sectionPosition: number,
  products: array.isRequired,
}

export { SectionCarousel }
