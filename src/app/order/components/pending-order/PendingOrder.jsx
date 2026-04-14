import { useState } from 'react'

import { array, func, string } from 'prop-types'

import { Icon } from '@mercadona/mo.library.shop-ui/icon'

import { withTranslate } from 'app/i18n/containers/i18n-provider'
import { PendingOrderWidget } from 'app/order/components/pending-order-widget'
import { TAB_INDEX } from 'utils/constants'

import './assets/PendingOrder.css'

const EXTRA_HD_VIEW_PORT = 1440

const getTranslation = (position) => {
  const isMinorResolution = window.innerWidth < EXTRA_HD_VIEW_PORT
  const ordersToDisplay = isMinorResolution ? 2 : 3

  const totalSpaces = ordersToDisplay - 1
  const spaceWidth = '1rem'
  const paddingWidth = '12px'
  const totalSpaceWidth = `${totalSpaces} * ${spaceWidth} + ${paddingWidth} * 2`
  const widgetWidth = `((100% - (${totalSpaceWidth})) / ${ordersToDisplay})`

  return {
    transform: `translateX(calc(-${position} * (${widgetWidth} + ${spaceWidth})))`,
  }
}

const PendingOrder = ({ items, title, t }) => {
  const [position, setPosition] = useState(0)

  const defaultTitle = t('on_going_order.title')

  const isMinorResolution = window.innerWidth < EXTRA_HD_VIEW_PORT
  const ordersToDisplay = isMinorResolution ? 2 : 3
  const lastOrderDisplayed = position + ordersToDisplay
  const hasHiddenOrders = items.length > ordersToDisplay
  const isLastOrderDisplayed = items.length === lastOrderDisplayed

  const shouldShowNextButton = hasHiddenOrders && !isLastOrderDisplayed
  const shouldShowPrevButton = position > 0

  return (
    <div className="pending-order" data-testid="pending-order">
      <h2
        tabIndex={TAB_INDEX.ENABLED}
        className="pending-order__title headline1-b"
      >
        {title || defaultTitle}
      </h2>
      <div className="pending-order__content">
        {shouldShowPrevButton && (
          <button
            className="pending-order__arrow"
            aria-label={t('aria_previous_widget')}
            onClick={() => setPosition(position - 1)}
          >
            <Icon icon="chevron-left" />
          </button>
        )}
        <div className="pending-order__widgets-mask">
          <ul
            className={`pending-order__widgets pending-order__widgets--${items.length}`}
            style={getTranslation(position)}
          >
            {items.map((order) => (
              <PendingOrderWidget key={order.id} order={order} />
            ))}
          </ul>
        </div>
        {shouldShowNextButton && (
          <button
            className="pending-order__arrow"
            aria-label={t('aria_next_widget')}
            onClick={() => setPosition(position + 1)}
          >
            <Icon icon="chevron-right" />
          </button>
        )}
      </div>
    </div>
  )
}

PendingOrder.propTypes = {
  items: array.isRequired,
  title: string,
  t: func.isRequired,
}

const PendingOrderWithTranslate = withTranslate(PendingOrder)

export { PendingOrderWithTranslate as PendingOrder }
