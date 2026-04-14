export function serializeNextDeliveryDay(nextDeliveryDay) {
  return {
    nextFreeSlot: nextDeliveryDay.next_free_slot,
  }
}

export function serializeSlot(slot) {
  return {
    id: slot.id,
    start: slot.start,
    end: slot.end,
    available: slot.available,
    open: slot.open,
    price: slot.price,
    cutoff_time: slot.cutoff_time,
    timezone: slot.timezone,
  }
}

export function serializeSlots(response) {
  return response.results.map(serializeSlot)
}
