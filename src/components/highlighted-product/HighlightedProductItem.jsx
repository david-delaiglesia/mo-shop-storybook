import { useDispatch, useSelector } from 'react-redux'
import { matchPath, useHistory, useLocation, useParams } from 'react-router-dom'

import { func, number, object, string } from 'prop-types'

import { createThunk } from '@mercadona/mo.library.dashtil'

import { getAriaLabelForProductCell } from 'app/accessibility'
import {
  addProductToCartAndUpdate,
  decreaseProductFromCartAndUpdate,
} from 'app/cart/commands'
import { setProductModalProductToShow } from 'app/catalog/actions'
import { ProductFormat } from 'app/catalog/components/product-format'
import { useProductImpression } from 'app/catalog/components/product-impression/useProductImpression'
import { ProductPrice } from 'app/catalog/components/product-price'
import { ProductQuantityButton } from 'app/catalog/components/product-quantity-button/ProductQuantityButton'
import {
  HOME_SECTION_TYPES,
  sendAddProductToCartMetrics,
  sendDecreaseProductFromCartMetrics,
  sendHomeSectionClickMetrics,
} from 'app/catalog/metrics'
import { CART_MODE } from 'app/catalog/metrics'
import { withTranslate } from 'app/i18n/containers/i18n-provider'
import { useModalContext } from 'app/shared/modal'
import { showSuggestLoginDialog } from 'app/shared/suggest-login-dialog'
import { LAYOUT } from 'containers/home-sections/helpers/helpers'
import { Cart, CartService } from 'domain/cart'
import { PATHS } from 'pages/paths'
import { knownFeatureFlags, useFlag } from 'services/feature-flags'
import { Session } from 'services/session'
import { Tracker } from 'services/tracker'
import { TAB_INDEX } from 'utils/constants'
import { getLayoutType } from 'utils/get-layout-type'
import { GRID_THEME } from 'utils/products'

import './styles/HighlightedProductItem.css'

