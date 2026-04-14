import { getCartMode } from './metrics-utils'
import { monitoring } from 'monitoring'

import { SearchClient } from 'app/search/client'
import { Cart, CartService } from 'domain/cart'
import { Product } from 'domain/product'
import { URL_PARAMS } from 'pages/paths'
import { knownFeatureFlags } from 'services/feature-flags'
import { unleashClient } from 'services/feature-flags/FeatureFlagsProvider'
import { Session } from 'services/session'
import { Tracker } from 'services/tracker'

export const EVENTS = {
  ADD_PRODUCT_CLICK: 'add_product_click',
  DECREASE_PRODUCT_CLICK: 'decrease_product_click',
  REMOVE_FROM_CART_CLICK: 'remove_from_cart_click',
  PRODUCT_EMPTY_CASE_CLICK: 'product_empty_case_click',
  START_SUBSTITUTION_CLICK: 'start_substitution_click',
  FINISH_SUBSTITUTION_CLICK: 'finish_substitution_click',
  HOME_SECTION_CLICK: 'home_section_click',
  CATEGORY_CLICK: 'category_click',
  CATEGORY_NEXT_BUTTON_CLICK: 'category_next_button_click',
  ZOOM_IMAGE_CLICK: 'zoom_image_click',
  OUT_OF_STOCK_PRODUCT_CLICK: 'out_of_stock_product_click',
  PRODUCT_DETAIL_VIEW: 'product_detail_view',
}

export const VIEWS = {
  OUT_OF_STOCK_PRODUCT: 'out_of_stock_product',
}

export const SOURCES = {
  HOME: 'home',
  CATEGORY: 'category',
  XSELLING: 'xselling',
  SEARCH: 'search',
  SEASON: 'season',
  MY_REGULARS: 'my_regulars',
  SIMILAR_MY_REGULARS: 'similar_my_products',
  SIMILAR_CART: 'similar_cart',
  CART: 'cart',
  HOME_RECOMMENDATIONS: 'home_recommendations',
  SHOPPING_LIST: 'shopping_list',
}

export const SOURCE_CODES = {
  SEASON: 'SN',
  SEARCH: 'SA',
  CATEGORIES: 'CT',
  CART: 'CA',
  MY_REGULARS: 'MR',
  SIMILAR_MY_REGULARS: 'SR',
  SIMILAR_CART: 'SC',
  XSELLING: 'XS',
  PRODUCT_LINK: 'PL',
  SHOPPING_LIST: 'SL',
}

export const CART_MODE = {
  EDIT: 'edit',
  PURCHASE: 'purchase',
  MERGE: 'merge',
}

const SELLING_METHOD = {
  0: 'units',
  1: 'bunch',
}

export const LAYOUTS = {
  CELL: 'cell',
  LIST: 'list',
  GRID: 'grid',
  CAROUSEL: 'carousel',
  PRODUCT_DETAIL: 'product_detail',
  HIGHLIGHTED: 'highlighted',
  VIDEO: 'video',
}

export const HOME_SECTION_TYPES = {
  HERO_BANNER: 'hero_banner',
  AUT_CARROUSEL: 'aut_carrousel',
  PRODUCT_HIGHLIGHTED: 'product_highlighted',
  VIDEO_SECTION: 'video_section',
}

export function sendSeasonViewMetrics(id) {
  Tracker.sendViewChange(SOURCES.SEASON, { season_id: parseInt(id) })
}

export function sendHomeRecommendationsViewMetrics() {
  Tracker.sendViewChange(SOURCES.HOME_RECOMMENDATIONS)
}

export function sendCategoryClickMetrics({ id, name }) {
  Tracker.sendInteraction(EVENTS.CATEGORY_CLICK, { id, name })
}
export function sendHomeSectionClickMetrics({
  id,
  title,
  campaignId,
  homeSectionType,
}) {
  Tracker.sendInteraction(EVENTS.HOME_SECTION_CLICK, {
    id,
    title,
    campaign_id: campaignId,
    home_section_type: homeSectionType,
  })
}

export function sendStartSubstitutionMetric(productId, cartId, source) {
  Tracker.sendInteraction(EVENTS.START_SUBSTITUTION_CLICK, {
    source,
    product_id: productId,
    cart_id: cartId,
  })
}

