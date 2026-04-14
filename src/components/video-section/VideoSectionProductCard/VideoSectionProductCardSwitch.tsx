import { useContext } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { matchPath, useHistory, useParams } from 'react-router-dom'

import { VideoSectionProductCard } from './VideoSectionProductCard'

import { createThunk } from '@mercadona/mo.library.dashtil'

import {
  addProductToCartAndUpdate,
  decreaseProductFromCartAndUpdate,
} from 'app/cart/commands'
import { setProductModalProductToShow } from 'app/catalog/actions'
import {
  sendAddProductToCartMetrics,
  sendDecreaseProductFromCartMetrics,
} from 'app/catalog/metrics'
import { useOrder } from 'app/order/context'
import { ProductMetricsContext } from 'app/shared/product-metrics-context'
import { CartService } from 'domain/cart'
import { Product } from 'domain/product'
import { PATHS } from 'pages/paths'
import { knownFeatureFlags, useFlag } from 'services/feature-flags'
import { Session } from 'services/session'
import { withRecommendation } from 'wrappers/recommendation-provider'

interface VideoSectionProductCardSwitchProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  product: any
  order: number
}

const VideoSectionProductCardSwitchBase = ({
  product,
  order,
}: VideoSectionProductCardSwitchProps) => {
  const { sourceCode, source, layout, sectionPosition } = useContext(
    ProductMetricsContext,
  )
  // @ts-expect-error TODO we need to type the store
  const { cart, search } = useSelector(({ cart, search }) => ({ cart, search }))
  const dispatch = useDispatch()
  const history = useHistory()
  const params = useParams<{ id?: string }>()
  const orderContext = useOrder()
  const warehouse = orderContext?.warehouse || Session.get().warehouse

  const isAddProductClickPayloadEnabled = useFlag(
    knownFeatureFlags.WEB_ADD_PRODUCT_CLICK_PAYLOAD,
  )
  const isProductDetailViewPayloadEnabled = useFlag(
    knownFeatureFlags.WEB_PRODUCT_DETAIL_VIEW_PAYLOAD,
  )
  const isHomePath = Boolean(
    matchPath(history.location.pathname, { path: PATHS.HOME, exact: true }),
  )

  const pageContext =
    isAddProductClickPayloadEnabled && isHomePath
      ? {
          page: 'home',
          section: source,
          position: order,
          sectionPosition,
        }
      : {
          page: undefined,
          section: undefined,
          position: undefined,
          sectionPosition: undefined,
        }

  if (
    !product ||
    !Product.isPublished(product) ||
    Product.isOutOfStock(product)
  ) {
    return null
  }

  const orderLine = CartService.getOrderLine(cart, product.id)

  const addProductToCart = () => {
    sendAddProductToCartMetrics({
      product,
      cart,
      source,
      layout: layout,
      order,
      search,
      currentPath: history.location.pathname,
      campaign: undefined,
      ...pageContext,
    })
    dispatch(
      createThunk(addProductToCartAndUpdate)({
        product,
        sourceCode,
        id: params.id,
      }),
    )
  }

  const decreaseProductFromCart = () => {
    sendDecreaseProductFromCartMetrics({
      product,
      cart,
      source,
      layout: layout,
      currentPath: history.location.pathname,
      ...pageContext,
    })
    dispatch(
      createThunk(decreaseProductFromCartAndUpdate)({
        product,
        sourceCode,
        id: params.id,
      }),
    )
  }

  const productDetailContext =
    isProductDetailViewPayloadEnabled && isHomePath
      ? {
          page: 'home',
          section: source,
          position: order,
          sectionPosition,
        }
      : {
          page: undefined,
          section: undefined,
          position: undefined,
          sectionPosition: undefined,
        }

  const openProduct = () => {
    dispatch(
      setProductModalProductToShow(
        product.id,
        product.slug,
        source,
        sourceCode,
        warehouse,
        layout,
        undefined,
        productDetailContext.page,
        productDetailContext.section,
        productDetailContext.position,
        productDetailContext.sectionPosition,
      ),
    )
  }

  return (
    <VideoSectionProductCard
      product={product}
      orderLine={orderLine}
      addProductToCart={addProductToCart}
      decreaseProductFromCart={decreaseProductFromCart}
      openProduct={openProduct}
    />
  )
}

const VideoSectionProductCardSwitch = withRecommendation(
  VideoSectionProductCardSwitchBase,
)

export { VideoSectionProductCardSwitch }
