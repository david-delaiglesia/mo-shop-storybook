import { Fragment, useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'

import { ProductFormat } from '../product-format'
import { MyEssentialsProductSimilar } from '../product-similar'
import { ActionsSection } from './ActionsSection'
import classNames from 'classnames'
import { number, object, string } from 'prop-types'

import { createThunk } from '@mercadona/mo.library.dashtil'

import { getAriaLabelForUnpublishedProduct } from 'app/accessibility'
import { getSimilarProductsAndUpdate } from 'app/catalog/commands'
import {
  SOURCES,
  sendFinishSubstitutionMetric,
  sendOutOfStockProductClickMetrics,
  sendOutOfStockProductMetrics,
  sendStartSubstitutionMetric,
} from 'app/catalog/metrics'
import { hideAlert, showAlert } from 'app/shared/alert/actions'
import { ProductMetricsContext } from 'app/shared/product-metrics-context'
import { CustomImg } from 'components/custom-img'
import Modal from 'components/modal'
import { ProductPropTypes } from 'domain/product'
import placeholder from 'system-ui/assets/img/placeholder.jpg'
import unavailable from 'system-ui/assets/img/unavailable.jpg'
import { TAB_INDEX } from 'utils/constants'

import './ProductCell.css'

const UNPUBLISHED_CELL_TYPE = 'unPublished'
export const OUT_OF_STOCK = 'outOfStock'

const UnpublishedProductCell = ({
  product,
  warehouse,
  style,
  cellType = UNPUBLISHED_CELL_TYPE,
  order,
}) => {
  const [similarProducts, setSimilarProducts] = useState([])
  const cart = useSelector(({ cart }) => cart)
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const isOutOfStockCell = cellType === OUT_OF_STOCK
  const productMetrics = useContext(ProductMetricsContext)
  const history = useHistory()

  useEffect(() => {
    if (isOutOfStockCell) {
      const { source, layout } = productMetrics

      sendOutOfStockProductMetrics({
        id: product?.id,
        source,
        layout,
        order,
        pathname: history.location.pathname,
      })
    }
  }, [isOutOfStockCell])

  const openSimilar = async () => {
    const cartProductIds = Object.keys(cart.products)
    sendStartSubstitutionMetric(product.id, cart.id, SOURCES.MY_REGULARS)

    const getSimilarProducts = createThunk(getSimilarProductsAndUpdate)
    const similarProducts = await dispatch(
      getSimilarProducts(product.id, warehouse, cartProductIds.join(',')),
    )

    if (!similarProducts) {
      showNoSubstitutionsAlert()
      return
    }
    setSimilarProducts(similarProducts)
  }

  const showNoSubstitutionsAlert = () => {
    const alertOptions = {
      title: 'substitutions_empty_state_title',
      description: 'substitutions_empty_state_subtitle',
      confirmButtonText: 'button.ok',
      confirmButtonAction: () => {
        sendFinishSubstitutionMetric({
          choices: [],
          productId: product.id,
          cartId: cart.id,
          source: SOURCES.MY_REGULARS,
        })
        dispatch(hideAlert())
      },
    }
    dispatch(showAlert(alertOptions))
  }

  const closeSimilar = (options) => {
    const similarProductIds = similarProducts.map(({ id }) => id)
    const optionsWithConverted = options.converted
      ? { converted: options.converted }
      : {}
    sendFinishSubstitutionMetric({
      ...optionsWithConverted,
      choices: similarProductIds,
      productId: product.id,
      cartId: cart.id,
      source: SOURCES.MY_REGULARS,
    })
    setSimilarProducts([])
  }

  return (
    <Fragment>
      {similarProducts.length > 0 && (
        <Modal>
          <MyEssentialsProductSimilar
            product={product}
            warehouse={warehouse}
            similarProducts={similarProducts}
            onClose={closeSimilar}
          />
        </Modal>
      )}
      <div
        data-testid="product-cell"
        className={classNames('product-cell product-cell--unpublished', {
          'product-cell--actionable': !isOutOfStockCell,
        })}
        style={style}
        onClick={() => {
          if (isOutOfStockCell) {
            const { source, layout } = productMetrics

            sendOutOfStockProductClickMetrics({
              id: product?.id,
              source,
              layout,
              order,
              pathname: history.location.pathname,
            })
          }
        }}
      >
        <ActionsSection product={product} t={t} isPublished={false} />
        <div className="product-cell__image-wrapper" aria-hidden="true">
          <CustomImg
            placeHolder={placeholder}
            error={unavailable}
            src={product.thumbnail}
            alt={product.display_name}
          />
          <span className="product-cell__image-overlay"></span>
        </div>
        <div
          className="product-cell__info"
          aria-label={getAriaLabelForUnpublishedProduct(product)}
          tabIndex={TAB_INDEX.ENABLED}
        >
          <h4
            className="subhead1-r product-cell__description-name"
            data-testid="product-cell-name"
          >
            {product.display_name}
          </h4>

          <ProductFormat product={product} />
          <p className="subhead1-b unpublished-product-cell__price-fallback">
            {isOutOfStockCell
              ? t('out_of_stock.message')
              : t('unpublished_cell_title')}
          </p>
        </div>
        {!isOutOfStockCell && (
          <button
            aria-label={t('substitution_see_alternatives_button')}
            className="subhead1-r unpublished-product-cell__similar"
            onClick={openSimilar}
          >
            {t('substitution_see_alternatives_button')}
          </button>
        )}
      </div>
    </Fragment>
  )
}

UnpublishedProductCell.propTypes = {
  product: ProductPropTypes,
  warehouse: string.isRequired,
  style: object.isRequired,
  cellType: string,
  order: number,
}

export { UnpublishedProductCell }
