import { CustomExceptionExtendable, RawException } from 'app/shared/exceptions'

interface ExtraFields {
  detail: string
}

type RawFieldRequiredException = RawException & ExtraFields

export const FieldRequiredException = {
  code: '01',

  isException(exception): exception is RawFieldRequiredException {
    return exception.code === this.code
  },

  toJSON(extraFields) {
    return { code: this.code, ...extraFields }
  },
} as const satisfies CustomExceptionExtendable<ExtraFields>
