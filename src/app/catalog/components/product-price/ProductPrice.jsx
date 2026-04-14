import { useRef } from 'react'
import { useSelector } from 'react-redux'

import classNames from 'classnames'
import { bool, number, object } from 'prop-types'

import { getAriaLabelForProductPrice } from 'app/accessibility'
import { AddProductToList } from 'app/shopping-lists/components/add-product-to-list'
import {
  PriceInstructions,
  PriceInstructionsPropTypes,
} from 'domain/price-instructions'
import { TAB_INDEX } from 'utils/constants'
import { getProductPriceSizeFormat } from 'utils/products'

import './styles/ProductPrice.css'

const ProductPrice = ({
  priceInstructions,
  isDetail = false,
  isHighlight = false,
  shouldDisplayTheAddToListButton = false,
  product,
  tabIndex = TAB_INDEX.DISABLED,
}) => {
  const state = useSelector((state) => state)
  const isEditingOrder = state?.ui?.productModal?.editingOrder
  const user = state.user

  const isBulk = PriceInstructions.isBulk(priceInstructions)
  const price = PriceInstructions.getPrice(priceInstructions)
  const previousPrice = PriceInstructions.getPreviousPrice(priceInstructions)
  const hasDiscount = !!previousPrice

  const unitPriceClass = classNames(
    'product-price__unit-price',
    { 'large-b': isDetail },
    { 'headline1-b': isHighlight },
    { 'subhead1-b': !isDetail && !isHighlight },
    { 'product-price__unit-price--discount': hasDiscount },
  )
  const previousUnitPriceClass = classNames(
    'product-price__previous-unit-price',
    { 'title1-sb': isDetail },
    { 'footnote1-r': !isDetail },
  )
  const extraPriceClass = classNames(
    'product-price__extra-price',
    { 'title1-r': isDetail },
    { 'subhead1-r': !isDetail },
  )

  const productPriceRef = useRef()

  return (
    <div className="product-price">
      <div
        ref={productPriceRef}
        tabIndex={tabIndex}
        aria-label={getAriaLabelForProductPrice(priceInstructions)}
      >
        {hasDiscount && (
          <p
            className={previousUnitPriceClass}
            data-testid="product-price"
            aria-hidden={true}
          >
            {previousPrice + ' €'}
          </p>
        )}
        <p
          className={unitPriceClass}
          data-testid="product-price"
          aria-hidden={true}
        >
          {price + ' €'}
        </p>
        <p className={extraPriceClass} aria-hidden={true}>
          {getProductPriceSizeFormat(priceInstructions, isBulk)}
        </p>
      </div>
      {shouldDisplayTheAddToListButton && !isEditingOrder && (
        <AddProductToList productId={product.id} userId={user.uuid} />
      )}
    </div>
  )
}

ProductPrice.propTypes = {
  priceInstructions: PriceInstructionsPropTypes.isRequired,
  isDetail: bool,
  isHighlight: bool,
  shouldDisplayTheAddToListButton: bool,
  product: object,
  tabIndex: number,
}

export { ProductPrice }
