import { HomeSectionLayout } from 'app/home/interfaces/HomeSectionLayout'
import { Tracker } from 'services/tracker'

interface VideoSectionLoadTimePayload {
  source: string
  durationMs: number
  layout: HomeSectionLayout
}

export const VideoSectionMetrics = {
  videoSectionLoadTime({
    source,
    durationMs,
    layout,
  }: VideoSectionLoadTimePayload) {
    Tracker.sendInteraction('video_section_load_time', {
      source,
      duration_ms: durationMs,
      layout,
    })
  },

  videoSectionViewWithoutLoad({
    source,
    layout,
  }: {
    source: string
    layout: HomeSectionLayout
  }) {
    Tracker.sendInteraction('video_section_view_without_load', {
      source,
      layout,
    })
  },

  videoSectionVideoClick({
    source,
    second,
  }: {
    source: string
    second: number
  }) {
    Tracker.sendInteraction('video_section_video_click', { source, second })
  },
}
