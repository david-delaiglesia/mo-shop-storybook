import { Component } from 'react'

import { array, bool, func, shape, string } from 'prop-types'

import { compose } from '@mercadona/mo.library.dashtil'

import { CompactZipChecker } from 'app/catalog/components/compact-zip-checker'
import { addCampaignToUserProperties } from 'app/catalog/metrics'
import { withTranslate } from 'app/i18n/containers/i18n-provider'
import { CustomImg } from 'components/custom-img'
import { Tracker } from 'services/tracker'
import placeholder from 'system-ui/assets/img/placeholder.jpg'
import unavailable from 'system-ui/assets/img/unavailable.jpg'
import { TAB_INDEX } from 'utils/constants'

import './styles/PublicProductDetail.css'

class PublicProductDetail extends Component {
  componentDidMount() {
    const { product } = this.props
    const options = {
      product_id: product.id,
      display_name: product.display_name,
      public_mode: true,
    }

    Tracker.sendViewChange('product_detail', options)
    addCampaignToUserProperties()
  }

  render() {
    const {
      product,
      appNotFound,
      form,
      onSave,
      onChange,
      onKeyPress,
      onClickMetrics,
      t,
    } = this.props

    return (
      <div
        className="public-product-detail"
        data-testid="public-product-detail"
      >
        <div className="public-product-detail__left">
          <div className="public-product-detail__image-overlay"></div>
          <CustomImg
            alt={`${t('accessibility_product_detail_image')} ${
              product.display_name
            }`}
            src={product.photos[0]?.regular}
            thumbnail={product.photos[0]?.thumbnail}
            className="public-product-detail__image"
            error={unavailable}
            placeHolder={placeholder}
            tabIndex={TAB_INDEX.ENABLED}
          />
        </div>

        <div className="public-product-detail__right">
          <h1
            className="title2-r public-product-detail__description"
            tabIndex={TAB_INDEX.ENABLED}
          >
            {product.details.description}
          </h1>

          <CompactZipChecker
            product={product}
            form={form}
            appNotFound={appNotFound}
            onSave={onSave}
            onChange={onChange}
            onKeyPress={onKeyPress}
            onClickMetrics={onClickMetrics}
          />
        </div>

        <p className="public-product__disclaimer">
          {t('product_detail.disclaimer')}
        </p>
      </div>
    )
  }
}

PublicProductDetail.propTypes = {
  product: shape({
    display_name: string.isRequired,
    photos: array.isRequired,
    details: shape({
      description: string.isRequired,
    }).isRequired,
  }).isRequired,
  appNotFound: bool.isRequired,
  form: shape({
    fields: shape({
      postalCode: shape({
        value: string,
        validation: shape({
          message: string,
          type: string.isRequired,
          isDirty: bool.isRequired,
        }).isRequired,
        getValidation: func.isRequired,
      }).isRequired,
    }).isRequired,
    isValid: bool.isRequired,
  }).isRequired,
  onSave: func.isRequired,
  onKeyPress: func.isRequired,
  onChange: func.isRequired,
  onClickMetrics: func.isRequired,
  t: func.isRequired,
  isCampaignUserEventEnabled: bool,
}

const ComposedPublicProductDetail = compose(withTranslate)(PublicProductDetail)

export { ComposedPublicProductDetail as PublicProductDetail }
