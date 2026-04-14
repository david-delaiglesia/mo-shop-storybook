import { useCallback, useEffect, useRef } from 'react'

import { useFlag } from 'services/feature-flags'
import { knownFeatureFlags } from 'services/feature-flags/constants'

export const useProductImpression = (trackImpression: () => void) => {
  const isMoAnalyticsImpressionsPayloadEnabled = useFlag(
    knownFeatureFlags.WEB_MO_ANALYTICS_IMPRESSIONS_PAYLOAD,
  )
  const ref = useRef<HTMLDivElement | null>(null)
  const isAlreadySeen = useRef(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  const observerCallback = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries

      if (!entry) {
        return
      }

      if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
        if (!isAlreadySeen.current) {
          timeoutRef.current = setTimeout(() => {
            trackImpression()
            isAlreadySeen.current = true
          }, 1000)
        }
      } else {
        if (isMoAnalyticsImpressionsPayloadEnabled) {
          isAlreadySeen.current = false
        }
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
          timeoutRef.current = null
        }
      }
    },
    [isMoAnalyticsImpressionsPayloadEnabled],
  )

  useEffect(() => {
    if (!ref.current) {
      return
    }

    observerRef.current = new IntersectionObserver(observerCallback, {
      threshold: [0.5],
    })
    observerRef.current.observe(ref.current)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      if (observerRef.current) {
        observerRef.current.disconnect()
        observerRef.current = null
      }
    }
  }, [observerCallback])

  return { ref }
}
