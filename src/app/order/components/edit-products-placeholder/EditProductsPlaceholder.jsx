import searchNoResultsImage from './assets/search@2x.png'
import PropTypes from 'prop-types'

import { withTranslate } from 'app/i18n/containers/i18n-provider'

import './assets/EditProductsPlaceholder.css'

const EditProductsPlaceholder = ({ t }) => (
  <div className="edit-products-placeholder">
    <img
      className="edit-products-placeholder__img"
      src={searchNoResultsImage}
      alt=""
    />
    <p className="headline1-r edit-products-placeholder__message">
      {t('user_area.edit_order.placeholder')}
    </p>
  </div>
)

EditProductsPlaceholder.propTypes = {
  t: PropTypes.func.isRequired,
}

export const PlainEditProductsPlaceholder = EditProductsPlaceholder

export default withTranslate(EditProductsPlaceholder)
