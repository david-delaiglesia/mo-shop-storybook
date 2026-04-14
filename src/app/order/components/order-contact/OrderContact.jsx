import { bool, func, object, shape } from 'prop-types'
import { compose } from 'redux'

import { Button } from '@mercadona/mo.library.shop-ui/button'
import { Card } from '@mercadona/mo.library.shop-ui/card'

import { withTranslate } from 'app/i18n/containers/i18n-provider'
import { OrderDetailCard } from 'app/order/components/order-detail-card'
import LegacyButton from 'components/button'
import { InputPhone } from 'system-ui/input'
import { TAB_INDEX } from 'utils/constants'
import { PhoneUtils } from 'utils/phone'
import withEnterKeyPress from 'wrappers/enter-key-press'

import './OrderContact.css'

const OrderContact = ({
  form,
  selectedCountryCode,
  isCancellable,
  editMode,
  activateEditMode,
  onChange,
  onSelectCountryCode,
  save,
  cancel,
  hidden,
  onEnterKeyPress,
  showEditButton,
  t,
}) => {
  const { phone } = form.fields

  function getCardStatus() {
    if (hidden) return Card.STATUSES.INACTIVE
    if (editMode) return Card.STATUSES.ACTIVE
    if (!editMode && phone.value) return Card.STATUSES.ENABLED
    return
  }

  const status = getCardStatus()
  const showEdit =
    showEditButton && !editMode && status === Card.STATUSES.ENABLED
  const title = t('commons.order.order_contact.title_phone')

  return (
    <OrderDetailCard
      aria-label={title}
      status={status}
      hover={showEdit}
      aria-disabled={status === OrderDetailCard.STATUSES.INACTIVE}
      className="order-contact"
    >
      <OrderDetailCard.Header>
        <OrderDetailCard.Title>{title}</OrderDetailCard.Title>
      </OrderDetailCard.Header>
      <OrderDetailCard.Content>
        {status === Card.STATUSES.ENABLED && (
          <p className="ym-hide-content" tabIndex={TAB_INDEX.ENABLED}>
            {PhoneUtils.formatPhoneNumber({
              nationalNumber: phone.value,
              country: selectedCountryCode.isoCountryCode,
              countryCode: selectedCountryCode.phoneCountryCode,
            })}
          </p>
        )}
        {status === Card.STATUSES.ACTIVE && (
          <form onKeyPress={onEnterKeyPress}>
            <div className="order-contact__summary-edit">
              <p className="body1-r">
                {t('commons.order.order_contact.add_contact')}
              </p>
              <InputPhone
                label="input.phone"
                phone={phone.value}
                phoneCountryCode={selectedCountryCode.phoneCountryCode}
                onSelectCountryCode={onSelectCountryCode}
                validation={phone.validation}
                onChange={onChange}
                datatest="edit-order-contact"
                autoFocus
              />
              <p className="caption2-sb order-contact__warning">
                {t('commons.order.order_contact.phone_advertise')}
              </p>
            </div>
            <div className="order-contact__summary-buttons">
              {isCancellable && (
                <LegacyButton
                  onClick={cancel}
                  type="tertiary"
                  size="small"
                  text="button.cancel"
                  datatest="order-contact__cancel-button"
                />
              )}
              <LegacyButton
                disabled={!form.isValid}
                onClick={save}
                type="primary"
                size="small"
                text="button.save_changes"
                datatest="order-contact__save-button"
              />
            </div>
          </form>
        )}
      </OrderDetailCard.Content>
      {showEdit && (
        <Button
          variant="text"
          aria-label={t('button.edit')}
          onClick={activateEditMode}
          className="order-contact__modify-button"
        >
          {t('button.edit')}
        </Button>
      )}
    </OrderDetailCard>
  )
}

OrderContact.propTypes = {
  form: shape({
    fields: object.isRequired,
    isValid: bool.isRequired,
  }).isRequired,
  selectedCountryCode: object,
  isCancellable: bool.isRequired,
  editMode: bool.isRequired,
  activateEditMode: func.isRequired,
  onChange: func.isRequired,
  onSelectCountryCode: func.isRequired,
  save: func.isRequired,
  cancel: func.isRequired,
  hidden: bool,
  onEnterKeyPress: func.isRequired,
  showEditButton: bool.isRequired,
  t: func.isRequired,
}

OrderContact.defaultProps = {
  hidden: false,
}

const ComposedOrderContact = compose(
  withEnterKeyPress,
  withTranslate,
)(OrderContact)

export { ComposedOrderContact as OrderContact }
