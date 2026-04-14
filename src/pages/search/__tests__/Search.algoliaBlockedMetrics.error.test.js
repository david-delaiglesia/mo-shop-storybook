import { monitoring } from 'monitoring'

import { sendAlgoliaInsightsMetrics } from 'app/search/metrics-utils'

describe('When an user has an extension blocking requests (e.g Ghostery)', async () => {
  it('should not send error to Sentry in case of Failed to fetch error', async () => {
    global.window.fetch = vi
      .fn()
      .mockRejectedValue(new TypeError('Failed to fetch'))
    await sendAlgoliaInsightsMetrics()
    expect(monitoring.captureError).not.toHaveBeenCalled()
  })

  it('should not send error to Sentry in case of Load failed error', async () => {
    global.window.fetch = vi
      .fn()
      .mockRejectedValue(new TypeError('Load failed'))
    await sendAlgoliaInsightsMetrics()
    expect(monitoring.captureError).not.toHaveBeenCalled()
  })
})

it('should send error to Sentry if the request is not blocked by an extension', async () => {
  global.window.fetch = vi.fn().mockRejectedValue(new Error('Custom error'))
  await sendAlgoliaInsightsMetrics()

  expect(monitoring.captureError).toHaveBeenCalledWith(
    new Error('Custom error'),
  )
})
