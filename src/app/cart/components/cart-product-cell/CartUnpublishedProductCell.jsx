import { Fragment, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'

import { string } from 'prop-types'

import { createThunk } from '@mercadona/mo.library.dashtil'
import { Icon } from '@mercadona/mo.library.shop-ui/icon'

import {
  getAriaLabelForRemoveProductFromCart,
  getAriaLabelForUnpublishedProduct,
} from 'app/accessibility'
import {
  removeProductFromCartAndUpdate,
  substituteProductFromCartAndUpdate,
} from 'app/cart/commands'
import { SOURCES } from 'app/cart/metrics'
import { getSimilarProductsAndUpdate } from 'app/catalog/commands'
import { CartProductSimilar } from 'app/catalog/components/product-similar'
import {
  LAYOUTS,
  sendFinishSubstitutionMetric,
  sendRemoveProductFromCartMetrics,
  sendStartSubstitutionMetric,
} from 'app/catalog/metrics'
import orderEditedImage from 'app/order/containers/order-detail-container/assets/order-edited@2x.png'
import { showAlert } from 'app/shared/alert/actions'
import Modal from 'components/modal'
import { ProductPropTypes } from 'domain/product'
import { knownFeatureFlags, useFlag } from 'services/feature-flags'
import unavailableImg from 'system-ui/assets/img/unavailable.jpg'
import { TAB_INDEX } from 'utils/constants'

import './CartProductCell.css'

const CartUnpublishedProductCell = ({ product, warehouse }) => {
  const [similarProducts, setSimilarProducts] = useState([])
  const cart = useSelector(({ cart }) => cart)
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const isCartProductThumbnailFallbackEnabled = useFlag(
    knownFeatureFlags.WEB_CART_PRODUCT_THUMBNAIL_FALLBACK,
  )

  const removeProduct = () => {
    sendRemoveProductFromCartMetrics({
      product,
      cart,
      source: SOURCES.CART,
      layout: LAYOUTS.CELL,
    })
    const removeProductFromCart = createThunk(removeProductFromCartAndUpdate)
    dispatch(removeProductFromCart(product))
  }

  const openSimilar = async () => {
    const cartProductIds = Object.keys(cart.products)
    sendStartSubstitutionMetric(product.id, cart.id, SOURCES.CART)

    const getSimilarProducts = createThunk(getSimilarProductsAndUpdate)
    const similarProducts = await dispatch(
      getSimilarProducts(product.id, warehouse, cartProductIds.join(',')),
    )

    if (!similarProducts) {
      showNoSimilarProductsAlert()
      return
    }

    setSimilarProducts(similarProducts)
  }

  const showNoSimilarProductsAlert = () => {
    sendFinishSubstitutionMetric({
      choices: [],
      productId: product.id,
      cartId: cart.id,
      source: SOURCES.CART,
    })
    dispatch(
      showAlert({
        title: 'substitutions_empty_state_title',
        description: 'substitutions_empty_state_subtitle',
        confirmButtonText: 'button.ok',
      }),
    )
  }

  const closeSimilar = () => {
    const similarProductIds = similarProducts.map(({ id }) => id)
    sendFinishSubstitutionMetric({
      choices: similarProductIds,
      productId: product.id,
      cartId: cart.id,
      source: SOURCES.CART,
    })
    setSimilarProducts([])
  }

  const confirmSubstitution = (alternativeCart) => {
    const substitutionConfirmedAlertOptions = {
      title: 'substitutions_completed_alert_title',
      imageSrc: orderEditedImage,
    }
    dispatch(showAlert(substitutionConfirmedAlertOptions))
    setSimilarProducts([])

    const substituteCartProducts = createThunk(
      substituteProductFromCartAndUpdate,
    )
    dispatch(substituteCartProducts(alternativeCart, product))
  }

  return (
    <Fragment>
      {similarProducts.length > 0 && (
        <Modal>
          <CartProductSimilar
            product={product}
            warehouse={warehouse}
            similarProducts={similarProducts}
            onCancel={closeSimilar}
            confirmSubstitution={confirmSubstitution}
          />
        </Modal>
      )}
      <div
        className="cart-product-cell cart-unpublished-product-cell"
        data-testid="cart-product-cell"
      >
        <img
          alt={product.display_name}
          src={product.thumbnail}
          className="cart-product-cell__image cart-unpublished-product-cell__image"
          onError={
            isCartProductThumbnailFallbackEnabled
              ? (e) => {
                  e.currentTarget.onerror = null
                  e.currentTarget.src = unavailableImg
                }
              : undefined
          }
        />
        <div className="cart-product-cell__info">
          <p
            aria-label={getAriaLabelForUnpublishedProduct(product)}
            tabIndex={TAB_INDEX.ENABLED}
            className="subhead1-r cart-unpublished-product-cell__product-name"
          >
            {product.display_name}
          </p>
          <p
            aria-hidden={true}
            className="footnote1-r cart-unpublished__description"
          >
            {t('product_empty_case_title')}
          </p>
          <div className="cart-product-cell__actions">
            <button
              aria-label={t('substitution_see_alternatives_button')}
              className="subhead1-r cart-product-cell__similar"
              onClick={openSimilar}
            >
              {t('substitution_see_alternatives_button')}
            </button>
            <button
              className="cart-unpublished-product-cell__remove"
              aria-label={getAriaLabelForRemoveProductFromCart(
                1,
                product.price_instructions,
              )}
              onClick={removeProduct}
            >
              <Icon icon="delete-28" />
            </button>
          </div>
        </div>
      </div>
    </Fragment>
  )
}

CartUnpublishedProductCell.propTypes = {
  product: ProductPropTypes,
  warehouse: string.isRequired,
}

export { CartUnpublishedProductCell }
