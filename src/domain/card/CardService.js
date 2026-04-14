import { Card } from '../card'

import { getYearAndMonth } from 'utils/dates'

function hasAtLeastOneValidCard(cards) {
  return !cards.every(Card.isExpired)
}

function willBeExpiredOnSlotDelivery(paymentMethod, slot) {
  if (!paymentMethod || !slot) {
    return false
  }

  const { year: slotYear, month: slotMonth } = getYearAndMonth(slot.start)
  const {
    expiresMonth: paymentExpirationMonth,
    expiresYear: paymentExpirationYear,
  } = paymentMethod

  if (willBeExpiredByYear(slotYear, paymentExpirationYear)) {
    return true
  }

  const isSameYear = slotYear === paymentExpirationYear

  return willBeExpiredByMonth(isSameYear, slotMonth, paymentExpirationMonth)
}

function willBeExpiredByYear(slotYear, paymentExpirationYear) {
  return Number(slotYear) > Number(paymentExpirationYear)
}

function willBeExpiredByMonth(isSameYear, slotMonth, paymentExpirationMonth) {
  const willExpireByMonth = Number(slotMonth) > Number(paymentExpirationMonth)

  return isSameYear && willExpireByMonth
}

export const CardService = {
  hasAtLeastOneValidCard,
  willBeExpiredOnSlotDelivery,
}
