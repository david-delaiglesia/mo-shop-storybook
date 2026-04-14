import { ORDER_LINE_STATUSES } from './constants'
import { func, string } from 'prop-types'

import { Icon } from '@mercadona/mo.library.shop-ui/icon'

import { withTranslate } from 'app/i18n/containers/i18n-provider'
import { OrderStatusUI } from 'app/order/interfaces'
import Tooltip from 'components/tooltip'

const PreparedUnitsCell = ({
  orderStatus,
  orderLineStatus,
  orderedQuantityWithUnits,
  preparedQuantityWithUnits,
  totalPrice,
  t,
}) => {
  const areIncompleteUnits = orderLineStatus === ORDER_LINE_STATUSES.INCOMPLETE
  const copies = {
    tooltipText:
      orderStatus === OrderStatusUI.DELIVERED
        ? 'order_details_delivered_product_list_missing_items_tooltip_body'
        : 'order_details_not_delivered_product_list_missing_items_tooltip_body',
    tooltipTitle:
      orderStatus === OrderStatusUI.DELIVERED
        ? 'order_details_delivered_product_list_missing_items_tooltip_title'
        : 'order_details_not_delivered_product_list_missing_items_tooltip_title',
  }

  return (
    <div className="prepared-units-cell" data-testid="prepared-units-cell">
      {areIncompleteUnits && (
        <span className="order-product-cell__ordered-units subhead1-r">
          {orderedQuantityWithUnits}
        </span>
      )}
      <span className="order-product-cell__prepared-units subhead1-r">
        {orderLineStatus === ORDER_LINE_STATUSES.PENDING
          ? orderedQuantityWithUnits
          : preparedQuantityWithUnits}
      </span>
      <p className="order-product-cell__price subhead1-r">{totalPrice} €</p>
      {areIncompleteUnits && (
        <Tooltip text={t(copies.tooltipText)} title={t(copies.tooltipTitle)}>
          <Icon icon="info" />
        </Tooltip>
      )}
    </div>
  )
}

PreparedUnitsCell.propTypes = {
  orderStatus: string.isRequired,
  orderLineStatus: string.isRequired,
  orderedQuantityWithUnits: string.isRequired,
  preparedQuantityWithUnits: string.isRequired,
  totalPrice: string.isRequired,
  t: func.isRequired,
}

const ComposedPreparedUnitsCell = withTranslate(PreparedUnitsCell)

export { ComposedPreparedUnitsCell as PreparedUnitsCell }
