import { PAYMENT_STATUS } from './constants'

function isDone(paymentStatus) {
  return paymentStatus === PAYMENT_STATUS.DONE
}

function isPending(paymentStatus) {
  return paymentStatus === PAYMENT_STATUS.PENDING
}

function isFailed(paymentStatus) {
  return paymentStatus === PAYMENT_STATUS.FAILED
}

export const Payment = {
  isDone,
  isPending,
  isFailed,
}
