import { CustomExceptionExtendable, RawException } from 'app/shared/exceptions'

interface ExtraFields {
  detail: string
}

type RawFieldInvalidException = RawException & ExtraFields

export const FieldInvalidException = {
  code: '02',

  isException(exception): exception is RawFieldInvalidException {
    return exception.code === this.code
  },

  toJSON(extraFields) {
    return { code: this.code, ...extraFields }
  },
} as const satisfies CustomExceptionExtendable<ExtraFields>
