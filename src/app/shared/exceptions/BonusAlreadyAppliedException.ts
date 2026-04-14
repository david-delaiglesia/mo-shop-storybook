import { CustomException, RawException } from 'app/shared/exceptions'

export const BonusAlreadyAppliedException = {
  code: 'bonus_already_applied',

  isException(exception): exception is RawException {
    return exception.code === this.code
  },

  toJSON() {
    return { code: this.code }
  },
} as const satisfies CustomException
