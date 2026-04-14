import { Cache } from '../Cache'

const twentyFourHours = 24 * 60 * 60 * 1000

let eventMap

beforeEach(() => {
  eventMap = {}
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
})

afterEach(() => {
  eventMap = {}
  vi.restoreAllMocks()
})

it('should not clear cache and reload if timeFrame is still running', async () => {
  global.Date = {
    now: vi
      .fn()
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(twentyFourHours + 1),
  }

  Cache.reloadOnWindowFocus()

  const reloadPageIfTimeIsOut = eventMap.focus

  await reloadPageIfTimeIsOut()

  expect(window.location.reload).toHaveBeenCalledTimes(1)
  expect(window.caches.delete).toHaveBeenCalledTimes(3)
})
