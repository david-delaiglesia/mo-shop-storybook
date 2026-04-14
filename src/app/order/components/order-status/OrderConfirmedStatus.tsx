import { Trans, useTranslation } from 'react-i18next'

import { Countdown } from '../countdown'
import { OrderStatusProgressBar } from './components/OrderStatusProgressBar'

import { type Order } from 'app/order'
import { Order as OrderUtils } from 'domain/order'
import { useId } from 'hooks/useId'
import { TAB_INDEX } from 'utils/constants'
import { getNumberDay, getStringMonthDay } from 'utils/dates'
import { DateTime } from 'utils/slots'

import './OrderStatus.css'

interface OrderConfirmedStatusProps {
  order: Order
}

export const OrderConfirmedStatus = ({ order }: OrderConfirmedStatusProps) => {
  const { t } = useTranslation()
  const id = useId()

  const formattedTime = DateTime.getTimePlusOneMinute(
    order.changesUntil,
    order.timezone,
  )

  const confirmedDate = {
    time: formattedTime,
    day: getNumberDay(order.changesUntil),
    month: getStringMonthDay(order.changesUntil),
  }

  const shouldDisplayCountdown =
    OrderUtils.isLessThan24HoursAwayFromCutoff(order)
  const isMorningCutOff = OrderUtils.isMorningCutoff(confirmedDate.time)

  return (
    <div
      className="order-status"
      role="status"
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-description`}
      tabIndex={TAB_INDEX.ENABLED}
    >
      <OrderStatusProgressBar status={order.status} />
      <div className="order-status__content">
        <h6
          id={`${id}-title`}
          className="order-status__content-title headline1-b"
        >
          {t('order.detail.status.confirmed.title')}
        </h6>
        <div
          className="order-status__content-body subhead1-r"
          id={`${id}-description`}
        >
          {shouldDisplayCountdown ? (
            <Countdown
              title={
                <span className="order-status__content-body-message">
                  {t('countdown_remaining_time')}
                </span>
              }
              cutoffTime={order.changesUntil!}
              timezone={order.timezone}
            />
          ) : (
            <p className="order-status__content-body-message">
              <Trans
                t={t}
                i18nKey={
                  isMorningCutOff
                    ? 'order.detail.status.confirmed.body_morning'
                    : 'order.detail.status.confirmed.body'
                }
                components={{
                  b: (
                    <time
                      dateTime={order.changesUntil}
                      className="order-status__content-body-message--bold subhead1-b"
                    />
                  ),
                }}
                values={confirmedDate}
              />
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
