import { CustomException, RawException } from 'app/shared/exceptions'

export const PostalCodeWithoutServiceException = {
  code: 'postal_code_without_service',

  isException(exception): exception is RawException {
    return exception.code === this.code
  },

  toJSON() {
    return {
      code: this.code,
    }
  },
} as const satisfies CustomException
