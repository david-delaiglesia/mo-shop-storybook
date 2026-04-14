import { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { matchPath, useHistory, useLocation, useParams } from 'react-router-dom'

import { number, object, string } from 'prop-types'

import { createThunk } from '@mercadona/mo.library.dashtil'

import {
  addProductToCartAndUpdate,
  decreaseProductFromCartAndUpdate,
} from 'app/cart/commands'
import { setProductModalProductToShow } from 'app/catalog/actions'
import { ProductCell } from 'app/catalog/components/product-cell'
import {
  LAYOUTS,
  SOURCES,
  sendAddProductToCartMetrics,
  sendDecreaseProductFromCartMetrics,
} from 'app/catalog/metrics'
import { SearchClient } from 'app/search/client'
import { hideAlert, showAlert } from 'app/shared/alert/actions'
import {
  sendEditPurchaseContinueUnavailableDayProductAlertClickMetrics,
  sendEditPurchaseUnavailableDayProductAlertViewMetrics,
} from 'app/shared/metrics'
import { useModalContext } from 'app/shared/modal'
import { ProductMetricsContext } from 'app/shared/product-metrics-context'
import { showSuggestLoginDialog } from 'app/shared/suggest-login-dialog'
import { Cart, CartService } from 'domain/cart'
import { ProductPropTypes, ProductService } from 'domain/product'
import { useSearchParams } from 'hooks/useSearchParams'
import { PATHS, URL_PARAMS } from 'pages/paths'
import { knownFeatureFlags, useFlag } from 'services/feature-flags'
import { getEnglishShortWeekDay } from 'utils/dates'

const ProductCellContainer = ({
  product,
  warehouse,
  style,
  order,
  orderContext,
}) => {
  const { sourceCode, source, layout, sectionPosition, sectionId, categoryId } =
    useContext(ProductMetricsContext)
  const ModalService = useModalContext()
  const { cart, search, session } = useSelector(
    ({ cart, search, session }) => ({ cart, search, session }),
  )
  const dispatch = useDispatch()
  const history = useHistory()
  const location = useLocation()
  const params = useParams()
  const isAddProductClickPayloadEnabled = useFlag(
    knownFeatureFlags.WEB_ADD_PRODUCT_CLICK_PAYLOAD,
  )
  const isXsellingAddProductClickPageEnabled = useFlag(
    knownFeatureFlags.WEB_XSELLING_ADD_PRODUCT_CLICK_PAGE,
  )
  const isProductDetailViewPayloadEnabled = useFlag(
    knownFeatureFlags.WEB_PRODUCT_DETAIL_VIEW_PAYLOAD,
  )
  const isHomePath = Boolean(
    matchPath(location.pathname, { path: PATHS.HOME, exact: true }) ||
    matchPath(location.pathname, { path: PATHS.HELP }),
  )
  const isSeasonPath = Boolean(
    matchPath(location.pathname, { path: PATHS.SEASON }),
  )
  const isCategoryPath = Boolean(
    matchPath(location.pathname, { path: PATHS.CATEGORY }) ||
    (matchPath(location.pathname, { path: PATHS.EDIT_ORDER_PRODUCTS }) &&
      Boolean(categoryId)),
  )
  const { t } = useTranslation()

  const { searchParams } = useSearchParams()

  const pageContext = (() => {
    const commonProperties = {
      position: order,
      sectionPosition,
    }
    if (isXsellingAddProductClickPageEnabled && source === SOURCES.XSELLING) {
      return {
        page: 'product-detail',
        section: source,
        ...commonProperties,
      }
    }
    if (isHomePath || isSeasonPath) {
      return {
        page: isHomePath ? 'home' : source,
        section: source,
        ...commonProperties,
      }
    }
    if (isCategoryPath && categoryId && sectionId) {
      return {
        page: `category-${categoryId}`,
        section: `category-${sectionId}`,
        ...commonProperties,
      }
    }
    return {}
  })()

  const openProduct = () => {
    const campaign = searchParams.get(URL_PARAMS.CAMPAIGN)
    const context = isProductDetailViewPayloadEnabled ? pageContext : {}

    dispatch(
      setProductModalProductToShow(
        product.id,
        product.slug,
        source,
        sourceCode,
        warehouse,
        layout,
        campaign,
        context.page,
        context.section,
        context.position,
        context.sectionPosition,
      ),
    )

    if (source === SOURCES.SEARCH) {
      SearchClient.sendClickMetrics(search, product, warehouse)
    }
  }

  const addProductToCart = () => {
    const extraProperties = isAddProductClickPayloadEnabled ? pageContext : {}

    sendAddProductToCartMetrics({
      product,
      cart,
      source,
      layout: layout || LAYOUTS.CELL,
      order,
      search,
      currentPath: history.location.pathname,
      ...extraProperties,
    })

    if (Cart.isEmpty(cart) && !session.isAuth) {
      showSuggestLoginDialog(
        ModalService.showModalLegacy,
        ModalService.hideModal,
        t,
        history,
      )
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

    const { id } = params
    dispatch(
      createThunk(addProductToCartAndUpdate)({
        product,
        sourceCode,
        id,
      }),
    )
  }

  const decreaseProductFromCart = () => {
    const { id } = params
    const extraProperties = isAddProductClickPayloadEnabled ? pageContext : {}

    sendDecreaseProductFromCartMetrics({
      product,
      cart,
      source,
      layout: layout || LAYOUTS.CELL,
      currentPath: history.location.pathname,
      ...extraProperties,
    })
    dispatch(
      createThunk(decreaseProductFromCartAndUpdate)({
        product,
        sourceCode,
        id,
      }),
    )
  }

  if (!product) {
    return null
  }

  const orderLine = CartService.getOrderLine(cart, product.id)

  return (
    <ProductCell
      product={product}
      orderLine={orderLine}
      addProductToCart={addProductToCart}
      decreaseProductFromCart={decreaseProductFromCart}
      openProduct={openProduct}
      style={style}
    />
  )
}

ProductCellContainer.propTypes = {
  product: ProductPropTypes,
  warehouse: string.isRequired,
  style: object.isRequired,
  order: number,
  orderContext: object,
}

export { ProductCellContainer }
