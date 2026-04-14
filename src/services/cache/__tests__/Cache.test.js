import { Cache } from '../Cache'
import { vi } from 'vitest'

describe('Cache', () => {
  let eventMap = {}
  global.window.addEventListener = (eventName, cb) => {
    eventMap[eventName] = cb
  }
  delete global.window.location
  global.window.location = {
    reload: vi.fn(),
  }
  global.window.caches = {
    keys: vi.fn().mockResolvedValue(['key1', 'key2', 'key3']),
    delete: vi.fn().mockResolvedValue(),
  }

  afterEach(() => {
    eventMap = {}
    vi.restoreAllMocks()
  })

  it('should clear cache if exist and have keys', async () => {
    const cachedKeys = [1, 2]

    Object.defineProperty(window, 'caches', {
      writable: true,
      value: {
        keys: vi.fn().mockResolvedValue(cachedKeys),
        delete: vi.fn(),
      },
    })

    await Cache.clear()

    expect(window.caches.keys).toHaveBeenCalled()
    expect(window.caches.delete).toHaveBeenCalledTimes(cachedKeys.length)
  })

  it('should do not clear cache if exist but do not have keys', async () => {
    const cachedKeys = []

    Object.defineProperty(window, 'caches', {
      writable: true,
      value: {
        keys: vi.fn().mockResolvedValue(cachedKeys),
        delete: vi.fn(),
      },
    })

    await Cache.clear()

    expect(window.caches.keys).toHaveBeenCalled()
    expect(window.caches.delete).not.toHaveBeenCalled()
  })
})
