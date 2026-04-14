import { CustomException, RawException } from 'app/shared/exceptions'

export const SlotTakenException = {
  code: 'slot_taken',

  isException(exception: RawException): exception is RawException {
    return exception.code === this.code
  },

  toJSON() {
    return { code: this.code }
  },
} as const satisfies CustomException
