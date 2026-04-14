import { useEffect, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { useHistory } from 'react-router'

import { Button } from '@mercadona/mo.library.shop-ui/button'
import { Card } from '@mercadona/mo.library.shop-ui/card'

import { OrderMetrics } from 'app/order/OrderMetrics'
import { EarlierCutoffDisclaimer } from 'app/order/components/earlier-cutoff-disclaimer'
import { useOrderContext } from 'app/order/contexts/OrderContext'
import {
  useOrderConfirmationDetails,
  useOrderEarlierCutoff,
} from 'app/order/hooks'
import { PaymentTimingModal } from 'app/payment'
import { useUser } from 'app/user'
import { Address as AddressUtils } from 'domain/address'
import { useId } from 'hooks/useId'
import { PATHS } from 'pages/paths'
import { Cache } from 'services/cache'
import checkImage from 'system-ui/assets/img/check.png'
import { Divider } from 'system-ui/divider'
import { formatCurrency } from 'utils/currency'
import { getLongDayName, getNumberDay, getStringMonthDay } from 'utils/dates'
import { DateTime } from 'utils/slots'
import { capitalizeFirstLetter } from 'utils/strings'

import './OrderConfirmedCard.css'

const getDeliveryDate = (startSlotDate: string) => ({
  weekDay: capitalizeFirstLetter(getLongDayName(startSlotDate)),
  monthDay: getNumberDay(startSlotDate),
  month: getStringMonthDay(startSlotDate),
})

export const OrderConfirmedCard = () => {
  const id = useId()
  const { t, i18n } = useTranslation()
  const history = useHistory()

  const { order } = useOrderContext()
  const { user } = useUser()
  const { isEarlierCutoff } = useOrderEarlierCutoff(order?.id)
  const { orderConfirmationDetails } = useOrderConfirmationDetails(order?.id)

  const [showEarlierCutoffDialog, setShowEarlierCutoffDialog] = useState(false)
  const [showPaymentTimingModal, setShowPaymentTimingModal] = useState(false)

  useEffect(() => {
    if (order) {
      OrderMetrics.orderConfirmationView({
        orderId: order.id,
        price: order.summary.total,
      })
    }
  }, [order])

  useEffect(() => {
    if (orderConfirmationDetails?.showPaymentTimingModal) {
      setTimeout(() => {
        setShowPaymentTimingModal(true)
      }, 500)
    }
  }, [orderConfirmationDetails?.showPaymentTimingModal])

  if (!order) {
    return null
  }

  const goToHome = () => {
    history.push({ pathname: PATHS.HOME })
    Cache.clearAndReload()
  }

  const handleGoToHome = () => {
    OrderMetrics.orderConfirmationOkClick({ orderId: order.id })
    if (isEarlierCutoff) {
      setShowEarlierCutoffDialog(true)
      return
    }

    goToHome()
  }

  return (
    <>
      <Card
        as="section"
        aria-labelledby={`${id}-title`}
        padding={5}
        className="order-confirmed-card"
      >
        <div className="order-confirmed-card__header">
          <img src={checkImage} width={123} />
          <h2 className="large-b">{t('commons.thanks')}</h2>
          <h1
            id={`${id}-title`}
            className="headline1-r order-confirmed-card__title"
          >
            <Trans
              t={t}
              i18nKey={'order_confirmed.title'}
              values={{ orderId: order.id }}
              components={{
                a: <span className="headline1-sb" />,
              }}
            />
          </h1>
          <p className="body1-r order-confirmed-card__subtitle">
            {t('order_confirmed.check_email', { email: user.email })}
          </p>

          <Divider />
        </div>

        <dl className="order-confirmed-card__summary">
          <div className="order-confirmed-card__summary-item">
            <dt id={`${id}-aprox-price`}>
              {t('commons.order.aprox_price')}
              <small className="caption1-sb">
                {t('commons.order.summary.variable-price-weight-products')}
              </small>
            </dt>
            <dd aria-labelledby={`${id}-aprox-price`} className="body1-b">
              {formatCurrency(Number(order.summary.total), i18n.language)}
            </dd>
          </div>

          <div className="order-confirmed-card__summary-item">
            <dt id={`${id}-delivery`}>{t('order_confirmed.delivery')}</dt>
            <dd aria-labelledby={`${id}-delivery`} className="body1-b">
              <p className="order-confirmed-card__delivery-time">
                {t(
                  'commons.order.order_delivery.delivery_date.date',
                  getDeliveryDate(order.slot.start),
                )}{' '}
                {t('commons.order.order_delivery.delivery_date.time', {
                  startTime: DateTime.getFormattedTime(
                    order.slot.start,
                    order.slot.timezone,
                  ),
                  endTime: DateTime.getFormattedTime(
                    order.slot.end,
                    order.slot.timezone,
                  ),
                })}
              </p>
              <p>
                {order.address.address}
                <br />
                {order.address.detail && (
                  <>
                    {order.address.detail}
                    <br />
                  </>
                )}
                {AddressUtils.getDeliveryTown(order.address)}
              </p>
            </dd>
          </div>
        </dl>

        <Button onClick={handleGoToHome}>{t('button.ok')}</Button>
      </Card>

      {showEarlierCutoffDialog && (
        <EarlierCutoffDisclaimer
          orderId={order.id}
          orderChangeUntil={order.changesUntil}
          timezone={order.timezone}
          onAcknowledge={goToHome}
        />
      )}

      {showPaymentTimingModal && (
        <PaymentTimingModal onClick={() => setShowPaymentTimingModal(false)} />
      )}
    </>
  )
}
