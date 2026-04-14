import { HTTP_STATUS } from 'services/http'

export interface RawException {
  code: string
  // Legacy exceptions from the backend include a `detail` field with a
  // human-readable message. New exceptions should NOT rely on this field —
  // they define their own presentation strategy instead.
  detail?: string
}

export interface CustomException {
  code: string
  isException(exception: RawException): exception is RawException
  toJSON(): { code: string }
}

export interface CustomExceptionExtendable<ExtraFields = unknown> {
  code: string
  isException(exception: RawException): exception is RawException
  toJSON(extraFields: ExtraFields): { code: string } & ExtraFields
}

// @ts-expect-error error type should be unknown
const isManagedError = (error): error is Response => {
  return error?.status === HTTP_STATUS.BAD_REQUEST
}

const getException = async (error: Response): Promise<RawException> => {
  const {
    errors: [exception],
  } = await error.json()

  return exception
}

export const ManagedException = {
  isManagedError,
  getException,
}
