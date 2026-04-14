import { Component } from 'react'

import { func, number, shape } from 'prop-types'

import { compose } from '@mercadona/mo.library.dashtil'
import { Icon } from '@mercadona/mo.library.shop-ui/icon/Icon'

import { PrivateProductDetail } from 'app/catalog/components/private-product-detail'
import { withTranslate } from 'app/i18n/containers/i18n-provider'
import { ProductPropTypes } from 'domain/product'

import './ProductSimilar.css'

class ProductSimilarDetail extends Component {
  increaseProduct = () => {
    const { product, increaseProduct } = this.props

    increaseProduct(product)
  }

  decreaseProduct = () => {
    const { product, decreaseProduct } = this.props

    decreaseProduct(product)
  }

  render() {
    const { goBack, product, orderLine, t } = this.props
    return (
      <div
        className="product-similar-detail"
        data-testid="product-similar-detail"
      >
        <div className="product-similar-detail__header">
          <div
            className="subhead1-sb product-similar-detail__back-link"
            onClick={goBack}
          >
            <Icon
              icon="back-28"
              className="product-similar-detail__back-button"
            />
            {t('substitution_back_button')}
          </div>
        </div>
        <PrivateProductDetail
          product={product}
          orderLine={orderLine}
          addProductToCart={this.increaseProduct}
          decreaseProductFromCart={this.decreaseProduct}
        />
      </div>
    )
  }
}

ProductSimilarDetail.propTypes = {
  product: ProductPropTypes.isRequired,
  orderLine: shape({
    quantity: number,
  }).isRequired,
  goBack: func.isRequired,
  increaseProduct: func.isRequired,
  decreaseProduct: func.isRequired,
  t: func.isRequired,
}

const ComposedProductSimilarDetail =
  compose(withTranslate)(ProductSimilarDetail)

export { ComposedProductSimilarDetail as ProductSimilarDetail }
