import { func, string } from 'prop-types'

import { Icon } from '@mercadona/mo.library.shop-ui/icon'

import { withTranslate } from 'app/i18n/containers/i18n-provider'
import { OrderStatusUI } from 'app/order/interfaces'
import Tooltip from 'components/tooltip'

const NoUnitsCell = ({ orderStatus, t }) => {
  const copies = {
    mainText:
      orderStatus === OrderStatusUI.DELIVERED
        ? 'order_details_delivered_product_list_not_available'
        : 'order_details_not_delivered_product_list_not_available',
    tooltipText:
      orderStatus === OrderStatusUI.DELIVERED
        ? 'order_details_delivered_product_list_not_available_tooltip_body'
        : 'order_details_not_delivered_product_list_not_available_tooltip_body',
    tooltipTitle:
      orderStatus === OrderStatusUI.DELIVERED
        ? 'order_details_delivered_product_list_not_available_tooltip_title'
        : 'order_details_not_delivered_product_list_not_available_tooltip_title',
  }

  return (
    <div data-testid="no-units-cell">
      <span className="order-product-cell__no-units">
        {t(copies.mainText)}
        <Tooltip text={t(copies.tooltipText)} title={t(copies.tooltipTitle)}>
          <Icon icon="info" />
        </Tooltip>
      </span>
    </div>
  )
}

NoUnitsCell.propTypes = {
  orderStatus: string.isRequired,
  t: func.isRequired,
}

const ComposedNoUnitsCell = withTranslate(NoUnitsCell)

export { ComposedNoUnitsCell as NoUnitsCell }
