import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@mercadona/mo.library.shop-ui/button'

import { Order } from 'app/order'
import {
  sendDifferentCutoffModalAcceptMetrics,
  sendDifferentCutoffModalViewMetrics,
} from 'app/order/metrics'
import Modal from 'components/modal'
import { getLongDayName, getNumberDay, getStringMonthDay } from 'utils/dates'
import { DateTime } from 'utils/slots'

import './EarlierCutoffDisclaimer.css'

interface EarlierCutoffDisclaimerProps {
  orderId: Order['id']
  orderChangeUntil: Order['changesUntil']
  timezone: Order['timezone']
  onAcknowledge: () => void
}

export const EarlierCutoffDisclaimer = ({
  orderId,
  orderChangeUntil,
  timezone,
  onAcknowledge,
}: EarlierCutoffDisclaimerProps) => {
  const { t } = useTranslation()

  const ongoingDate = {
    time: DateTime.getTimePlusOneMinute(orderChangeUntil, timezone),
    day: getNumberDay(orderChangeUntil),
    month: getStringMonthDay(orderChangeUntil),
    weekDay: getLongDayName(orderChangeUntil),
  }

  useEffect(() => {
    sendDifferentCutoffModalViewMetrics(ongoingDate.time, orderId)
  }, [])

  const handleAcknowledge = () => {
    sendDifferentCutoffModalAcceptMetrics(ongoingDate.time, orderId)

    onAcknowledge()
  }

  return (
    <Modal>
      <div className="earlier-cutoff-disclaimer__wrapper">
        <h3 className="title2-b">
          {t('checkout_confirm.earlier_cutoff_title')}
        </h3>
        <p className="earlier-cutoff-disclaimer__description body1-r">
          {t('checkout_confirm.earlier_cutoff_description')}
        </p>
        <div className="earlier-cutoff-disclaimer__date-wrapper">
          <p className="earlier-cutoff-disclaimer__time headline1-sb">
            {t('checkout_confirm.earlier_cutoff_time', {
              time: ongoingDate.time,
            })}
          </p>
          <p className="earlier-cutoff-disclaimer__date subhead1-r">
            {t('checkout_confirm.earlier_cutoff_date', {
              weekDay: ongoingDate.weekDay,
              monthDay: ongoingDate.day,
              month: ongoingDate.month,
            })}
          </p>
        </div>
        <Button onClick={handleAcknowledge}>{t('button.agreed')}</Button>
      </div>
    </Modal>
  )
}
