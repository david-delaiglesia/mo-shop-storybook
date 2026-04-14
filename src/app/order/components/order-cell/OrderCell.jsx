import { Link } from 'react-router-dom'

import { bool, func, node, number, string } from 'prop-types'

import { withTranslate } from 'app/i18n/containers/i18n-provider'
import { Card } from 'system-ui/card'
import { getLocalePrize } from 'utils/maths'

import './styles/OrderCell.css'

const OrderCell = ({
  statusName,
  titleNode,
  statusNode,
  actionsNode,
  secondaryActionsNode,
  id,
  orderId,
  approxPrice = false,
  price,
  t,
}) => {
  let priceType = 'commons.order.final_price'

  if (approxPrice) {
    priceType = 'commons.order.aprox_price'
  }

  return (
    <Card
      hover
      as="article"
      data-testid="order-cell"
      aria-label={`${statusName}-order-cell`}
      className={`order-cell order-cell--${statusName}`}
    >
      <div className="order-cell__details">
        <Link to={`/user-area/orders/${id}`} className="order-cell__link">
          <div>
            {titleNode}
            <p className="order-cell__info">
              <span className="order-cell__products">
                <span className="order-cell__id footnote1-r">
                  {t('commons.order.order_id', { orderId })} ·{' '}
                </span>
                <span className="order-cell__price footnote1-r">
                  {`${t(priceType)} ${getLocalePrize(price)} €`}
                </span>
              </span>
            </p>
          </div>
          {statusNode}
        </Link>
      </div>
      <div className="order-cell__actions-content">
        {actionsNode && (
          <div className="order-cell__primary-actions">{actionsNode}</div>
        )}
        {secondaryActionsNode && (
          <div className="order-cell__secondary-actions">
            {secondaryActionsNode}
          </div>
        )}
      </div>
    </Card>
  )
}

OrderCell.propTypes = {
  statusName: string.isRequired,
  titleNode: node.isRequired,
  statusNode: node.isRequired,
  actionsNode: node,
  secondaryActionsNode: node,
  id: number.isRequired,
  orderId: number.isRequired,
  approxPrice: bool,
  price: string.isRequired,
  t: func.isRequired,
}

export const PlainOrderCell = OrderCell

export default withTranslate(OrderCell)
