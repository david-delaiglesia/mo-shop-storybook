import classNames from 'classnames'
import { arrayOf, bool, func } from 'prop-types'

import { compose } from '@mercadona/mo.library.dashtil'
import { Icon } from '@mercadona/mo.library.shop-ui/icon/Icon'

import {
  FocusedElementWithInitialFocus,
  getAriaLabelForUnpublishedProductAlternatives,
} from 'app/accessibility'
import { ProductSimilarCell } from 'app/catalog/components/product-cell'
import { ProductFormat } from 'app/catalog/components/product-format'
import { SOURCES } from 'app/catalog/metrics'
import { withTranslate } from 'app/i18n/containers/i18n-provider'
import { ButtonV2 } from 'components/button'
import { Cart, CartPropTypes } from 'domain/cart'
import { ProductPropTypes } from 'domain/product'

import './ProductSimilar.css'

const ProductSimilar = ({
  cart,
  product,
  similarProducts,
  onCancel,
  onClose,
  increaseProduct,
  decreaseProduct,
  openProductDetail,
  confirmSubstitutionCart,
  inMyEssentials = false,
  t,
}) => {
  const titleClassName = classNames('title2-b', {
    'product-similar__essentials-title': inMyEssentials,
    'product-similar__alternatives-title': !inMyEssentials,
  })

  const similarCount = similarProducts.length
  const alternativesClassName = classNames(
    'product-similar__alternatives',
    inMyEssentials && 'product-similar__alternatives--essentials',
  )
  const source = inMyEssentials
    ? SOURCES.SIMILAR_MY_REGULARS
    : SOURCES.SIMILAR_CART

  return (
    <div className="product-similar">
      <div className="product-similar__content">
        <div className="product-similar__product">
          <img
            aria-hidden={true}
            alt={`${t('accessibility_product_detail_image')} ${
              product.display_name
            }`}
            src={product.thumbnail}
            className="product-similar__product-image"
          />
          <div className="product-similar__product-info">
            <h2 className="product-similar__product-title title2-b">
              {t('unpublished_cell_title')}
            </h2>
            <p className="product-similar__product-name body1-r">
              {product.display_name}
            </p>
            <ProductFormat
              product={product}
              className="product-similar__product-format subhead1-r"
              showFormat
            />
          </div>
          <span className="product-similar__product-overlay"></span>
        </div>

        <div className="product-similar__alternatives-section">
          {onClose && (
            <div className="product-similar__alternatives-header">
              <button
                type="button"
                className="product-similar__close-icon"
                onClick={onClose}
                aria-label={t('product_detail.aria_close')}
              >
                <Icon icon="close" />
              </button>
            </div>
          )}
          <FocusedElementWithInitialFocus>
            <p
              className={titleClassName}
              aria-label={getAriaLabelForUnpublishedProductAlternatives(
                product,
                similarCount,
              )}
            >
              {t('substitutions_title', {
                similarCount,
                count: similarCount,
              })}
            </p>
          </FocusedElementWithInitialFocus>

          <div
            data-testid="similar-products-list"
            className={alternativesClassName}
          >
            {similarProducts.map((product, index) => (
              <ProductSimilarCell
                key={product.id}
                increaseProduct={increaseProduct}
                decreaseProduct={decreaseProduct}
                openProduct={openProductDetail}
                cart={cart}
                product={product}
                order={index}
                source={source}
              />
            ))}
          </div>
        </div>
      </div>

      {!inMyEssentials && (
        <div className="product-similar__footer">
          <span className="body1-sb" aria-hidden={true}>
            {t('substitutions_explanation_text')}
          </span>
          <div>
            <ButtonV2.Secondary
              onClick={onCancel}
              className="product-similar__cancel-button"
              text="button.cancel"
            />
            <ButtonV2.Primary
              onClick={confirmSubstitutionCart}
              className="product-similar__confirm-button"
              text="button.confirm"
              disabled={Cart.isEmpty(cart)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

ProductSimilar.propTypes = {
  cart: CartPropTypes.isRequired,
  product: ProductPropTypes.isRequired,
  similarProducts: arrayOf(ProductPropTypes).isRequired,
  increaseProduct: func.isRequired,
  decreaseProduct: func.isRequired,
  openProductDetail: func.isRequired,
  inMyEssentials: bool,
  onCancel: func,
  onClose: func,
  confirmSubstitutionCart: func,
  t: func.isRequired,
}

const ComposedProductSimilar = compose(withTranslate)(ProductSimilar)

export { ComposedProductSimilar as ProductSimilar }
