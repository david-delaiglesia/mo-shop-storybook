import { Payment } from '../payment'
import {
  CANCELABLE_STATUSES,
  CANCELLED_STATUSES,
  DISRUPTED_STATUSES,
  EDITABLE_STATUSES,
  FINAL_STATUSES,
  PRINTABLE_STATUSES,
  REPEATABLE_STATUSES,
  STATUSES_WITH_ESTIMATED_PRICE,
} from './constants'
import moment from 'moment'

import { OrderPaymentStatus, OrderStatusUI } from 'app/order'
import { getTodayDate, isSameDay } from 'utils/dates'

const isPreparing = (order) => {
  return order.status === OrderStatusUI.PREPARING
}

const isPrepared = (order) => {
  return order.status === OrderStatusUI.PREPARED
}

const isDelivering = (order) => {
  return order.status === OrderStatusUI.DELIVERING
}

function isPrintable(order) {
  return checkStatus(PRINTABLE_STATUSES, order)
}

function hasEstimatedPrice(order) {
  return checkStatus(STATUSES_WITH_ESTIMATED_PRICE, order)
}

function isEditable(order) {
  return checkStatus(EDITABLE_STATUSES, order)
}

function isCancelable(order) {
  return checkStatus(CANCELABLE_STATUSES, order)
}

function isCancelled(order) {
  return CANCELLED_STATUSES.includes(order.status)
}

function isDeliveredAndRated(order) {
  return !order.serviceRatingToken && isDelivered(order)
}

function isRepeatable(order) {
  return checkStatus(REPEATABLE_STATUSES, order)
}

function isFinal(order) {
  return FINAL_STATUSES.includes(order.status)
}

function canBeRated(order) {
  return hasServiceRatingToken(order) && isDelivered(order)
}

function hasServiceRatingToken(order) {
  return !!order.serviceRatingToken
}

function isDelivered(order) {
  return order.status === OrderStatusUI.DELIVERED
}

function hasPaymentFailed(order) {
  return Payment.isFailed(order.paymentStatus)
}

function isDisrupted(order) {
  const hasPaymentFailed = Payment.isFailed(order.paymentStatus)
  const isInDisruptedState = DISRUPTED_STATUSES.includes(order.status)

  return hasPaymentFailed || isInDisruptedState
}

function isConfirmed(order) {
  return order.status === OrderStatusUI.CONFIRMED
}

function checkStatus(statusList, order) {
  if (Payment.isFailed(order.paymentStatus) && !Order.isFinal(order)) {
    return false
  }

  if (
    order.paymentStatus === OrderPaymentStatus.REPREPARED_WITH_PENDING_PAYMENT
  ) {
    return false
  }

  return statusList.includes(order.status)
}

function isMorningCutoff(time) {
  const [hour] = time.split(':')
  const intHour = Number.parseInt(hour)

  return intHour >= 1 && intHour <= 5
}

function isLessThan24HoursAwayFromCutoff(order) {
  const currentTime = new moment().valueOf()
  const cutoffTime = new moment(order.changesUntil).valueOf()

  const distance = cutoffTime - currentTime

  const minutes = Math.floor(distance / 60_000)

  if (distance < 0) return false

  const hoursLeft = Math.floor(minutes / 60)

  return hoursLeft < 24
}

const isBeingDeliveredToday = (order) => {
  const today = getTodayDate()
  return isSameDay(order.slot.start, today)
}

const getSlotPrice = (order) => {
  return parseFloat(order.slot.price)
}

export const Order = {
  canBeRated,
  hasEstimatedPrice,
  hasPaymentFailed,
  isCancelable,
  isCancelled,
  isConfirmed,
  isDelivered,
  isDeliveredAndRated,
  isDisrupted,
  isEditable,
  isFinal,
  isPrintable,
  isRepeatable,
  isMorningCutoff,
  isLessThan24HoursAwayFromCutoff,
  isPreparing,
  isPrepared,
  isDelivering,
  isBeingDeliveredToday,
  getSlotPrice,
}
