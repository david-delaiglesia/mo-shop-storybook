import { useTranslation } from 'react-i18next'

import { bool, func, object, shape } from 'prop-types'

import { Notifier } from '@mercadona/mo.library.shop-ui/notifier'

import { CheckoutContactInfoContainer } from 'app/checkout/containers/checkout-contact-info-container'
import { CheckoutDeliveryInfoContainer } from 'app/checkout/containers/checkout-delivery-info-container'
import { CheckoutPaymentInfoContainer } from 'app/checkout/containers/checkout-payment-info-container'
import { Order } from 'domain/order'
import { getNumberDay, getStringMonthDay } from 'utils/dates'
import { DateTime } from 'utils/slots'

import './CheckoutForm.css'

const CheckoutForm = ({
  incrementEditMode,
  decrementEditMode,
  isValid,
  tokenAuthnFlow,
  checkout,
}) => {
  const { t } = useTranslation()

  const ongoingDate = () => {
    if (checkout?.slot?.cutoff_time) {
      const formattedTime = DateTime.getTimePlusOneMinute(
        checkout.slot.cutoff_time,
        checkout.timezone,
      )

      return {
        time: formattedTime,
        day: getNumberDay(checkout.slot.cutoff_time),
        month: getStringMonthDay(checkout.slot.cutoff_time),
      }
    }
  }

  const renderCutoffNotifier = (date) => {
    return Order.isMorningCutoff(date.time)
      ? renderMorningCutoffNotifier()
      : renderRegularCutoffNotifier()
  }

  const renderRegularCutoffNotifier = () => {
    return (
      <Notifier icon="info">
        {t('checkout_confirm.edit_hint_new', ongoingDate())}
      </Notifier>
    )
  }

  const renderMorningCutoffNotifier = () => {
    return (
      <Notifier icon="info">
        {t('checkout_confirm.edit_hint_morning', ongoingDate())}
      </Notifier>
    )
  }

  return (
    <div className="checkout-form">
      <CheckoutDeliveryInfoContainer
        incrementEditMode={incrementEditMode}
        decrementEditMode={decrementEditMode}
      />
      <CheckoutContactInfoContainer
        incrementEditMode={incrementEditMode}
        decrementEditMode={decrementEditMode}
      />
      {!tokenAuthnFlow && (
        <CheckoutPaymentInfoContainer
          incrementEditMode={incrementEditMode}
          decrementEditMode={decrementEditMode}
        />
      )}
      {isValid && renderCutoffNotifier(ongoingDate())}
    </div>
  )
}

CheckoutForm.propTypes = {
  incrementEditMode: func.isRequired,
  decrementEditMode: func.isRequired,
  isValid: bool.isRequired,
  tokenAuthnFlow: bool,
  checkout: shape({
    slot: object,
  }),
}

CheckoutForm.defaultProps = {
  tokenAuthnFlow: false,
}

export { CheckoutForm }
