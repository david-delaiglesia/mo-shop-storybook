import { Fragment, useEffect } from 'react'

import { func, object } from 'prop-types'

import { sendProductLimitationViewMetrics } from 'app/cart/metrics'
import { withTranslate } from 'app/i18n/containers/i18n-provider'
import { ButtonV2 } from 'components/button'
import { CartService } from 'domain/cart'
import alertImage from 'system-ui/assets/img/default-alert@2x.png'
import { getFeedbackText } from 'utils/products'

import './CartProductAlert.css'

const CartProductAlert = ({
  cart,
  goBackToCart,
  addProductsToOngoingOrder,
  t,
}) => {
  const exceededProducts = CartService.getExceededProducts(cart)

  useEffect(() => {
    sendProductLimitationViewMetrics({
      limit_product_count: exceededProducts.length,
    })
  }, [])

  return (
    <Fragment>
      <div className="cart-product-alert__header">
        <button
          onClick={goBackToCart}
          className="cart-product-alert__back-button"
        >
          <span className="cart-product-alert__back-icon icon icon-back-28"></span>
          <span className="headline1-b">
            {t('product_limitations_back_to_cart')}
          </span>
        </button>
      </div>
      <section className="cart-product-alert__section">
        <img
          className="cart-product-alert__img"
          src={alertImage}
          alt={t('alt_warning_image')}
        />
        <p className="headline1-b cart-product-alert__title">
          {t('product_limitations_title')}
        </p>
        <p className="body1-r">{t('product_limitations_description')}</p>
      </section>
      <div className="cart-product-alert__products">
        {exceededProducts.map(({ product }) => (
          <div
            key={product.id}
            className="cart-product-alert__exceeded-product-cell"
          >
            <img
              src={product.thumbnail}
              alt={product.display_name}
              className="exceeded-product-cell__image"
            />
            <div className="exceeded-product-cell__text">
              <p className="subhead1-r">{product.display_name}</p>
              <p className="subhead1-b">{t('product_limitations_cell')}</p>
            </div>
            <p className="title2-b exceeded-product-cell__units">
              {getFeedbackText(product.limit, product)}
            </p>
          </div>
        ))}
      </div>
      <div className="cart-product-alert__actions">
        <ButtonV2.Secondary
          onClick={goBackToCart}
          text="product_limitations_back_button"
        />
        <ButtonV2.Primary
          onClick={addProductsToOngoingOrder}
          text="product_limitations_continue_button"
        />
      </div>
    </Fragment>
  )
}

CartProductAlert.propTypes = {
  cart: object.isRequired,
  goBackToCart: func.isRequired,
  addProductsToOngoingOrder: func.isRequired,
  t: func,
}

const translatedCartProductAlert = withTranslate(CartProductAlert)

export { translatedCartProductAlert as CartProductAlert }
