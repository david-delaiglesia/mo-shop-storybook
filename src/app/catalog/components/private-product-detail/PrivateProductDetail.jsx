import { useEffect, useState } from 'react'
import { withRouter } from 'react-router-dom'

import { ProductBreadcrumb } from './ProductBreadcrumb'
import ageWarning from './assets/18.svg'
import { useUser } from './useUser'
import { array, bool, func, number, shape } from 'prop-types'

import { compose } from '@mercadona/mo.library.dashtil'

import { FocusedElementWithInitialFocus } from 'app/accessibility'
import { PrivateProductUnavailability } from 'app/catalog/components/private-product-unavailability'
import { ProductCarousel } from 'app/catalog/components/product-carousel'
import { ProductFormat } from 'app/catalog/components/product-format'
import { ProductGallery } from 'app/catalog/components/product-gallery'
import { ProductPrice } from 'app/catalog/components/product-price'
import {
  ProductQuantityButton,
  ProductQuantityButtonWithExtraWater,
} from 'app/catalog/components/product-quantity-button'
import { ShareProduct } from 'app/catalog/components/share-product'
import {
  LAYOUTS,
  SOURCES,
  SOURCE_CODES,
  addCampaignToUserProperties,
} from 'app/catalog/metrics'
import { withTranslate } from 'app/i18n/containers/i18n-provider'
import { ProductPropTypes } from 'domain/product'
import { PATHS } from 'pages/paths'
import { interpolatePath } from 'pages/routing'
import { TAB_INDEX } from 'utils/constants'
import { DETAIL_THEME } from 'utils/products'

import './styles/PrivateProductDetail.css'

const getProductQuantity = (orderLine) => {
  if (!orderLine) {
    return 0
  }

  return orderLine.quantity
}

const getProductQuantityButton = ({ is_water }) => {
  if (is_water) {
    return ProductQuantityButtonWithExtraWater
  }

  return ProductQuantityButton
}

const renderExtraInfo = (extraInfo) => {
  if (!extraInfo || !extraInfo[0]) return null

  return (
    <div className="private-product-detail__extra-info">
      {extraInfo.map((value, index) => (
        <p key={index}>{value}</p>
      ))}
    </div>
  )
}

const renderCounterInfo = (details) => {
  if (!details || !details.counter_info) return null

  return (
    <p className="private-product-detail__counter-info">
      {details.counter_info}
    </p>
  )
}

const onBreadcrumbClick =
  ({ history, categories }) =>
  (subCategoryId) => {
    if (!categories) return

    const path = interpolatePath(PATHS.CATEGORY, { id: subCategoryId })

    history.push(path)
  }

const extractTextWithoutHTML = (htmlString) => {
  const doc = new DOMParser().parseFromString(htmlString, 'text/html')
  return doc.body.textContent || ''
}

const handleHTMLExistingValue = (key, text, t) => {
  return text
    ? t(key, {
        variable: extractTextWithoutHTML(text),
      })
    : ''
}
const handleTextExistingValue = (key, text, t) => {
  return text
    ? t(key, {
        variable: text,
      })
    : ''
}

const concatenateWithSpaces = (...args) => {
  const nonEmptyArgs = args.filter((arg) => arg)

  if (!nonEmptyArgs) {
    return ''
  }

  return nonEmptyArgs.join('. ')
}

const handleNutritionString = (product, t) => {
  if (!product.nutrition_information) return product.display_name

  const allergens = handleHTMLExistingValue(
    'product_detail_allergens',
    product.nutrition_information.allergens,
    t,
  )

  const ingredients = handleHTMLExistingValue(
    'product_detail_ingredients',
    product.nutrition_information.ingredients,
    t,
  )

  const origin = handleTextExistingValue(
    'product_detail_origin',
    product.origin,
    t,
  )
  const storageInstructions = handleTextExistingValue(
    'product_detail_storage_instruction',
    product.details.storage_instructions,
    t,
  )
  const usageInstructions = handleTextExistingValue(
    'product_detail_use_instructions',
    product.details.usage_instructions,
    t,
  )

  return concatenateWithSpaces(
    product.display_name,
    allergens,
    ingredients,
    storageInstructions,
    usageInstructions,
    origin,
  )
}

function includesValidCategories(obj, value) {
  return obj[value]
}

