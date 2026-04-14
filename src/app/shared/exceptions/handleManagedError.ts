import { ManagedException, RawException } from './ManagedException'
import { cloneResponse } from './clone-response'

import { NetworkError } from 'services/http'

interface ExceptionMatcher<ExceptionType extends RawException> {
  isException: (e: RawException) => e is ExceptionType
}

type ExceptionHandler<ExceptionType extends RawException> = (
  exception: ExceptionType,
) => void | Promise<void>

interface HandlerEntry {
  exception: ExceptionMatcher<RawException>
  handle: ExceptionHandler<RawException>
}

export type UnhandledError =
  | { type: 'managed'; exception: RawException }
  | { type: 'unknown' }

export const handleManagedError = (error: unknown) => {
  const handlers: HandlerEntry[] = []
  let unhandledCallback:
    | ((error: UnhandledError) => void | Promise<void>)
    | undefined

  return {
    on<ExceptionType extends RawException>(
      exception: ExceptionMatcher<ExceptionType>,
      handle: ExceptionHandler<ExceptionType>,
    ) {
      handlers.push({
        exception,
        handle: handle as (e: RawException) => void | Promise<void>,
      })
      return this
    },

    onUnhandled(callback: (error: UnhandledError) => void | Promise<void>) {
      unhandledCallback = callback
      return this
    },

    async run(): Promise<void> {
      if (ManagedException.isManagedError(error)) {
        const [errorToConsume, errorToPublish] = cloneResponse(error)
        const rawException = await ManagedException.getException(errorToConsume)

        for (const { exception, handle } of handlers) {
          if (exception.isException(rawException)) {
            await handle(rawException)
            return
          }
        }

        if (unhandledCallback) {
          await unhandledCallback({ type: 'managed', exception: rawException })
        }

        NetworkError.publish(errorToPublish)
        return
      }

      if (unhandledCallback) {
        await unhandledCallback({ type: 'unknown' })
      }

      NetworkError.publish(error)
    },
  }
}
