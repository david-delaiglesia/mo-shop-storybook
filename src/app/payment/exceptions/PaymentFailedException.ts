import { CustomException, RawException } from 'app/shared/exceptions'

export const PaymentFailedException = {
  code: 'payment_failed',

  isException(exception): exception is RawException {
    return exception.code === this.code
  },

  toJSON() {
    return { code: this.code }
  },
} as const satisfies CustomException
