import {
  EVENTS_LOCAL_STORAGE_KEY,
  EVENTS_LOCAL_STORAGE_MAX_SIZE,
} from './constants'
import { EventWithUserId } from './interfaces'

export const Persistence = {
  save(queue: EventWithUserId[]) {
    const eventsToSave = queue.slice(0, EVENTS_LOCAL_STORAGE_MAX_SIZE)
    localStorage.setItem(EVENTS_LOCAL_STORAGE_KEY, JSON.stringify(eventsToSave))
  },

  load(): EventWithUserId[] {
    try {
      const raw = localStorage.getItem(EVENTS_LOCAL_STORAGE_KEY)

      if (!raw) return []

      return JSON.parse(raw) as EventWithUserId[]
    } catch {
      return []
    }
  },

  clear() {
    localStorage.setItem(EVENTS_LOCAL_STORAGE_KEY, JSON.stringify([]))
  },
}
