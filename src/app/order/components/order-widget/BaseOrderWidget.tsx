import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import confirmedImage from './assets/order-confirmed.svg'
import deliveredImage from './assets/order-delivered.svg'
import deliveringImage from './assets/order-delivering.svg'
import disruptedImage from './assets/order-disrupted.svg'
import nextToDeliveryImage from './assets/order-next-to-delivery.svg'
import preparingImage from './assets/order-preparing.svg'
import classNames from 'classnames'

import { Order } from 'app/order'

import './BaseOrderWidget.css'

export enum OrderWidgetStatus {
  CONFIRMED = 'confirmed',
  DELIVERED = 'delivered',
  DELIVERING = 'delivering',
  DISRUPTED = 'disrupted',
  NEXT_TO_DELIVERY = 'next_to_delivery',
  PREPARING = 'preparing',
}

const imageByStatus: Record<OrderWidgetStatus, string> = {
  [OrderWidgetStatus.CONFIRMED]: confirmedImage,
  [OrderWidgetStatus.DELIVERED]: deliveredImage,
  [OrderWidgetStatus.DELIVERING]: deliveringImage,
  [OrderWidgetStatus.DISRUPTED]: disruptedImage,
  [OrderWidgetStatus.NEXT_TO_DELIVERY]: nextToDeliveryImage,
  [OrderWidgetStatus.PREPARING]: preparingImage,
}

interface BaseOrderWidgetProps {
  orderId: Order['id']
  status: OrderWidgetStatus
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  onClick?: () => void
}

export const BaseOrderWidget = ({
  orderId,
  status,
  title,
  description,
  actions,
  onClick,
}: BaseOrderWidgetProps) => {
  const { t } = useTranslation()

  const orderNumber = t('on_going_order.order_number', {
    orderNumber: orderId,
  })

  const ariaLabelForOrderDelivered = `${orderNumber}, ${title} ${description ?? ''}`

  return (
    <li
      className={classNames('order-widget', `order-widget--${status}`)}
      onClick={onClick}
      aria-label={ariaLabelForOrderDelivered}
    >
      <div className="order-widget__top-section">
        <img className="order-widget__image" src={imageByStatus[status]} />
        <div className="order-widget__info" aria-hidden={true}>
          <h3 className="order-widget__number footnote1-sb">{orderNumber}</h3>
          <p className="order-widget__title headline1-sb">{title}</p>
          <p className="order-widget__description subhead1-r">{description}</p>
        </div>
      </div>
      <div className="order-widget__actions">{actions}</div>
    </li>
  )
}
