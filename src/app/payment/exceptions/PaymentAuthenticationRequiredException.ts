import { CustomExceptionExtendable, RawException } from 'app/shared/exceptions'

interface RawPaymentAuthenticationRequiredException extends RawException {
  authentication_uuid: string
}

export const PaymentAuthenticationRequiredException = {
  code: 'authentication_required',

  isException(
    exception,
  ): exception is RawPaymentAuthenticationRequiredException {
    return exception.code === this.code
  },

  toJSON(extraFields) {
    return {
      code: this.code,
      ...extraFields,
    }
  },
} as const satisfies CustomExceptionExtendable<{
  authentication_uuid?: string
}>