const HighlightedProductItem = ({
  t,
  product,
  webImageUrl,
  mobileImageUrl,
  sourceCode,
  layout,
  source,
  order,
  sectionPosition,
  onProductDetailOpened,
}) => {
  const location = useLocation()

  const isHighlightedGroupEnabled = useFlag(
    knownFeatureFlags.WEB_HIGHLIGHTED_GROUP,
  )
  const isHighlightedGroupResponsiveImagesEnabled = useFlag(
    knownFeatureFlags.WEB_HIGHLIGHTED_GROUP_RESPONSIVE_IMAGES,
  )
  const isMoAnalyticsImpressionsPayloadEnabled = useFlag(
    knownFeatureFlags.WEB_MO_ANALYTICS_IMPRESSIONS_PAYLOAD,
  )
  const isAddProductClickPayloadEnabled = useFlag(
    knownFeatureFlags.WEB_ADD_PRODUCT_CLICK_PAYLOAD,
  )
  const isHomePath = Boolean(
    matchPath(location.pathname, { path: PATHS.HOME, exact: true }) ||
    matchPath(location.pathname, { path: PATHS.HELP }),
  )

  const trackImpression = () => {
    if (isMoAnalyticsImpressionsPayloadEnabled) {
      Tracker.sendInteractionGTAG('impression', {
        merca_code: product.id,
        section: source,
        layout: getLayoutType(layout),
        center_code: Session.get().warehouse,
        page: location.pathname === '/' ? 'home' : source,
        section_position: location.pathname === '/' ? sectionPosition : 0,
        position: order,
        elapsed_time: 1,
        cart_mode: CART_MODE.PURCHASE,
      })
      return
    }
  }

  const { ref } = useProductImpression(trackImpression)

  const dispatch = useDispatch()
  const params = useParams()
  const { cart, session } = useSelector(({ cart, session }) => {
    return { cart, session }
  })
  const orderLine = CartService.getOrderLine(cart, product.id)
  const quantity = Cart.getProductQuantity(orderLine)
  const ModalService = useModalContext()
  const history = useHistory()
  const warehouse = Session.get().warehouse

  const openProductDetail = () => {
    dispatch(
      setProductModalProductToShow(
        product.id,
        product.slug,
        source,
        sourceCode,
        warehouse,
        layout,
      ),
    )

    const options = {
      id: product.id,
      title: product.display_name,
      homeSectionType: HOME_SECTION_TYPES.PRODUCT_HIGHLIGHTED,
    }
    sendHomeSectionClickMetrics(options)

    if (isHighlightedGroupEnabled) {
      onProductDetailOpened()
    }
  }

  const addProductToCart = () => {
    const { id } = params

    dispatch(
      createThunk(addProductToCartAndUpdate)({
        product,
        sourceCode,
        id,
      }),
    )

    sendAddProductToCartMetrics({
      product,
      cart,
      source,
      layout,
      ...(isAddProductClickPayloadEnabled && isHomePath
        ? {
            page: 'home',
            section: source,
            position: order,
            sectionPosition,
          }
        : {}),
    })

    if (Cart.isEmpty(cart) && !session.isAuth) {
      showSuggestLoginDialog(
        ModalService.showModalLegacy,
        ModalService.hideModal,
        t,
        history,
      )
    }
  }

  const decreaseProductFromCart = () => {
    const { id } = params

    dispatch(
      createThunk(decreaseProductFromCartAndUpdate)({
        product,
        sourceCode,
        id,
      }),
    )

    sendDecreaseProductFromCartMetrics({
      product,
      cart,
      source,
      layout,
      ...(isAddProductClickPayloadEnabled && isHomePath
        ? {
            page: 'home',
            section: source,
            position: order,
            sectionPosition,
          }
        : {}),
    })
  }

  return (
    <div ref={ref} className="highlighted-product-item">
      <button
        onClick={openProductDetail}
        aria-label={getAriaLabelForProductCell(product)}
        className="highlighted-product-item__wrapper highlighted-product-item__clickable"
      >
        <div className="highlighted-product-item__left">
          <h6 className="highlighted-product-item__title title1-r">
            {product.display_name}
          </h6>
          <ProductFormat product={product} />
        </div>
        <div className="highlighted-product-item__image-wrapper">
          {isHighlightedGroupResponsiveImagesEnabled &&
            layout === LAYOUT.HIGHLIGHTED_GROUP && (
              <picture>
                <source media="(min-width:992px)" srcSet={webImageUrl} />
                <img
                  src={mobileImageUrl}
                  className="highlighted-product-item__image"
                  aria-label={`imagen del producto ${product.display_name}`}
                />
              </picture>
            )}
          {(!isHighlightedGroupResponsiveImagesEnabled ||
            layout !== LAYOUT.HIGHLIGHTED_GROUP) && (
            <img
              src={webImageUrl}
              className="highlighted-product-item__image"
              aria-label={`imagen del producto ${product.display_name}`}
            />
          )}
        </div>
      </button>
      <div className="highlighted-product-item__add-to-cart-section">
        <button
          tabIndex={TAB_INDEX.DISABLED}
          aria-hidden={true}
          className="highlighted-product-item__clickable"
          onClick={openProductDetail}
        >
          <ProductPrice
            priceInstructions={product.price_instructions}
            isHighlight
          />
        </button>
        <ProductQuantityButton
          productId={product.id}
          size="small"
          addProductToCart={addProductToCart}
          decreaseProductFromCart={decreaseProductFromCart}
          quantity={quantity}
          priceInstructions={product.price_instructions}
          theme={GRID_THEME}
        />
      </div>
    </div>
  )
}

HighlightedProductItem.propTypes = {
  product: object,
  t: func.isRequired,
  webImageUrl: string,
  mobileImageUrl: string,
  sourceCode: string,
  layout: string,
  source: string,
  order: number,
  sectionPosition: number,
  onProductDetailOpened: func,
}

export default withTranslate(HighlightedProductItem)
