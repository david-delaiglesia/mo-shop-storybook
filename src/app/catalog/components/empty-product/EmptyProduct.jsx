import { Component } from 'react'

import notAvailableProductImage from './assets/product_not_available.png'
import classNames from 'classnames'
import { bool, func, string } from 'prop-types'

import { compose } from '@mercadona/mo.library.dashtil'

import { withTranslate } from 'app/i18n/containers/i18n-provider'
import Button from 'components/button'
import { IconLink } from 'components/icon-link'
import { PATHS } from 'pages/paths'
import { Tracker } from 'services/tracker'

import './styles/EmptyProduct.css'

class EmptyProduct extends Component {
  componentDidMount() {
    const { productId } = this.props
    Tracker.sendViewChange('product_empty_case', { product_id: productId })
  }

  render() {
    const { inModal, onLinkClick, t } = this.props
    const className = classNames('empty-product', {
      'empty-product--modal': inModal,
    })

    return (
      <div className={className}>
        <img
          alt={t('accessibility_product_empty_case_image')}
          className="modal-info__image"
          src={notAvailableProductImage}
        />
        <p className="empty-product__title" data-testid="empty-product-title">
          {t('product_empty_case_title')}
        </p>
        <p
          className="empty-product__subtitle"
          data-testid="empty-product-subtitle"
        >
          {t('product_empty_case_subtitle')}
        </p>
        {inModal ? (
          <Button
            onClick={onLinkClick}
            className="empty-product__button"
            text="product_empty_case_understood_button"
          />
        ) : (
          <IconLink
            pathname={PATHS.HOME}
            className="empty-product__see_products"
            datatest="empty-product-see-products"
            text="product_empty_case_see_products_clicks"
            onLinkClick={onLinkClick}
            icon="chevron-right"
          />
        )}
      </div>
    )
  }
}

EmptyProduct.propTypes = {
  onLinkClick: func,
  productId: string.isRequired,
  inModal: bool,
  t: func.isRequired,
}

EmptyProduct.defaultProps = {
  inModal: false,
}

const composedEmptyProduct = compose(withTranslate)(EmptyProduct)

export { composedEmptyProduct as EmptyProduct }
