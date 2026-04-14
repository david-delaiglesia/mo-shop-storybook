import { Link } from 'react-router-dom'

import { func } from 'prop-types'

import { Icon } from '@mercadona/mo.library.shop-ui/icon'

import { FocusedElementWithInitialFocus } from 'app/accessibility'
import { withTranslate } from 'app/i18n/containers/i18n-provider'
import {
  sendLastPurchaseEditionClickMetrics,
  sendTicketDownloadClickMetrics,
} from 'app/order/metrics'
import Button, { ButtonWithFeedback } from 'components/button'
import Tooltip from 'components/tooltip'
import { Order, OrderPropTypes } from 'domain/order'
import { Payment } from 'domain/payment'
import { getLocalePrize } from 'utils/maths'

import './OrderDetailHeader.css'

const SOURCE = 'purchase_view'

const OrderDetailHeader = ({
  order,
  getTicket,
  toggleRepeatModal,
  editProducts,
  t,
}) => {
  let priceText = 'commons.order.summary.price'

  if (Order.hasEstimatedPrice(order)) {
    priceText = 'commons.order.summary.price_aprox'
  }

  const getTicketWithMetrics = () => {
    sendTicketDownloadClickMetrics(SOURCE)
    getTicket()
  }

  const isPreparedNotPaidOrder =
    Order.isPrepared(order) && Payment.isPending(order.payment_status)

  return (
    <div className="order-detail-header">
      <div className="order-detail-header__info">
        <p className="order-detail-breadcrumbs-info headline1-r">
          <Link
            className="order-detail-header__link headline1-r"
            to="/user-area/orders"
          >
            {t('user_area.order_detail.title')}
          </Link>
          <Icon icon="chevron-right" />
          <FocusedElementWithInitialFocus>
            <span className="headline1-sb">
              {t('commons.order.order_id', { orderId: order.order_id })}
            </span>
          </FocusedElementWithInitialFocus>
        </p>
        <p className="order-detail-header__price-info subhead1-r">
          {`${t(priceText)} ${getLocalePrize(order.summary.total)} €`}
        </p>
        {order.lastEditMessage && (
          <p
            className="order-detail-header__edit-info subhead1-sb"
            onClick={sendLastPurchaseEditionClickMetrics}
          >
            <Icon icon="check-28" />
            <span>{order.lastEditMessage}</span>
          </p>
        )}
      </div>
      <div className="order-detail-header__buttons">
        {Order.isPrintable(order) && (
          <>
            {isPreparedNotPaidOrder ? (
              <Tooltip
                title={t(
                  'user_area.order_detail.download_ticket.tooltip_title',
                )}
                text={t('user_area.order_detail.download_ticket.tooltip')}
              >
                <div className="order-detail-header__disabled_download-ticket">
                  <p>{t('button.get_ticket')}</p>
                  <Icon icon="download-28" />
                </div>
              </Tooltip>
            ) : (
              <ButtonWithFeedback
                datatest="order-header-detail__download"
                onClick={getTicketWithMetrics}
                text="button.get_ticket"
                icon="download-28"
                type="secondary"
              />
            )}
          </>
        )}
        {Order.isRepeatable(order) && (
          <Button
            onClick={toggleRepeatModal}
            text="button.repeat_order"
            datatest="order-header-detail__repeat"
          />
        )}
        {Order.isEditable(order) && (
          <Button
            onClick={editProducts}
            text="button_edit_purchase"
            datatest="order-header-detail__edit"
          />
        )}
      </div>
    </div>
  )
}

OrderDetailHeader.propTypes = {
  order: OrderPropTypes.isRequired,
  getTicket: func.isRequired,
  toggleRepeatModal: func.isRequired,
  editProducts: func.isRequired,
  t: func.isRequired,
}

const OrderDetailHeaderWithTranslate = withTranslate(OrderDetailHeader)

export { OrderDetailHeaderWithTranslate as OrderDetailHeader }
