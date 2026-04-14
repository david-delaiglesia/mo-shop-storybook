import { CustomException, RawException } from 'app/shared/exceptions'

/**
 * @deprecated This exception will be removed when ADDRESS_POSTAL_CODE_CORRECTION feature flag is retired.
 * The backend no longer throws CoordinatesOutsideAllowedCountryException with the new accuracy endpoint.
 */
export const CoordinatesOutsideAllowedCountryException = {
  code: 'coordinates_outside_allowed_country',

  isException(exception): exception is RawException {
    return exception.code === this.code
  },

  toJSON() {
    return {
      code: this.code,
    }
  },
} as const satisfies CustomException
