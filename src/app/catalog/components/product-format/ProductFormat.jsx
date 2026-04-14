import { useRef } from 'react'

import classNames from 'classnames'
import { bool, number, string } from 'prop-types'

import { getProductAccessibleText } from 'app/accessibility'
import { Product, ProductPropTypes } from 'domain/product'
import { TAB_INDEX } from 'utils/constants'
import { getLocaleStringValue } from 'utils/maths'
import { capitalizeFirstLetter } from 'utils/strings'

import './styles/ProductFormat.css'

const ProductFormat = ({
  product,
  isExtended,
  showFormat,
  className = '',
  tabIndex = TAB_INDEX.DISABLED,
}) => {
  const { reference_price, reference_format } = product.price_instructions
  const isDetail = !!isExtended && !!product.details

  const componentClassName = classNames('product-format', className, {
    'product-format__size': isDetail,
    'product-format__size--cell': !isDetail,
  })

  const textClassName = isDetail ? 'headline1-r' : 'footnote1-r'

  const getText = () => {
    return productFormatRef.current?.textContent
  }

  const productFormatRef = useRef()

  return (
    <div
      ref={productFormatRef}
      className={componentClassName}
      aria-label={getProductAccessibleText(getText())}
      tabIndex={tabIndex}
    >
      {Product.hasToShowPackaging(product) && (
        <span className={textClassName} aria-hidden={true}>
          {capitalizeFirstLetter(product.packaging)}{' '}
        </span>
      )}
      <span className={textClassName} aria-hidden={true}>
        {Product.getSizeFormat(product)}
      </span>
      {(isDetail || showFormat) && (
        <span className={textClassName} aria-hidden={true}>
          {` | ${getLocaleStringValue(
            reference_price,
            2,
            3,
          )} €/${reference_format}`}
        </span>
      )}
    </div>
  )
}

ProductFormat.propTypes = {
  product: ProductPropTypes.isRequired,
  isExtended: bool,
  showFormat: bool,
  className: string,
  tabIndex: number,
}

export { ProductFormat }