const PrivateProductDetail = ({
  product,
  showBreadcrumb,
  showShareProduct,
  xSellingProducts,
  orderLine,
  addProductToCart,
  decreaseProductFromCart,
  history,
  t,
}) => {
  const [productState, setProductState] = useState(null)
  const user = useUser()

  useEffect(() => {
    if (!product.categories) return
    if (includesValidCategories(product.categories[0], 'categories')) {
      setProductState(product)
    }
  }, [product])

  useEffect(() => {
    addCampaignToUserProperties()
  }, [])

  if (!productState) return null

  const {
    display_name,
    details,
    id,
    price_instructions,
    unavailable_weekdays,
    unavailable_from,
    extra_info,
    badges,
    categories,
  } = productState

  const ProductQuantityButtonComponent = getProductQuantityButton(badges)
  const productQuantity = getProductQuantity(orderLine)
  const priceInstructions =
    orderLine?.priceInstructions || product.price_instructions

  const isUserLoggedIn = user.id !== undefined

  return (
    <div
      className="private-product-detail"
      data-testid="private-product-detail"
    >
      {showBreadcrumb && (
        <div className="private-product-detail__header">
          <ProductBreadcrumb
            categories={categories}
            onClick={() => onBreadcrumbClick({ history, categories })}
          />
          {showShareProduct && <ShareProduct product={product} />}
        </div>
      )}
      <div className="private-product-detail__content">
        <FocusedElementWithInitialFocus>
          <div
            className="private-product-detail__left"
            role="image"
            aria-label={handleNutritionString(product, t)}
            tabIndex={TAB_INDEX.ENABLED}
          >
            <ProductGallery
              key={product.id}
              {...product}
              alt={`${t('accessibility_product_detail_image')} ${display_name}`}
              className="private-product-detail__image"
            />
          </div>
        </FocusedElementWithInitialFocus>
        <div
          className="private-product-detail__right"
          data-testid="private-product-detail-info"
        >
          <h1
            className="title2-b private-product-detail__description"
            aria-hidden={true}
          >
            {details ? details.description : display_name}
          </h1>

          <ProductFormat
            product={product}
            isExtended={true}
            tabIndex={TAB_INDEX.ENABLED}
          />
          <ProductPrice
            priceInstructions={priceInstructions}
            isDetail
            product={product}
            shouldDisplayTheAddToListButton={isUserLoggedIn}
            tabIndex={TAB_INDEX.ENABLED}
          />

          <div className="private-product-detail__button">
            <ProductQuantityButtonComponent
              productId={id}
              priceInstructions={price_instructions}
              quantity={productQuantity}
              theme={DETAIL_THEME}
              addProductToCart={addProductToCart}
              decreaseProductFromCart={decreaseProductFromCart}
            />
          </div>

          {renderExtraInfo(extra_info)}

          {renderCounterInfo(details)}

          <PrivateProductUnavailability
            t={t}
            unavailable_weekdays={unavailable_weekdays}
            unavailable_from={unavailable_from}
          />

          {badges && badges.requires_age_check && (
            <div className="private-product-detail__age_check">
              <img alt="" src={ageWarning}></img>
              <label className="caption2-sb">
                {t('product_detail.age_warning')}
              </label>
            </div>
          )}
        </div>
        {xSellingProducts.length > 0 && (
          <ProductCarousel
            products={xSellingProducts}
            source={SOURCES.XSELLING}
            sourceCode={SOURCE_CODES.XSELLING}
            layout={LAYOUTS.CAROUSEL}
          />
        )}
        <p tabIndex={TAB_INDEX.ENABLED} className="private-product__disclaimer">
          {t('product_detail.disclaimer')}
        </p>
      </div>
    </div>
  )
}

PrivateProductDetail.propTypes = {
  product: ProductPropTypes.isRequired,
  orderLine: shape({
    quantity: number,
  }),
  addProductToCart: func.isRequired,
  decreaseProductFromCart: func.isRequired,
  showBreadcrumb: bool,
  showShareProduct: bool,
  xSellingProducts: array,
  unavailable_weekdays: array,
  history: shape({
    push: func.isRequired,
  }).isRequired,
  t: func.isRequired,
}

PrivateProductDetail.defaultProps = {
  showBreadcrumb: false,
  showShareProduct: false,
  xSellingProducts: [],
}

const ComposedPrivateProductDetail = compose(
  withRouter,
  withTranslate,
)(PrivateProductDetail)

export { ComposedPrivateProductDetail as PrivateProductDetail }
