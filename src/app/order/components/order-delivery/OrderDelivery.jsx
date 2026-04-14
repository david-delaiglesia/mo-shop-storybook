import { Fragment, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import slotPlaceholder from './assets/slot-placeholder.svg'
import { bool, func, object, shape, string } from 'prop-types'

import { Button } from '@mercadona/mo.library.shop-ui/button'

import { AddressFormContainer } from 'app/address/containers/address-form-container'
import {
  AddressPickerContainer,
  AddressPickerMetrics,
} from 'app/address/containers/address-picker-container'
import { OrderDeliverySummary } from 'app/order/components/order-delivery-summary'
import { OrderDetailCard } from 'app/order/components/order-detail-card'
import {
  sendAddressConfirmationViewMetrics,
  sendChangeAddressClickMetrics,
  sendChangeDeliveryClickMetrics,
} from 'app/order/metrics'
import { SlotsContainer } from 'containers/slots-container'
import { Address } from 'domain/address'
import { CheckoutPropTypes } from 'domain/checkout'
import { isEmptyObject } from 'utils/objects'
import { isNull } from 'utils/values'
import { withInteractionMetrics } from 'wrappers/metrics'

import './OrderDelivery.css'

const AddressPickerWithMetrics = withInteractionMetrics(AddressPickerMetrics)(
  AddressPickerContainer,
)

const MODULES = {
  ADDRESS_LIST: 'ADDRESS_LIST',
  ADDRESS_FORM: 'ADDRESS_FORM',
  SLOTS: 'SLOTS',
}

function OrderDelivery({
  selectedAddress,
  selectedSlot,
  selectedDay,
  isEditing,
  selectAddress,
  selectSlot,
  selectDay,
  confirmAddress,
  confirmSlot,
  setEditMode,
  showEditButton = true,
  checkout,
}) {
  const [module, setModule] = useState()
  const { t } = useTranslation()
  const [hasEditedAddress, setHasEditedAddress] = useState(false)

  useEffect(() => {
    if (checkout.requiresAddressConfirmation) {
      sendAddressConfirmationViewMetrics()
      openAddressList()
      return
    }

    if (isNull(selectedAddress) || isEmptyObject(selectedAddress)) {
      openAddressList()
      return
    }

    openSlots()
  }, [])

  const openSlots = () => setModule(MODULES.SLOTS)
  const openForm = () => setModule(MODULES.ADDRESS_FORM)
  const closeForm = () => {
    setHasEditedAddress(() => true)
    setModule(MODULES.ADDRESS_LIST)
  }
  const closeAddress = () => {
    setHasEditedAddress(() => true)
    setModule(MODULES.SLOTS)
  }
  const openAddressList = () => {
    if (!selectedAddress) return
    sendChangeAddressClickMetrics(selectedAddress)
    setModule(MODULES.ADDRESS_LIST)
  }
  const closeList = () => {
    selectAddress(selectedAddress)

    setModule(MODULES.SLOTS)
    setHasEditedAddress(() => true)
  }
  const editButtonAction = () => {
    sendChangeDeliveryClickMetrics(checkout)
    setEditMode(true)
  }

  const cancelSlotsEdition = () => {
    setEditMode(false)
    selectSlot(checkout.slot)
    selectAddress(selectedAddress)
  }

  const returnCorrectModule = () => {
    if (!module) return

    const RENDERS = {
      [MODULES.ADDRESS_LIST]: renderAddressList,
      [MODULES.ADDRESS_FORM]: renderAddressForm,
      [MODULES.SLOTS]: renderSelectSlot,
    }

    return RENDERS[module]() || null
  }

  const renderAddressForm = () => {
    return (
      <AddressFormContainer
        onClose={closeForm}
        onConfirm={closeAddress}
        success={confirmAddress}
        hasAddresses={hasAddresses}
        title="user_area.addresses.empty_message"
      />
    )
  }

  const renderSelectSlot = () => {
    const { slot, slotSize, timezone } = checkout

    if (isNull(selectedAddress) || isEmptyObject(selectedAddress)) {
      return null
    }

    const hasAddressChanged = selectedAddress.id === checkout?.address?.id

    return (
      <Fragment>
        <section className="order-delivery__address">
          <button
            className="order-delivery__edit-button"
            onClick={openAddressList}
            data-testid="open-address-list"
          >
            <span className="ym-hide-content">
              {Address.getDeliveryAddress(selectedAddress)}
            </span>
            <span className="order-delivery__edit-address subhead1-sb">
              {t('commons.order.order_delivery.edit_address')}
            </span>
          </button>
        </section>
        <SlotsContainer
          key={selectedAddress.id}
          selectedDay={selectedDay}
          selectedSlot={selectedSlot}
          selectedAddress={selectedAddress}
          postalCode={selectedAddress.postalCode}
          slot={hasAddressChanged ? slot : null}
          slotSize={slotSize}
          selectSlot={selectSlot}
          selectDay={selectDay}
          confirmSlot={confirmSlot}
          cancelEdition={cancelSlotsEdition}
          timezone={timezone}
        />
      </Fragment>
    )
  }

  const renderAddressList = () => {
    const { requiresAddressConfirmation } = checkout
    return (
      <AddressPickerWithMetrics
        forceOpenList={requiresAddressConfirmation}
        closeList={closeList}
        showForm={openForm}
        selectedAddress={selectedAddress}
        selectAddress={selectAddress}
        confirmAddress={confirmAddress}
        hasEditedAddress={hasEditedAddress}
      />
    )
  }

  const hasAddresses = () => {
    const isSelectAddressEmpty = isNull(selectedAddress)
      ? true
      : isEmptyObject(selectedAddress)
    const isCheckoutAddressEmpty = isNull(checkout.address)

    return !isCheckoutAddressEmpty || !isSelectAddressEmpty
  }
  const isComplete = () =>
    Boolean(checkout.address && checkout.slot && !isEditing)
  const showForm = () => isEditing && !checkout.address && !selectedAddress
  const shouldShowEditButton = showEditButton && !isEditing
  const checkEditMode = () => isEditing || (checkout.address && !checkout.slot)

  const title = t('commons.order.order_delivery.title')

  return (
    <OrderDetailCard
      aria-label={title}
      hover={shouldShowEditButton}
      status={
        isComplete()
          ? OrderDetailCard.STATUSES.ENABLED
          : OrderDetailCard.STATUSES.ACTIVE
      }
      className="order-delivery"
    >
      <OrderDetailCard.Header>
        <OrderDetailCard.Title>{title}</OrderDetailCard.Title>
      </OrderDetailCard.Header>
      <OrderDetailCard.Content>
        {isComplete() && (
          <OrderDeliverySummary
            slot={checkout.slot}
            address={Address.getFormattedAddress(checkout.address)}
            town={Address.getDeliveryTown(checkout.address)}
            timezone={checkout.timezone}
          />
        )}
        {checkEditMode() && returnCorrectModule()}
        {showForm() && (
          <div className="order-delivery__form-address">
            {renderAddressForm()}
            <div className="order-delivery__hide-slots">
              <img
                className="order-delivery__hide-slots-image"
                src={slotPlaceholder}
                alt="slots-calendar"
              />
              <p className="body1-r">
                {t('commons.order.order_delivery.hide_slots')}
              </p>
            </div>
          </div>
        )}
      </OrderDetailCard.Content>
      {shouldShowEditButton && (
        <Button
          variant="text"
          aria-label={t('button.edit')}
          onClick={editButtonAction}
          className="order-delivery__modify-button"
        >
          {t('button.edit')}
        </Button>
      )}
    </OrderDetailCard>
  )
}

OrderDelivery.propTypes = {
  checkout: CheckoutPropTypes.isRequired,
  confirmAddress: func.isRequired,
  confirmSlot: func.isRequired,
  isEditing: bool.isRequired,
  selectAddress: func.isRequired,
  selectSlot: func.isRequired,
  selectDay: func.isRequired,
  selectedAddress: object,
  selectedSlot: shape({ id: string.isRequired, start: string, end: string }),
  selectedDay: string,
  setEditMode: func.isRequired,
  showEditButton: bool,
}

export { OrderDelivery }
