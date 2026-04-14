import { useRef, useState } from 'react'

import Button from '../button'
import classNames from 'classnames'
import { func, number, object, string } from 'prop-types'

import {
  getAriaLabelForAddingUnitToCart,
  getAriaLabelForRemoveProductFromCart,
  getProductAddedFeedback,
  getProductDecreasedFeedback,
} from 'app/accessibility'
import ProductFeedback from 'app/catalog/components/product-feedback'
import { ProductQuantityChangedAccessibilityFeedback } from 'app/catalog/components/product-quantity-changed-accessibility-feedback/ProductQuantityChangedAccessibilityFeedback'
import { TAB_INDEX } from 'utils/constants'

import './assets/ButtonPicker.css'

const ButtonPicker = ({
  product,
  theme,
  feedBackText,
  size,
  quantity,
  iconDecrease,
  onClickDecrease,
  onClickIncrease,
}) => {
  const { price_instructions: priceInstructions } = product

  const shouldBeHidden = quantity === 0
  const tabIndex = shouldBeHidden ? TAB_INDEX.DISABLED : null

  const [productQuantityChangedFeedback, setProductQuantityChangedFeedback] =
    useState('')

  const updateProductIncreasedFeedback = () => {
    const quantity = product.price_instructions.min_bunch_amount
    setProductQuantityChangedFeedback(
      getProductAddedFeedback(quantity, product),
    )
  }

  const updateProductDecreasedFeedback = () => {
    const quantity = product.price_instructions.min_bunch_amount
    setProductQuantityChangedFeedback(
      getProductDecreasedFeedback(quantity, product),
    )
  }

  const buttonPickerClassName = classNames(
    `button-picker button-picker--${theme}`,
    {
      'button-picker--hidden': shouldBeHidden,
    },
  )

  const increaseQuantityButtonRef = useRef()

  const increaseProductQuantityButtonId = `button-picker-increase`

  return (
    <div
      className={`button-picker button-picker--${theme} ${buttonPickerClassName}`}
      data-testid="button-picker"
      aria-hidden={shouldBeHidden}
    >
      <ProductFeedback size={size} text={feedBackText} quantity={quantity} />
      <div className="button-picker__actions">
        {quantity > 0 && (
          <ProductQuantityChangedAccessibilityFeedback
            text={productQuantityChangedFeedback}
            quantity={quantity}
          />
        )}
        <Button
          onClick={() => {
            onClickDecrease()
            updateProductDecreasedFeedback()
          }}
          size={size}
          icon={iconDecrease}
          type="oval"
          className={iconDecrease}
          tabIndex={tabIndex}
          ariaLabel={getAriaLabelForRemoveProductFromCart(
            quantity,
            priceInstructions,
          )}
          datatest="button-picker-decrease"
        />

        <Button
          id={increaseProductQuantityButtonId}
          forwardedRef={increaseQuantityButtonRef}
          onClick={() => {
            onClickIncrease()
            updateProductIncreasedFeedback()
          }}
          size={size}
          icon="plus-28"
          type="oval"
          tabIndex={tabIndex}
          ariaLabel={getAriaLabelForAddingUnitToCart(priceInstructions)}
          datatest={increaseProductQuantityButtonId}
        />
      </div>
    </div>
  )
}

ButtonPicker.propTypes = {
  product: object.isRequired,
  theme: string.isRequired,
  quantity: number,
  onClickDecrease: func,
  onClickIncrease: func,
  iconDecrease: string.isRequired,
  feedBackText: string.isRequired,
  size: string,
}

export { ButtonPicker }
