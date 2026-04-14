import { useTranslation } from 'react-i18next'

import { Icon } from '@mercadona/mo.library.shop-ui/icon'

import { FreeDelivery } from 'app/free-delivery'
import { Order } from 'app/order'
import { sendPriceDetailClickMetrics } from 'app/order/metrics'
import { SummaryTaxes } from 'app/taxes-summary'
import Tooltip from 'components/tooltip'
import { Order as OrderUtils } from 'domain/order'
import { TAB_INDEX } from 'utils/constants'
import { getLocalePrize } from 'utils/maths'

import './OrderSummary.css'

interface OrderSummaryProps {
  order: Order
}

export const OrderSummary = ({ order }: OrderSummaryProps) => {
  const { t } = useTranslation()
  const { summary, productsCount: numberOfProductsInCart } = order
  let priceText = 'commons.order.summary.price'
  const slotBonus = summary.slot_bonus

  if (OrderUtils.hasEstimatedPrice(order)) {
    priceText = 'commons.order.summary.price_aprox'
  }

  const DeliveryPrice = () => {
    return (
      <div tabIndex={TAB_INDEX.ENABLED}>
        <span
          className={`order-summary__delivery ${
            slotBonus && 'order-summary__delivery-bonus'
          }`}
        >
          <p className="subhead1-sb">{t('commons.order.summary.delivery')}</p>
          <FreeDelivery
            slotBonus={slotBonus}
            delivery={summary.slot}
            textClassName="subhead1-sb"
          />
        </span>
        {slotBonus && (
          <p className="order-summary__subtotals-subtitle caption2-sb">
            {t('summary_discount_subtitle')}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="order-summary">
      <div className="order-summary__detail">
        <div className="order-summary__subtotal" tabIndex={TAB_INDEX.ENABLED}>
          <span className="order-summary__products">
            <p className="subhead1-sb">
              {t('commons.order.summary.products_price')}
            </p>
            <p className="subhead1-sb">{getLocalePrize(summary.products)} €</p>
          </span>
          <p className="caption2-sb">
            {t('commons.order.summary.products_counter', {
              count: numberOfProductsInCart,
            })}
          </p>
        </div>
        <DeliveryPrice />
      </div>
      <span className="order-summary__total" tabIndex={TAB_INDEX.ENABLED}>
        <p className="subhead1-sb">{t(priceText)}</p>
        {OrderUtils.hasEstimatedPrice(order) && (
          <Tooltip
            text={t('tooltip.price_message')}
            tooltipPosition="left"
            onMouseEnter={sendPriceDetailClickMetrics}
          >
            <Icon
              icon="info"
              aria-hidden="true"
              data-testid="estimated-cost-tooltip"
            />
          </Tooltip>
        )}
        <p className="subhead1-sb">{getLocalePrize(summary.total)} €</p>
      </span>
      <SummaryTaxes summary={order.summary} />
    </div>
  )
}
