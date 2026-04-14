import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'

import classNames from 'classnames'
import { func, number, object, string } from 'prop-types'
import { compose } from 'redux'

import {
  AriaLive,
  getProductAccessibleText,
  getProductAddedFeedback,
} from 'app/accessibility'
import { withExtraWaterHandler } from 'app/catalog/containers/product-extra-water-handler'
import { withProductLimitHandler } from 'app/catalog/containers/product-limit-handler'
import Button from 'components/button'
import { ButtonPicker } from 'components/button-picker'
import { Product } from 'domain/product'
import { LocationService } from 'infra/LocationService'
import { PATHS } from 'pages/paths'
import { TAB_INDEX } from 'utils/constants'
import { getFeedbackText } from 'utils/products'

import './styles/ProductQuantityButton.css'

const DELETE_CLASS = 'delete-28'
const MINUS_CLASS = 'minus-28'

const hasProductReachedMinimumQuantity = (product, quantity) => {
  const bulkMinAmountReached =
    Product.isBulk(product) &&
    quantity === product.price_instructions.min_bunch_amount
  const standardMinAmountReached = !Product.isBulk(product) && quantity === 1

  return bulkMinAmountReached || standardMinAmountReached
}

const getDecreaseIcon = (product, quantity) => {
  if (hasProductReachedMinimumQuantity(product, quantity)) {
    return DELETE_CLASS
  }

  return MINUS_CLASS
}

const getButtonText = (
  priceInstructions,
  quantity,
  recommendedQuantity,
  isPathWithRecommendedQuantities,
  isShoppingListsPath,
) => {
  const product = { price_instructions: priceInstructions }
  if (!recommendedQuantity || !isPathWithRecommendedQuantities) {
    return 'commons.product.add_to_cart'
  }

  const feedBackText = getFeedbackText(
    isPathWithRecommendedQuantities ? recommendedQuantity : quantity,
    product,
  )
  const translationKey = isShoppingListsPath
    ? 'commons.product.add_to_cart_shopping_list'
    : 'commons.product.add_quantity'

  return {
    key: translationKey,
    interpolation: { quantity: feedBackText },
  }
}

const ProductQuantityButton = ({
  recommendedQuantity,
  priceInstructions,
  quantity,
  theme,
  size,
  decreaseProductFromCart,
  addProductToCart,
}) => {
  const location = useLocation()

  const { t } = useTranslation()

  const isShoppingListsPath =
    location.pathname === PATHS.SHOPPING_LISTS_MY_REGULARS ||
    location.pathname.startsWith(PATHS.SHOPPING_LISTS)

  const isPathWithRecommendedQuantities =
    LocationService.isPathWithRecommendedQuantity()

  const productClass = classNames('product-quantity-button', 'subhead1-r', {
    'product-quantity-button--in-cart': quantity,
  })

  const type = quantity ? 'oval' : 'rounded'
  const product = { price_instructions: priceInstructions }
  const text = getFeedbackText(quantity, product)

  const buttonText = getButtonText(
    priceInstructions,
    quantity,
    recommendedQuantity,
    isPathWithRecommendedQuantities,
    isShoppingListsPath,
  )

  const addToCartAccessibleDescription = getProductAccessibleText(
    t(buttonText.key, buttonText.interpolation),
  )

  const shouldAddProductToCartBeHidden = quantity > 0
  const addProductToCartTabIndex = shouldAddProductToCartBeHidden
    ? TAB_INDEX.DISABLED
    : null

  const [productAddedFeedback, setProductAddedFeedback] = useState('')
  const [timesClickedOnAddToCart, setTimesClickedOnAddToCart] = useState(0)

  const updateProductAddedFeedback = () => {
    const shouldUseRecommendedQuantity =
      isPathWithRecommendedQuantities && recommendedQuantity > 0

    const productDefaultQuantity = product.price_instructions.min_bunch_amount
    const quantity = shouldUseRecommendedQuantity
      ? recommendedQuantity
      : productDefaultQuantity

    setProductAddedFeedback(getProductAddedFeedback(quantity, product))
  }

  const handleAddProductToCart = (event) => {
    setTimesClickedOnAddToCart((timesClicked) => timesClicked + 1)
    addProductToCart()
    updateProductAddedFeedback()

    const productQuantityButtonContainer = event.target.closest(
      '.product-quantity-button',
    )
    setTimeout(() => {
      productQuantityButtonContainer
        .querySelector('#button-picker-increase')
        ?.focus()
    }, 100)
  }

  const displayProductAddedAccessibilityFeedback = () => {
    return timesClickedOnAddToCart % 2 === 0
      ? productAddedFeedback
      : productAddedFeedback.toUpperCase()
  }

  const productQuantityClassName = classNames({
    'product-quantity-button--hidden': shouldAddProductToCartBeHidden,
  })

  return (
    <div className={productClass}>
      <ButtonPicker
        product={product}
        quantity={quantity}
        theme={theme}
        size={size}
        feedBackText={text}
        iconDecrease={getDecreaseIcon(product, quantity)}
        onClickDecrease={decreaseProductFromCart}
        onClickIncrease={addProductToCart}
      />
      <AriaLive text={displayProductAddedAccessibilityFeedback()} />
      <div className={productQuantityClassName}>
        <Button
          ariaLabel={addToCartAccessibleDescription}
          text={buttonText}
          type={type}
          size={size}
          onClick={handleAddProductToCart}
          datatest="product-quantity-button"
          className="product-quantity-button__add"
          tabIndex={addProductToCartTabIndex}
        />
      </div>
    </div>
  )
}

ProductQuantityButton.propTypes = {
  quantity: number,
  theme: string,
  addProductToCart: func,
  decreaseProductFromCart: func,
  priceInstructions: object,
  size: string,
  recommendedQuantity: number,
}

export const ProductQuantityButtonWithExtraWater = compose(
  withExtraWaterHandler,
  withProductLimitHandler,
)(ProductQuantityButton)

const ComposedProductQuantityButton = compose(withProductLimitHandler)(
  ProductQuantityButton,
)

export { ComposedProductQuantityButton as ProductQuantityButton }
