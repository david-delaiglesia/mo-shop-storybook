import { useEffect, useRef } from 'react'

import { VideoSectionMetrics } from 'app/catalog/VideoSectionMetrics'
import { HomeSectionLayout } from 'app/home/interfaces/HomeSectionLayout'

export const useVideoMetrics = ({
  sectionRef,
  source,
}: {
  sectionRef: React.RefObject<HTMLElement>
  source: string
}) => {
  const loadStartTsRef = useRef<number | null>(null)
  const hasVideoLoadedRef = useRef(false)

  useEffect(() => {
    if (!sectionRef.current) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasVideoLoadedRef.current) {
          VideoSectionMetrics.videoSectionViewWithoutLoad({
            source,
            layout: HomeSectionLayout.VIDEO,
          })
        }
      },
      { threshold: [0.5] },
    )

    observer.observe(sectionRef.current)

    return () => {
      observer.disconnect()
    }
  }, [source, sectionRef])

  const handleLoadStart = () => {
    loadStartTsRef.current = performance.now()
  }

  const handleCanPlay = () => {
    if (loadStartTsRef.current === null) {
      return
    }
    hasVideoLoadedRef.current = true
    VideoSectionMetrics.videoSectionLoadTime({
      source,
      layout: HomeSectionLayout.VIDEO,
      durationMs: Math.round(performance.now() - loadStartTsRef.current),
    })
  }

  return { handleLoadStart, handleCanPlay }
}