const defaultIncrementAmount = 1

function getCleanedFinishSubstitutionsOptions({
  converted,
  choices,
  productId,
  cartId,
  source,
}) {
  const options = {
    converted,
    source,
    product_id: productId,
    cart_id: cartId,
  }

  if (choices.length > 0) {
    return {
      ...options,
      choices,
    }
  }

  return options
}

export function sendFinishSubstitutionMetric(options) {
  const optionsCleaned = getCleanedFinishSubstitutionsOptions(options)
  Tracker.sendInteraction(EVENTS.FINISH_SUBSTITUTION_CLICK, optionsCleaned)
}

export function sendProductEmptyClickMetrics() {
  Tracker.sendInteraction(EVENTS.PRODUCT_EMPTY_CASE_CLICK)
}

export function addCampaignToUserProperties() {
  const searchParams = new URLSearchParams(location.search)
  const campaignId = searchParams.get(URL_PARAMS.CAMPAIGN)

  if (campaignId) {
    Tracker.setUserProperties({ campaign: campaignId })
  }
}

export function sendAddProductToCartMetrics({
  product,
  cart,
  source,
  order,
  layout,
  search,
  currentPath,
  campaign,
  page,
  section,
  position,
  sectionPosition,
}) {
  const { recommendedQuantity } = product
  const orderLine = CartService.getOrderLine(cart, product.id)
  const options = generateProductCellClickOptions({
    product,
    orderLine,
    cart,
    source,
    order,
    layout,
    currentPath,
  })
  const { amount } = options
  const addedAmount = orderLine
    ? defaultIncrementAmount
    : calculateAddedAmount(product)
  const metricsOption = {
    ...options,
    ...(recommendedQuantity ? { added_quantity: recommendedQuantity } : {}),
    added_amount: addedAmount,
    first_product: Cart.isEmpty(cart),
  }

  if (source === SOURCES.SEARCH) {
    metricsOption.query = search.query
  }

  try {
    const searchParams = new URLSearchParams(location.search)
    const campaignId = searchParams.get(URL_PARAMS.CAMPAIGN)

    if (campaignId) {
      metricsOption.campaign = campaignId
    }
    if (campaign) {
      metricsOption.campaign = campaign
    }
  } catch {
    // TODO remove the try catch after validating that this error is not happening
    monitoring.captureError(
      new Error(
        'tracking the campaign is failing for the event add_product_click',
      ),
    )
  }

  if (page !== undefined) {
    metricsOption.page = page
    metricsOption.section = section
    metricsOption.position = position
    metricsOption.section_position = sectionPosition
  }

  Tracker.sendInteraction(EVENTS.ADD_PRODUCT_CLICK, metricsOption)

  if (source === SOURCES.SEARCH && amount === 0) {
    const { warehouse } = Session.get()

    SearchClient.sendConversionMetrics(search, product, warehouse)
  }

  if (source !== SOURCES.SEARCH && amount === 0) {
    const { warehouse } = Session.get()
    SearchClient.sendConversionWithoutSearchMetrics(product, warehouse)
  }
}

export function sendDecreaseProductFromCartMetrics({
  product,
  cart,
  source,
  layout,
  currentPath,
  page,
  section,
  position,
  sectionPosition,
}) {
  const orderLine = CartService.getOrderLine(cart, product.id)
  const options = generateProductCellClickOptions({
    product,
    orderLine,
    cart,
    source,
    layout,
    currentPath,
  })

  const extraProperties =
    page !== undefined
      ? { page, section, position, section_position: sectionPosition }
      : {}

  Tracker.sendInteraction(EVENTS.DECREASE_PRODUCT_CLICK, {
    ...options,
    decreased_amount: 1,
    ...extraProperties,
  })
}

export function sendRemoveProductFromCartMetrics({
  product,
  cart,
  source,
  layout,
  currentPath,
}) {
  const orderLine = CartService.getOrderLine(cart, product.id)
  const options = generateProductCellClickOptions({
    product,
    orderLine,
    cart,
    source,
    layout,
    currentPath,
  })

  Tracker.sendInteraction(EVENTS.REMOVE_FROM_CART_CLICK, options)
}

