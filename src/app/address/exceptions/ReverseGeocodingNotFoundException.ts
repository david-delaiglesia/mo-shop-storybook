import { CustomException, RawException } from 'app/shared/exceptions'

export const ReverseGeocodingNotFoundException = {
  code: 'reverse_geocoding_not_found',

  isException(exception): exception is RawException {
    return exception.code === this.code
  },

  toJSON() {
    return {
      code: this.code,
    }
  },
} as const satisfies CustomException
