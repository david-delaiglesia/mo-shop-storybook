import { Fragment, useState } from 'react'
import { createPortal } from 'react-dom'

import { func, object, oneOf } from 'prop-types'

import { withTranslate } from 'app/i18n/containers/i18n-provider'
import { sendWidgetClickMetrics } from 'app/order/metrics'
import { ServiceRatingContainer } from 'app/service-rating/containers/service-rating-container'
import Modal from 'components/modal'

const PendingOrderWidgetRateAction = ({ order, t }) => {
  const [isModalVisible, setModalVisible] = useState(false)

  const closeModal = (event) => {
    event?.stopPropagation()
    setModalVisible(false)
  }

  const openModal = (event) => {
    if (typeof event.stopPropagation !== 'function') return
    event.stopPropagation()
    sendWidgetClickMetrics(order, 'rate')
    setModalVisible(true)
  }

  return (
    <Fragment>
      <button
        className="pending-order-widget__action subhead1-sb"
        onClick={openModal}
      >
        {t('widget_rate_action')}
      </button>
      {isModalVisible &&
        createPortal(
          <Modal onClose={closeModal} showButtonModal>
            <ServiceRatingContainer
              token={order.serviceRatingToken}
              onFinish={closeModal}
            />
          </Modal>,
          document.getElementById('modal-info'),
        )}
    </Fragment>
  )
}

PendingOrderWidgetRateAction.propTypes = {
  order: object.isRequired,
  position: oneOf(['left', 'right']),
  t: func.isRequired,
}

const PendingOrderWidgetRateActionWithTranslate = withTranslate(
  PendingOrderWidgetRateAction,
)

export { PendingOrderWidgetRateActionWithTranslate as PendingOrderWidgetRateAction }
