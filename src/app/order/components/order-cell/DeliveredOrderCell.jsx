import { Fragment } from 'react'
import { withRouter } from 'react-router-dom'

import OrderCell from './OrderCell'
import { viewProducts } from './utils'
import PropTypes from 'prop-types'

import { compose } from '@mercadona/mo.library.dashtil'
import { Button } from '@mercadona/mo.library.shop-ui/button/Button'

import { withTranslate } from 'app/i18n/containers/i18n-provider'
import { getDay } from 'utils/dates'
import { capitalizeString } from 'utils/strings'

const DeliveredOrderCell = ({
  id,
  orderId,
  price,
  deliveryDate,
  repeat,
  getTicket,
  approxPrice,
  history,
  t,
}) => {
  const deliveredDate = {
    date: getDay(deliveryDate, 'D [de] MMMM'),
  }

  return (
    <OrderCell
      statusName="delivered"
      orderId={orderId}
      price={price}
      id={id}
      approxPrice={approxPrice}
      titleNode={
        <h1 className="order-cell__title body1-sb">
          {t('cells.order.delivered_date', deliveredDate)}
        </h1>
      }
      statusNode={
        <span className="order-cell__status caption2-b order-cell__status--delivered">
          {capitalizeString(t('commons.order.delivered'))}
        </span>
      }
      actionsNode={
        <Fragment>
          <Button
            variant="tertiary"
            size="small"
            icon="download"
            loadingText={t('aria_loading')}
            handleLoading={true}
            onClick={getTicket}
          >
            {t('button.get_ticket')}
          </Button>
          <Button
            variant="tertiary"
            size="small"
            icon="products"
            onClick={viewProducts(orderId, history)}
          >
            {t('view_products')}
          </Button>
        </Fragment>
      }
      secondaryActionsNode={
        <Button variant="secondary" size="small" onClick={repeat}>
          {t('button.repeat_order')}
        </Button>
      }
    />
  )
}

DeliveredOrderCell.propTypes = {
  repeat: PropTypes.func.isRequired,
  getTicket: PropTypes.func.isRequired,
  id: PropTypes.number.isRequired,
  orderId: PropTypes.number.isRequired,
  price: PropTypes.string.isRequired,
  deliveryDate: PropTypes.string.isRequired,
  approxPrice: PropTypes.bool,
  history: PropTypes.object,
  t: PropTypes.func.isRequired,
}

export const PlainDeliveredOrderCell = DeliveredOrderCell

export default compose(withTranslate, withRouter)(DeliveredOrderCell)
