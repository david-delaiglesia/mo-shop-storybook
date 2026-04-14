import { HomeSectionLayout } from './HomeSectionLayout'

export interface HomeSectionNotificationContent {
  title: string
  type: 'info' | 'warning'
  eventKey?: string
  apiPath?: string
}

// WIP interface for HomeSection
export interface HomeSection {
  layout: HomeSectionLayout
  content: Record<string, unknown | unknown[]>
}
