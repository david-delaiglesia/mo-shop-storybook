import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

import { Icon } from '@mercadona/mo.library.shop-ui/icon/Icon'

import {
  AriaLive,
  getAriaLabelForApproximatePrice,
  useAccessibleTooltip,
} from 'app/accessibility'
import { getCart } from 'app/cart/selectors'
import { FreeDelivery } from 'app/free-delivery'
import { useOrder } from 'app/order/context'
import Tooltip from 'components/tooltip'
import { Cart } from 'domain/cart'
import { TAB_INDEX } from 'utils/constants'
import { getLocalePrize } from 'utils/maths'

import './styles/EditOrderProductsSummary.css'

const EditOrderProductsSummary = () => {
  const cart = useSelector(getCart)
  const order = useOrder()
  const { t } = useTranslation()

  const subtotal = Cart.getTotal(cart)
  const slotBonus = order.summary.slot_bonus
  const total = slotBonus ? subtotal : subtotal + parseFloat(order.summary.slot)

  const amountProductsAriaLabel = `${t('user_area.edit_order.products_price')} ${getLocalePrize(subtotal)} €`

  const serviceCostPrice = slotBonus
    ? getLocalePrize(slotBonus)
    : getLocalePrize(order.summary.slot)
  const serviceCostAriaLabel = `${t('user_area.edit_order.delivery_price')} ${serviceCostPrice} €`

  const estimatedCost = `${getLocalePrize(total)} €`
  const estimatedCostAriaLabel = getAriaLabelForApproximatePrice(estimatedCost)

  const tooltipText = t('tooltip.price_message')

  const { readTooltip, tooltipTextAriaLive } = useAccessibleTooltip(tooltipText)

  return (
    <div className="edit-order-products-summary">
      <AriaLive text={tooltipTextAriaLive} />
      <span
        className="edit-order-products-summary__subtotal"
        aria-label={amountProductsAriaLabel}
        tabIndex={TAB_INDEX.ENABLED}
      >
        <p aria-hidden={true} className="subhead1-sb">
          {t('user_area.edit_order.products_price')}
        </p>
        <p
          aria-hidden={true}
          className="subhead1-b"
        >{`${getLocalePrize(subtotal)} € `}</p>
      </span>
      <span
        aria-label={serviceCostAriaLabel}
        tabIndex={TAB_INDEX.ENABLED}
        className="edit-order-products-summary__delivery"
      >
        <p className="subhead1-sb" aria-hidden={true}>
          {t('user_area.edit_order.delivery_price')}
        </p>
        <FreeDelivery
          slotBonus={slotBonus}
          delivery={order.summary.slot}
          textClassName="subhead1-b"
        />
      </span>
      <div
        data-testid="edit-order-price-tooltip"
        className="edit-order-products-summary__total"
        tabIndex={TAB_INDEX.ENABLED}
        aria-label={estimatedCostAriaLabel}
        onKeyDown={readTooltip}
      >
        <Tooltip text={tooltipText} tooltipPosition={'left'} aria-hidden={true}>
          <Icon icon="info" />
        </Tooltip>
        <p aria-hidden={true} className="subhead1-sb">
          {t('user_area.edit_order.price')}
        </p>
        <span
          aria-hidden={true}
          aria-label="estimated cost"
          className="title2-b"
        >
          {estimatedCost}
        </span>
      </div>
    </div>
  )
}

export { EditOrderProductsSummary }
