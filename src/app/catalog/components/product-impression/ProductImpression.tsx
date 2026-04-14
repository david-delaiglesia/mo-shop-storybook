import { ReactNode, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { matchPath, useLocation } from 'react-router'

import { useProductImpression } from './useProductImpression'

import { useSession } from 'app/authentication'
import { getCartMode } from 'app/catalog/metrics-utils'
import { HomeSectionLayout } from 'app/home'
import { PATHS } from 'pages/paths'
import { useFlag } from 'services/feature-flags'
import { knownFeatureFlags } from 'services/feature-flags/constants'
import { Tracker } from 'services/tracker'
import { getLayoutType } from 'utils/get-layout-type'

interface ProductImpressionProps {
  children: ReactNode
  order: number
  source: string
  productId: string
  layout: HomeSectionLayout
  sectionPosition: number
  categoryId?: number
  sectionId?: number
}

export const ProductImpression = ({
  children,
  order,
  source,
  productId,
  layout,
  sectionPosition,
  categoryId,
  sectionId,
}: ProductImpressionProps) => {
  const isMoAnalyticsImpressionsPayloadEnabled = useFlag(
    knownFeatureFlags.WEB_MO_ANALYTICS_IMPRESSIONS_PAYLOAD,
  )
  const isCategoryImpressionsEnabled = useFlag(
    knownFeatureFlags.WEB_MO_ANALYTICS_CATEGORY_IMPRESSIONS,
  )

  const { warehouse } = useSession()

  const location = useLocation()

  const isHomePath = Boolean(
    matchPath(location.pathname, { path: PATHS.HOME, exact: true }) ||
    matchPath(location.pathname, { path: PATHS.HELP }),
  )

  const isAllowedPath = Boolean(
    isHomePath || matchPath(location.pathname, { path: PATHS.SEASON }),
  )

  const isCategoryPath = Boolean(
    matchPath(location.pathname, { path: PATHS.CATEGORY }) ||
    (matchPath(location.pathname, { path: PATHS.EDIT_ORDER_PRODUCTS }) &&
      Boolean(categoryId)),
  )

  const isHomeGrid = layout === HomeSectionLayout.GRID && isAllowedPath
  const isHomeCarousel = layout === HomeSectionLayout.CAROUSEL && isAllowedPath
  const isHomeVideo = layout === HomeSectionLayout.VIDEO && isAllowedPath
  const isCategoryTrackable = isCategoryPath && isCategoryImpressionsEnabled

  const isTrackable =
    isHomeGrid || isHomeCarousel || isHomeVideo || isCategoryTrackable

  const product = useSelector((state) => {
    // @ts-expect-error TODO we need to type the store in order to get this right
    return state.products[productId]
  })

  const displayName = useRef('')

  useEffect(() => {
    if (!product) {
      return
    }

    displayName.current = product.display_name
  }, [product])

  const trackImpression = () => {
    if (isCategoryTrackable) {
      try {
        Tracker.sendInteractionGTAG('impression', {
          merca_code: productId,
          section: `category-${sectionId}`,
          layout: getLayoutType(layout),
          center_code: warehouse,
          page: `category-${categoryId}`,
          section_position: sectionPosition,
          position: order,
          elapsed_time: 1,
          cart_mode: getCartMode(location.pathname),
        })
      } catch {
        /* empty */
      }
      return
    }

    if (!isMoAnalyticsImpressionsPayloadEnabled) {
      return
    }

    try {
      Tracker.sendInteractionGTAG('impression', {
        merca_code: productId,
        section: source,
        layout: getLayoutType(layout),
        center_code: warehouse,
        page: isHomePath ? 'home' : source,
        section_position: isHomePath ? sectionPosition : 0,
        position: order,
        elapsed_time: 1,
        cart_mode: getCartMode(location.pathname),
      })
    } catch {
      /* empty */
    }
  }

  const { ref } = useProductImpression(trackImpression)

  if (isTrackable) {
    return (
      <div className="product-cell-container" ref={ref}>
        {children}
      </div>
    )
  }

  return <>{children}</>
}
