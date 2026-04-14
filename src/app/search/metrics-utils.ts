import { monitoring } from 'monitoring'

const ALGOLIA_EVENTS_URL = 'https://insights.algolia.io/1/events'

export const sendAlgoliaInsightsMetrics = async (fetchOptions: RequestInit) => {
  try {
    await fetch(new Request(ALGOLIA_EVENTS_URL, fetchOptions))
  } catch (error) {
    if (
      error instanceof TypeError &&
      (error.message.includes('Failed to fetch') ||
        error.message.includes('Load failed'))
    ) {
      return
    }
    monitoring.captureError(error as Error)
  }
}
