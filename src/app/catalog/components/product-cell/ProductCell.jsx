import { withRouter } from 'react-router-dom'

import { ProductFormat } from '../product-format'
import { ProductPrice } from '../product-price'
import {
  ProductQuantityButton,
  ProductQuantityButtonWithExtraWater,
} from '../product-quantity-button'
import { ActionsSection } from './ActionsSection'
import { NewArrivalLabel } from './NewArrivalLabel'
import classNames from 'classnames'
import { bool, func, number, object, shape } from 'prop-types'

import { compose } from '@mercadona/mo.library.dashtil'

import { getAriaLabelForProductCell } from 'app/accessibility'
import { withTranslate } from 'app/i18n/containers/i18n-provider'
import { CustomImg } from 'components/custom-img'
import { Cart } from 'domain/cart'
import { Product, ProductPropTypes } from 'domain/product'
import placeholder from 'system-ui/assets/img/placeholder.jpg'
import unavailable from 'system-ui/assets/img/unavailable.jpg'
import { GRID_THEME } from 'utils/products'

import './ProductCell.css'

const ProductCell = ({
  product,
  orderLine,
  openProduct,
  style,
  isProductSimilarCell,
  t,
  addProductToCart,
  decreaseProductFromCart,
}) => {
  const quantity = Cart.getProductQuantity(orderLine)
  const priceInstructions =
    orderLine?.priceInstructions || product.price_instructions

  const productCellClass = classNames('product-cell product-cell--actionable', {
    'product-cell--in-cart': quantity,
  })

  return (
    <div data-testid="product-cell" className={productCellClass} style={style}>
      {!isProductSimilarCell && (
        <ActionsSection
          product={product}
          t={t}
          isProductInCart={quantity !== 0}
        />
      )}
      <button
        className="product-cell__content-link"
        onClick={openProduct}
        data-testid="open-product-detail"
        aria-label={getAriaLabelForProductCell(product)}
      >
        <NewArrivalLabel product={product} />
        <div className="product-cell__image-wrapper">
          <CustomImg
            placeHolder={placeholder}
            error={unavailable}
            src={product.thumbnail}
            alt={product.display_name}
          />
          <span className="product-cell__image-overlay"></span>
        </div>
        <div className="product-cell__info">
          <h4
            className="subhead1-r product-cell__description-name"
            data-testid="product-cell-name"
          >
            {product.display_name}
          </h4>
          <ProductFormat product={product} />
          <ProductPrice priceInstructions={priceInstructions} />
        </div>
      </button>
      {Product.isWater(product) ? (
        <>
          <ProductQuantityButtonWithExtraWater
            productId={product.id}
            priceInstructions={product.price_instructions}
            recommendedQuantity={product.recommendedQuantity}
            quantity={quantity}
            theme={GRID_THEME}
            size="small"
            addProductToCart={addProductToCart}
            decreaseProductFromCart={decreaseProductFromCart}
          />
        </>
      ) : (
        <>
          <ProductQuantityButton
            productId={product.id}
            priceInstructions={product.price_instructions}
            recommendedQuantity={product.recommendedQuantity}
            quantity={quantity}
            theme={GRID_THEME}
            size="small"
            addProductToCart={addProductToCart}
            decreaseProductFromCart={decreaseProductFromCart}
          />
        </>
      )}
    </div>
  )
}

ProductCell.defaultProps = {
  style: {},
}

ProductCell.propTypes = {
  product: ProductPropTypes,
  orderLine: shape({
    quantity: number,
  }),
  style: object,
  addProductToCart: func.isRequired,
  decreaseProductFromCart: func.isRequired,
  openProduct: func,
  t: func.isRequired,
  isProductSimilarCell: bool,
}

const ProductCellWithRouter = compose(withRouter, withTranslate)(ProductCell)

export { ProductCellWithRouter as ProductCell }
