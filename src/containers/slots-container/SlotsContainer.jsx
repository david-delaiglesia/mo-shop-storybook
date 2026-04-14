import { useEffect, useState } from 'react'
import { connect } from 'react-redux'

import { func, number, shape, string } from 'prop-types'
import { bindActionCreators } from 'redux'

import { compose } from '@mercadona/mo.library.dashtil'

import { CheckoutMetrics } from 'app/checkout'
import { DeliveryAreaClient } from 'app/delivery-area/client'
import { sendSlotDayClickMetrics } from 'app/delivery-area/metrics'
import { SlotsPlaceholder } from 'app/order/components/slots-placeholder'
import { SlotUtils } from 'app/shared/slot'
import { SlotsCalendar } from 'components/slots-calendar'
import { SlotsDetail } from 'components/slots-detail'
import WaitingResponse from 'components/waiting-response'
import { changeCheckout } from 'pages/create-checkout/actions'
import { getDay } from 'utils/dates'
import { generateAvailableSlots } from 'utils/slots'

const SlotsContainer = ({
  userUuid,
  slot,
  slotSize,
  selectedAddress,
  postalCode,
  confirmSlot,
  cancelEdition,
  selectedSlot,
  selectSlot,
  selectedDay,
  selectDay,
  timezone,
}) => {
  const [availableSlots, setAvailableSlots] = useState()

  useEffect(() => {
    CheckoutMetrics.deliveryView()
    getSlots()
  }, [])

  async function getSlots() {
    const slots = await DeliveryAreaClient.getSlots(
      userUuid,
      selectedAddress.id,
      slotSize,
    )

    if (slots.length === 0) {
      setAvailableSlots([])
      return
    }

    if (slot) {
      selectDay(getDay(slot.start))
    }

    const slotsByDay = generateAvailableSlots(slots)
    setAvailableSlots(slotsByDay)
    CheckoutMetrics.slotsAvailability(slots)
  }

  function selectDayWithMetrics(day) {
    sendSlotDayClickMetrics(day)
    selectDay(day)
  }

  function filterSlotsByDay(slots, day) {
    let index = slots.findIndex((slot) => slot.day === day)
    return index >= 0 ? slots[index].slots : slots[0].slots
  }

  if (!availableSlots) {
    return (
      <div className="slots-container-empty">
        <WaitingResponse />
      </div>
    )
  }

  if (!SlotUtils.hasAvailableByDay(availableSlots)) {
    return <SlotsPlaceholder />
  }

  const isConfirmButtonDisabled =
    !selectedSlot || !selectedSlot.start.includes(selectedDay)
  const selectedDaySlots = filterSlotsByDay(availableSlots, selectedDay)

  return (
    <div className="slots-container">
      <SlotsCalendar
        days={availableSlots}
        onClick={selectDayWithMetrics}
        selectedDay={selectedDay}
        postalCode={postalCode}
      />
      {selectedDay && (
        <SlotsDetail
          confirm={confirmSlot}
          cancel={cancelEdition}
          slotDate={selectedDay}
          isButtonDisabled={isConfirmButtonDisabled}
          isCancellable={!!slot}
          onClick={selectSlot}
          selectedSlot={selectedSlot}
          daySlots={selectedDaySlots}
          timezone={timezone}
        />
      )}
    </div>
  )
}

SlotsContainer.propTypes = {
  postalCode: string.isRequired,
  selectedSlot: shape({
    id: string.isRequired,
    start: string,
    end: string,
  }),
  slot: shape({
    start: string.isRequired,
  }),
  selectedAddress: shape({
    id: number.isRequired,
  }),
  selectedDay: string,
  selectDay: func.isRequired,
  confirmSlot: func.isRequired,
  cancelEdition: func.isRequired,
  selectSlot: func.isRequired,
  userUuid: string.isRequired,
  slotSize: number.isRequired,
  timezone: string.isRequired,
}

const mapStateToProps = ({ session }) => ({
  userUuid: session.uuid,
})

const mapDispatchToProps = (dispatch) => ({
  actions: {
    changeCheckout: bindActionCreators(changeCheckout, dispatch),
  },
})

const ComposedSlotsContainer = compose(
  connect(mapStateToProps, mapDispatchToProps),
)(SlotsContainer)

export { ComposedSlotsContainer as SlotsContainer }
