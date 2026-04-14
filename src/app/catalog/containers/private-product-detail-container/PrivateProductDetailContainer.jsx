import { Fragment, useContext } from 'react'
import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'

import { array, bool } from 'prop-types'

import { createThunk } from '@mercadona/mo.library.dashtil'

import cartImage from 'app/assets/repeat-replace@2x.png'
import {
  sendForceLoginPopupAlertCancelClickMetrics,
  sendForceLoginPopupAlertLoginClickMetrics,
  sendForceLoginPopupAlertViewMetrics,
} from 'app/authentication/metrics'
import {
  addProductToCartAndUpdate,
  decreaseProductFromCartAndUpdate,
} from 'app/cart/commands'
import { PrivateProductDetail } from 'app/catalog/components/private-product-detail'
import {
  LAYOUTS,
  sendAddProductToCartMetrics,
  sendDecreaseProductFromCartMetrics,
} from 'app/catalog/metrics'
import { useOrder } from 'app/order/context'
import { hideAlert, showAlert } from 'app/shared/alert/actions'
import {
  sendEditPurchaseContinueUnavailableDayProductAlertClickMetrics,
  sendEditPurchaseUnavailableDayProductAlertViewMetrics,
} from 'app/shared/metrics'
import { useModalContext } from 'app/shared/modal'
import { ProductMetricsContext } from 'app/shared/product-metrics-context'
import { Cart, CartService } from 'domain/cart'
import { ProductPropTypes, ProductService } from 'domain/product'
import { URL_PARAMS } from 'pages/paths'
import { knownFeatureFlags, useFlag } from 'services/feature-flags'
import { getEnglishShortWeekDay } from 'utils/dates'

const PrivateProductDetailContainer = ({
  product,
  editingOrder,
  xSellingProducts,
}) => {
  const { details, photos } = product
  const { sourceCode, source } = useContext(ProductMetricsContext)
  const ModalService = useModalContext()
  const orderContext = useOrder()
  const { cart, search, session } = useSelector(
    ({ cart, search, session }) => ({ cart, search, session }),
  )
  const isProductDetailViewPayloadEnabled = useFlag(
    knownFeatureFlags.WEB_PRODUCT_DETAIL_VIEW_PAYLOAD,
  )

  const campaign = useSelector((state) => {
    return state?.ui?.productModal?.campaign
  })

  const page = useSelector((state) => state?.ui?.productModal?.page)
  const section = useSelector((state) => state?.ui?.productModal?.section)
  const position = useSelector((state) => state?.ui?.productModal?.position)
  const sectionPosition = useSelector(
    (state) => state?.ui?.productModal?.sectionPosition,
  )

  const extraProperties =
    isProductDetailViewPayloadEnabled && page !== undefined
      ? { page, section, position, sectionPosition }
      : {}

  const dispatch = useDispatch()
  const history = useHistory()
  const { t } = useTranslation()

  const hideSuggestLoginDialog = () => {
    sendForceLoginPopupAlertCancelClickMetrics()
    ModalService.hideModal()
  }

  const navigateToLogin = () => {
    sendForceLoginPopupAlertLoginClickMetrics()
    ModalService.hideModal()
    const { location } = history
    const searchParams = new URLSearchParams(location.search)
    searchParams.set(URL_PARAMS.AUTHENTICATE_USER, '')

    history.push(
      { pathname: location.pathname, search: searchParams.toString() },
      { isBeingAuthorizedFromSuggestion: true },
    )
  }

  const showSuggestLoginDialog = () => {
    const options = {
      imageSrc: cartImage,
      title: t('unlogged_alert_title'),
      description: t('unlogged_alert_description'),
      primaryActionText: t('unlogged_alert_login_button'),
      primaryAction: navigateToLogin,
      secondaryActionText: t('unlogged_alert_notnow_button'),
      secondaryAction: hideSuggestLoginDialog,
    }
    sendForceLoginPopupAlertViewMetrics()
    ModalService.showModalLegacy(options)
  }

  const addProductToCart = () => {
    sendAddProductToCartMetrics({
      product,
      cart,
      source,
      layout: LAYOUTS.PRODUCT_DETAIL,
      search,
      currentPath: history.location.pathname,
      campaign,
      ...extraProperties,
    })

    if (Cart.isEmpty(cart) && !session.isAuth) {
      showSuggestLoginDialog()
    }

    if (
      orderContext &&
      ProductService.getBlinkingProductsDayMatch(
        [{ product: { ...product } }],
        orderContext.slot.start,
      ).length
    ) {
      dispatch(
        showAlert({
          title: t('alerts.add_blinking_product.title'),
          description: t('alerts.add_blinking_product.message'),
          confirmButtonText: t('alerts.add_blinking_product.confirm'),
          confirmButtonAction: () => {
            dispatch(hideAlert())
            sendEditPurchaseContinueUnavailableDayProductAlertClickMetrics(
              orderContext.id,
              product.id,
              getEnglishShortWeekDay(orderContext.slot.start).toLowerCase(),
            )
          },
        }),
      )
      sendEditPurchaseUnavailableDayProductAlertViewMetrics(
        orderContext.id,
        product.id,
        getEnglishShortWeekDay(orderContext.slot.start).toLowerCase(),
      )
      return
    }

    dispatch(createThunk(addProductToCartAndUpdate)({ product, sourceCode }))
  }

  const decreaseProductFromCart = () => {
    sendDecreaseProductFromCartMetrics({
      product,
      cart,
      source,
      layout: LAYOUTS.PRODUCT_DETAIL,
      currentPath: history.location.pathname,
      ...extraProperties,
    })
    dispatch(
      createThunk(decreaseProductFromCartAndUpdate)({ product, sourceCode }),
    )
  }

  const orderLine = CartService.getOrderLine(cart, product.id)
  const isCartEmpty = Cart.isEmpty(cart)

  const productHasPhotos = photos && photos.length > 0
  const showBreadcrumb = details && !editingOrder

  return (
    <Fragment>
      <Helmet>
        <meta property="og:url" content={window.location.href} />
        <meta
          property="og:image"
          content={productHasPhotos && photos[0].regular}
        />
        <meta
          property="og:title"
          content={`${product.display_name} | ${
            import.meta.env.VITE_WEBSITE_NAME
          }`}
        />
        <meta
          property="og:description"
          content={t('sharing_preview_description')}
        />
        <title>{`${product.display_name} | ${
          import.meta.env.VITE_WEBSITE_NAME
        }`}</title>
        <meta name="description" content={t('sharing_preview_description')} />
      </Helmet>
      <PrivateProductDetail
        product={product}
        cartId={cart.id}
        showBreadcrumb={showBreadcrumb}
        xSellingProducts={xSellingProducts}
        orderLine={orderLine}
        isCartEmpty={isCartEmpty}
        addProductToCart={addProductToCart}
        decreaseProductFromCart={decreaseProductFromCart}
        showShareProduct
      />
    </Fragment>
  )
}

PrivateProductDetailContainer.propTypes = {
  product: ProductPropTypes,
  editingOrder: bool,
  xSellingProducts: array.isRequired,
}

export { PrivateProductDetailContainer }
