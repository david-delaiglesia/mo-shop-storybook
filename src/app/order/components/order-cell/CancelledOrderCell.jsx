import { withRouter } from 'react-router-dom'

import OrderCell from './OrderCell'
import { viewProducts } from './utils'
import PropTypes from 'prop-types'

import { compose } from '@mercadona/mo.library.dashtil'
import { Button } from '@mercadona/mo.library.shop-ui/button/Button'

import { withTranslate } from 'app/i18n/containers/i18n-provider'
import { capitalizeString } from 'utils/strings'

const CancelledOrderCell = ({
  id,
  orderId,
  price,
  repeat,
  approxPrice,
  history,
  t,
}) => (
  <OrderCell
    statusName="cancelled"
    orderId={orderId}
    price={price}
    approxPrice={approxPrice}
    id={id}
    titleNode={
      <h1 className="order-cell__title body1-sb">
        {t('commons.order.cancelled')}
      </h1>
    }
    statusNode={
      <span className="order-cell__status caption2-b order-cell__status--cancelled">
        {capitalizeString(t('commons.order.cancelled'))}
      </span>
    }
    actionsNode={
      <Button
        variant="tertiary"
        size="small"
        icon="products"
        onClick={viewProducts(orderId, history)}
      >
        {t('view_products')}
      </Button>
    }
    secondaryActionsNode={
      <Button variant="secondary" size="small" onClick={repeat}>
        {t('button.repeat_order')}
      </Button>
    }
  />
)

CancelledOrderCell.propTypes = {
  id: PropTypes.number.isRequired,
  orderId: PropTypes.number.isRequired,
  price: PropTypes.string.isRequired,
  repeat: PropTypes.func.isRequired,
  approxPrice: PropTypes.bool,
  history: PropTypes.object,
  t: PropTypes.func.isRequired,
}

export const PlainCancelledOrderCell = CancelledOrderCell

export default compose(withTranslate, withRouter)(CancelledOrderCell)
