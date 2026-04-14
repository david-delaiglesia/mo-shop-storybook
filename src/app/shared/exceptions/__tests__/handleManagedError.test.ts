import { ManagedException } from '../ManagedException'
import { cloneResponse } from '../clone-response'
import { handleManagedError } from '../handleManagedError'

import { NetworkError } from 'services/http'

vi.mock('services/http', () => ({
  NetworkError: { publish: vi.fn() },
}))

vi.mock('../ManagedException', () => ({
  ManagedException: {
    isManagedError: vi.fn(),
    getException: vi.fn(),
  },
}))

vi.mock('../clone-response', () => ({
  cloneResponse: vi.fn(),
}))

describe('handleManagedError', () => {
  const error = new Response(null, { status: 400 })
  const errorToConsume = new Response(null, { status: 400 })
  const errorToPublish = new Response(null, { status: 400 })

  beforeEach(() => {
    vi.mocked(cloneResponse).mockReturnValue([errorToConsume, errorToPublish])
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('when the error is not a managed error', () => {
    beforeEach(() => {
      vi.mocked(ManagedException.isManagedError).mockReturnValue(false)
    })

    it('publishes the error to NetworkError', async () => {
      await handleManagedError(error).run()

      expect(NetworkError.publish).toHaveBeenCalledWith(error)
    })
  })

  describe('when the error is managed and the handler matches', () => {
    const exception = { code: 'some_exception' }
    const SomeException = {
      isException: (e: { code: string }): e is typeof exception =>
        e.code === exception.code,
    }

    beforeEach(() => {
      vi.mocked(ManagedException.isManagedError).mockReturnValue(true)
      vi.mocked(ManagedException.getException).mockResolvedValue(exception)
    })

    it('calls the matching handler with the exception', async () => {
      const handler = vi.fn()

      await handleManagedError(error).on(SomeException, handler).run()

      expect(handler).toHaveBeenCalledWith(exception)
    })

    it('does not publish to NetworkError', async () => {
      await handleManagedError(error).on(SomeException, vi.fn()).run()

      expect(NetworkError.publish).not.toHaveBeenCalled()
    })
  })

  describe('when the error is managed but no handler matches', () => {
    const exception = { code: 'unhandled_exception' }
    const OtherException = {
      isException: (e: { code: string }): e is never =>
        e.code === 'other_exception',
    }

    beforeEach(() => {
      vi.mocked(ManagedException.isManagedError).mockReturnValue(true)
      vi.mocked(ManagedException.getException).mockResolvedValue(exception)
    })

    it('publishes errorToPublish to NetworkError', async () => {
      await handleManagedError(error).on(OtherException, vi.fn()).run()

      expect(NetworkError.publish).toHaveBeenCalledWith(errorToPublish)
    })
  })

  describe('with multiple handlers', () => {
    const ExceptionA = {
      isException: (e: { code: string }): e is { code: 'a' } => e.code === 'a',
    }
    const ExceptionB = {
      isException: (e: { code: string }): e is { code: 'b' } => e.code === 'b',
    }

    it('calls only the matching handler', async () => {
      vi.mocked(ManagedException.isManagedError).mockReturnValue(true)
      vi.mocked(ManagedException.getException).mockResolvedValue({ code: 'b' })

      const handlerA = vi.fn()
      const handlerB = vi.fn()

      await handleManagedError(error)
        .on(ExceptionA, handlerA)
        .on(ExceptionB, handlerB)
        .run()

      expect(handlerA).not.toHaveBeenCalled()
      expect(handlerB).toHaveBeenCalledWith({ code: 'b' })
    })
  })

  describe('onUnhandled', () => {
    const exception = { code: 'unhandled_exception' }
    const OtherException = {
      isException: (e: { code: string }): e is never =>
        e.code === 'other_exception',
    }

    beforeEach(() => {
      vi.mocked(ManagedException.isManagedError).mockReturnValue(true)
      vi.mocked(ManagedException.getException).mockResolvedValue(exception)
    })

    it('should call onUnhandled with { type: managed, exception } when no .on() matches', async () => {
      const onUnhandled = vi.fn()

      await handleManagedError(error)
        .on(OtherException, vi.fn())
        .onUnhandled(onUnhandled)
        .run()

      expect(onUnhandled).toHaveBeenCalledWith({ type: 'managed', exception })
    })

    it('should still publish to NetworkError after onUnhandled runs', async () => {
      await handleManagedError(error)
        .on(OtherException, vi.fn())
        .onUnhandled(vi.fn())
        .run()

      expect(NetworkError.publish).toHaveBeenCalledWith(errorToPublish)
    })

    it('should not call onUnhandled when a .on() handler matches', async () => {
      const MatchingException = {
        isException: (e: { code: string }): e is typeof exception =>
          e.code === exception.code,
      }
      const onUnhandled = vi.fn()

      await handleManagedError(error)
        .on(MatchingException, vi.fn())
        .onUnhandled(onUnhandled)
        .run()

      expect(onUnhandled).not.toHaveBeenCalled()
    })

    it('should call onUnhandled with { type: unknown } when the error is not managed', async () => {
      vi.mocked(ManagedException.isManagedError).mockReturnValue(false)
      const onUnhandled = vi.fn()

      await handleManagedError(error).onUnhandled(onUnhandled).run()

      expect(onUnhandled).toHaveBeenCalledWith({ type: 'unknown' })
    })

    it('should still publish to NetworkError after onUnhandled runs for non-managed errors', async () => {
      vi.mocked(ManagedException.isManagedError).mockReturnValue(false)

      await handleManagedError(error).onUnhandled(vi.fn()).run()

      expect(NetworkError.publish).toHaveBeenCalledWith(error)
    })
  })

  describe('with an async handler', () => {
    const exception = { code: 'async_exception' }
    const AsyncException = {
      isException: (e: { code: string }): e is typeof exception =>
        e.code === exception.code,
    }

    it('awaits the handler before returning', async () => {
      vi.mocked(ManagedException.isManagedError).mockReturnValue(true)
      vi.mocked(ManagedException.getException).mockResolvedValue(exception)

      let resolved = false
      const asyncHandler = vi.fn().mockImplementation(async () => {
        await new Promise((r) => setTimeout(r, 0))
        resolved = true
      })

      await handleManagedError(error).on(AsyncException, asyncHandler).run()

      expect(resolved).toBe(true)
    })
  })
})
