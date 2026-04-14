import HighlightedProductItem from './HighlightedProductItem'
import classNames from 'classnames'
import { number, object, string } from 'prop-types'

import { knownFeatureFlags, useFlag } from 'services/feature-flags'
import { TAB_INDEX } from 'utils/constants'

import './styles/HighlightedProduct.css'

const HighlightedProduct = ({
  title,
  subtitle,
  product,
  webImageUrl,
  sourceCode,
  layout,
  source,
  sectionPosition,
}) => {
  const isHomeSectionWithoutSubtitleEnabled = useFlag(
    knownFeatureFlags.WEB_HOME_SECTION_WITHOUT_SUBTITLE,
  )

  return (
    <div className="highlighted-product" aria-label={`${product.display_name}`}>
      {title && (
        <h2
          tabIndex={TAB_INDEX.ENABLED}
          className={classNames('headline1-b', {
            'highlighted-product__title': subtitle,
            'highlighted-product__title-no-subtitle':
              isHomeSectionWithoutSubtitleEnabled && !subtitle,
          })}
        >
          {title}
        </h2>
      )}
      {subtitle && (
        <p className="highlighted-product__subtitle footnote1-r">{subtitle}</p>
      )}
      <div className="highlighted-product__mask">
        <div className="highlighted-product__wrapper">
          <HighlightedProductItem
            product={product}
            webImageUrl={webImageUrl}
            sourceCode={sourceCode}
            layout={layout}
            source={source}
            order={0}
            sectionPosition={sectionPosition}
          />
        </div>
      </div>
      <hr className="highlighted-product__separator" aria-hidden="true" />
    </div>
  )
}

HighlightedProduct.propTypes = {
  title: string,
  subtitle: string,
  product: object,
  webImageUrl: string,
  sourceCode: string,
  layout: string,
  source: string,
  sectionPosition: number,
}

export { HighlightedProduct }
