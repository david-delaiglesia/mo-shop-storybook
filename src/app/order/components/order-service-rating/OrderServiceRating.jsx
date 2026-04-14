import { withTranslate } from '../../../i18n/containers/i18n-provider'
import { func } from 'prop-types'

import { Icon } from '@mercadona/mo.library.shop-ui/icon'

import Button from 'components/button'

import './styles/OrderServiceRating.css'

const OrderServiceRating = ({ rate, t }) => (
  <div className="order-service-rating" data-testid="order-service-rating">
    <div className="order-service-rating__info">
      <Icon icon="feedback-small-28" />
      <p className="headline1-b">{t('service_rating_title')}</p>
    </div>
    <div className="order-service-rating__buttons">
      <Button onClick={rate} text="service_rating_button" />
    </div>
  </div>
)

OrderServiceRating.propTypes = {
  t: func.isRequired,
  rate: func.isRequired,
}

export default withTranslate(OrderServiceRating)
