import { withTranslate } from '../../../i18n/containers/i18n-provider'
import { func, number, string } from 'prop-types'

import { getAriaLabelForCartQuantity } from 'app/accessibility'
import { TAB_INDEX } from 'utils/constants'

import './styles/ProductFeedback.css'

const ProductFeedback = ({ size, text, t, quantity }) => {
  const titleSize = size ? 'title2' : 'title1'
  const textClass = text.length >= 9 ? `${titleSize}-c-b` : `${titleSize}-b`

  const isTabEnabled = quantity > 0
  const tabIndex = isTabEnabled ? TAB_INDEX.ENABLED : TAB_INDEX.DISABLED

  return (
    <div
      tabIndex={tabIndex}
      className="product-feedback"
      aria-label={getAriaLabelForCartQuantity(text)}
    >
      <label
        aria-hidden="true"
        className="product-feedback__cart-text footnote1-r"
      >
        {t('commons.product.in_cart')}
      </label>
      <label
        className={`product-feedback__add-counter ${textClass}`}
        data-testid="product-feedback__quantity"
        aria-hidden="true"
      >
        {text}
      </label>
    </div>
  )
}

ProductFeedback.propTypes = {
  text: string.isRequired,
  quantity: number.isRequired,
  size: string,
  t: func.isRequired,
}

export const PlainProductFeedback = ProductFeedback

export default withTranslate(ProductFeedback)
