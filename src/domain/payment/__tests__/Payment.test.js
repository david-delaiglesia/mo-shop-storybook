import { Payment } from '../Payment'
import { PAYMENT_STATUS } from '../constants'

describe('Payment domain', () => {
  const { DONE, PENDING, FAILED } = PAYMENT_STATUS

  describe('isDone method', () => {
    it('should return true if paymentStatus is DONE', () => {
      const isDONEResponse = Payment.isDone(DONE)

      expect(isDONEResponse).toBeTruthy()
    })

    it('should return false if paymentStatus not is DONE', () => {
      const isDONEResponse = Payment.isDone(PENDING)

      expect(isDONEResponse).toBeFalsy()
    })
  })

  describe('isPaymentPending method', () => {
    it('should return true if paymentStatus is PENDING', () => {
      const isPendingResponse = Payment.isPending(PENDING)

      expect(isPendingResponse).toBeTruthy()
    })

    it('should return false if paymentStatus not is PENDING', () => {
      const isPendingResponse = Payment.isPending(DONE)

      expect(isPendingResponse).toBeFalsy()
    })
  })

  describe('isFailed method', () => {
    it('should return true if paymentStatus is FAILED', () => {
      const isFailedResponse = Payment.isFailed(FAILED)

      expect(isFailedResponse).toBeTruthy()
    })

    it('should return false if paymentStatus not is FAILED', () => {
      const isFailedResponse = Payment.isFailed(PENDING)

      expect(isFailedResponse).toBeFalsy()
    })
  })
})
