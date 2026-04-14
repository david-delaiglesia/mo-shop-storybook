import { CustomException, RawException } from 'app/shared/exceptions'

export const AddressOutOfDeliveryException = {
  code: 'out_of_delivery_address',

  isException(exception): exception is RawException {
    return exception.code === this.code
  },

  toJSON() {
    return {
      code: this.code,
    }
  },
} as const satisfies CustomException
