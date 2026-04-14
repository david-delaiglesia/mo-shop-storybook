import { CustomExceptionExtendable, RawException } from 'app/shared/exceptions'

interface AreasExceeded {
  ambient: boolean
  chilled: boolean
  frozen: boolean
}

interface ExtraFields {
  areas_exceeded: AreasExceeded
}

type RawMaxSizeAreaExceededException = RawException & ExtraFields

export const MaxSizeAreaExceededException = {
  code: 'max_size_area_exceeded',

  isException(
    exception: RawException,
  ): exception is RawMaxSizeAreaExceededException {
    return exception.code === this.code
  },

  toJSON(extraFields: ExtraFields) {
    return {
      code: this.code,
      ...extraFields,
    }
  },
} as const satisfies CustomExceptionExtendable<ExtraFields>
