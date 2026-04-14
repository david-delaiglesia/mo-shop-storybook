import { NoUnitsCell } from './NoUnitsCell'
import { PreparedUnitsCell } from './PreparedUnitsCell'
import { ORDER_LINE_STATUSES } from './constants'
import classNames from 'classnames'
import { object } from 'prop-types'

import { ProductPropTypes } from 'domain/product'
import { TAB_INDEX } from 'utils/constants'
import { getLocalePrize } from 'utils/maths'
import { getFeedbackText } from 'utils/products'

import './styles/OrderProductCell.css'

const OrderProductCell = ({ order, line, product }) => {
  const { display_name, thumbnail, total } = product
  const {
    orderedQuantity,
    preparedQuantity,
    preparationResult,
    totalPreparedPrice,
  } = line
  const { status: orderStatus } = order

  const orderedQuantityWithUnits = getFeedbackText(orderedQuantity, product)
  const preparedQuantityWithUnits = getFeedbackText(preparedQuantity, product)

  return (
    <li
      className={classNames('order-product-cell', {
        'order-product-cell--disabled':
          preparationResult === ORDER_LINE_STATUSES.NOT_AVAILABLE,
      })}
      data-testid="order-product-cell"
      tabIndex={TAB_INDEX.ENABLED}
    >
      <img className="order-product-cell__image" alt="" src={thumbnail} />
      <div className="order-product-cell__detail">
        <p className="order-product-cell__name subhead1-r">{display_name}</p>
        <div className="order-product-cell__total">
          {preparationResult !== ORDER_LINE_STATUSES.NOT_AVAILABLE ? (
            <PreparedUnitsCell
              orderStatus={orderStatus}
              orderLineStatus={preparationResult}
              orderedQuantityWithUnits={orderedQuantityWithUnits}
              preparedQuantityWithUnits={preparedQuantityWithUnits}
              totalPrice={getLocalePrize(totalPreparedPrice ?? total)}
            />
          ) : (
            <NoUnitsCell orderStatus={orderStatus} />
          )}
        </div>
      </div>
    </li>
  )
}

OrderProductCell.propTypes = {
  order: object.isRequired,
  line: object,
  product: ProductPropTypes,
}

export default OrderProductCell
