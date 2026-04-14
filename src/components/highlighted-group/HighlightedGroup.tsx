import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import classNames from 'classnames'

import { getCart } from 'app/cart/selectors'
import BannerNavigator from 'app/home/components/banner/BannerNavigator'
import { Product } from 'app/products'
import { HighlightedProduct } from 'components/highlighted-product'
import HighlightedProductItem from 'components/highlighted-product/HighlightedProductItem'
import { knownFeatureFlags, useFlag } from 'services/feature-flags'
import { TAB_INDEX } from 'utils/constants'

import './styles/HighlightedGroup.css'

interface HighlightedProduct {
  product: Product
  webImageUrl: string
  mobileImageUrl: string
}

interface HighlightedGroupProps {
  highlightedProducts: HighlightedProduct[]
  title: string
  subtitle?: string
  source: string
  sourceCode: string
  layout: string
  sectionPosition?: number
}
export const HighlightedGroup = (props: HighlightedGroupProps) => {
  const [translationX, setTranslationX] = useState({})
  const isHomeSectionWithoutSubtitleEnabled = useFlag(
    knownFeatureFlags.WEB_HOME_SECTION_WITHOUT_SUBTITLE,
  )

  const [shouldStopSlider, setShouldStopSlider] = useState(false)

  const applyMovement = (translation: number) => {
    const translationX = { transform: `translateX(${translation}px)` }
    setTranslationX(translationX)
  }

  const cart = useSelector(getCart)

  const {
    highlightedProducts,
    title,
    subtitle,
    source,
    sourceCode,
    layout,
    sectionPosition,
  } = props

  useEffect(() => {
    const productsInCart = Object.keys(cart?.products)

    highlightedProducts.forEach((item) => {
      if (productsInCart.includes(item.product.id)) {
        setShouldStopSlider(true)
      }
    })
  }, [cart, highlightedProducts])

  return (
    <div className="highlighted-group">
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
      <BannerNavigator
        length={highlightedProducts.length}
        applyMovement={applyMovement}
        shouldStopSlider={shouldStopSlider}
        isHighlightedGroupEnabled={true}
      >
        <div className="highlighted-group__mask">
          <div style={translationX} className="highlighted-group__wrapper">
            {highlightedProducts.map((highlightedProduct, index) => {
              return (
                <HighlightedProductItem
                  key={index}
                  source={source}
                  sourceCode={sourceCode}
                  layout={layout}
                  webImageUrl={highlightedProduct.webImageUrl}
                  mobileImageUrl={highlightedProduct.mobileImageUrl}
                  product={highlightedProduct.product}
                  order={index}
                  sectionPosition={sectionPosition}
                  onProductDetailOpened={() => {
                    setShouldStopSlider(true)
                  }}
                />
              )
            })}
          </div>
        </div>
      </BannerNavigator>
      <hr className="highlighted-group__separator" />
    </div>
  )
}