const getSource = (source) => {
  if (source === SOURCES.CATEGORY) {
    return 'categories'
  }

  return source
}

function generateProductCellClickOptions({
  product,
  orderLine,
  cart,
  source,
  order,
  layout,
  currentPath,
}) {
  const firstProductProperty = {
    first_product_added_at: new Date().toISOString(),
  }
  const isCartEmpty = Cart.isEmpty(cart)

  const isPriceNumberFormatEnabled = unleashClient.isEnabled(
    knownFeatureFlags.WEB_MO_ANALYTICS_PRICE_NUMBER_FORMAT,
  )

  const { id, display_name, badges } = product
  const selling_method = Product.getSellingMethod(product)
  const amount = orderLine ? orderLine.quantity : 0
  const price = isPriceNumberFormatEnabled
    ? Product.getRawPrice(product)
    : Product.getPrice(product)
  const hasOrder = order !== undefined
  const cartMode = getCartMode(currentPath)

  const isNewArrival = source === 'category' && product.is_new_arrival

  return {
    id,
    merca_code: id,
    display_name,
    selling_method: SELLING_METHOD[selling_method],
    amount,
    price,
    ...(hasOrder ? { order } : {}),
    source: getSource(source),
    ...(isCartEmpty ? firstProductProperty : {}),
    cart_id: cart.id,
    layout,
    requires_age_check: badges.requires_age_check,
    cart_mode: cartMode,
    ...(isNewArrival ? { tag_new_arrival: true } : {}),
  }
}

export function sendCategoryNextButtonClickMetrics({
  categoryId,
  nextSubcategory,
}) {
  const options = {
    source_id: categoryId,
    destination_id: nextSubcategory.id,
  }
  Tracker.sendInteraction(EVENTS.CATEGORY_NEXT_BUTTON_CLICK, options)
}

export const sendProductDetailViewMetrics = ({
  product,
  source,
  page,
  section,
  position,
  sectionPosition,
}) => {
  const isProductDetailViewPayloadEnabled = unleashClient.isEnabled(
    knownFeatureFlags.WEB_PRODUCT_DETAIL_VIEW_PAYLOAD,
  )
  const isNewArrival = source === 'category' && product.is_new_arrival

  if (isProductDetailViewPayloadEnabled) {
    const options = {
      product_id: product.id,
      merca_code: product.id,
      display_name: product.display_name,
      source,
      ...(isNewArrival ? { tag_new_arrival: true } : {}),
      ...(page !== undefined
        ? { page, section, position, section_position: sectionPosition }
        : {}),
    }
    Tracker.sendInteraction(EVENTS.PRODUCT_DETAIL_VIEW, options)
    return
  }

  const options = {
    product_id: product.id,
    display_name: product.display_name,
    source,
    ...(isNewArrival ? { tag_new_arrival: true } : {}),
  }
  Tracker.sendViewChange('product_detail', options)
}

export function sendZoomImageClickMetrics({
  id,
  displayName,
  selectedImage,
  position,
}) {
  const options = {
    id,
    display_name: displayName,
    picture_name: selectedImage,
    position,
  }
  Tracker.sendInteraction(EVENTS.ZOOM_IMAGE_CLICK, options)
}

function calculateAddedAmount(product) {
  const increment_amount =
    product.price_instructions.increment_bunch_amount ?? defaultIncrementAmount
  const quantity = product.recommendedQuantity ?? increment_amount

  return Math.round(quantity / increment_amount)
}

export const sendOutOfStockProductMetrics = ({
  id,
  source,
  layout,
  order,
  pathname,
}) => {
  Tracker.sendViewChange(VIEWS.OUT_OF_STOCK_PRODUCT, {
    id,
    source: getSource(source),
    layout,
    order,
    cart_mode: getCartMode(pathname),
  })
}

export const sendOutOfStockProductClickMetrics = ({
  id,
  source,
  layout,
  order,
  pathname,
}) => {
  Tracker.sendInteraction(EVENTS.OUT_OF_STOCK_PRODUCT_CLICK, {
    id,
    source: getSource(source),
    layout,
    order,
    cart_mode: getCartMode(pathname),
  })
}
