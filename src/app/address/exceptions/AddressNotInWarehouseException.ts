import { CustomException, RawException } from 'app/shared/exceptions'

export const AddressNotInWarehouseException = {
  code: 'address_not_in_warehouse',

  isException(exception: RawException): exception is RawException {
    return exception.code === this.code
  },

  toJSON() {
    return { code: this.code }
  },
} as const satisfies CustomException
