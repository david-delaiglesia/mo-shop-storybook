import { CustomExceptionExtendable, RawException } from 'app/shared/exceptions'

interface ExtraFields {
  detail: string
}

type RawMaxWaterLitersInCartException = RawException & ExtraFields

export const MaxWaterLitersInCartException = {
  code: 'max_water_liters_in_cart_error',

  isException(exception): exception is RawMaxWaterLitersInCartException {
    return exception.code === this.code
  },

  toJSON(extraFields) {
    return { code: this.code, ...extraFields }
  },
} as const satisfies CustomExceptionExtendable<ExtraFields>
