import { Dispatch, SetStateAction, useState } from 'react'

import { ChatEvent } from 'app/chat/interfaces'

const normalizeTimestamp = (timestamp: string): number => {
  return new Date(timestamp).getTime()
}

const sortEventsByReceivedAt = (events: ChatEvent[]): ChatEvent[] => {
  return [...events].sort((a, b) => {
    if (!a.receivedAt && !b.receivedAt) return 0
    if (!a.receivedAt) return 1
    if (!b.receivedAt) return -1

    return normalizeTimestamp(a.receivedAt) - normalizeTimestamp(b.receivedAt)
  })
}

export const useSortedChatEvents = (): [
  ChatEvent[],
  Dispatch<SetStateAction<ChatEvent[]>>,
] => {
  const [events, _setEvents] = useState<ChatEvent[]>([])

  const setEvents: Dispatch<SetStateAction<ChatEvent[]>> = (newEvents) => {
    if (typeof newEvents === 'function') {
      _setEvents((prevEvents) => {
        const updatedEvents = newEvents(prevEvents)
        return sortEventsByReceivedAt(updatedEvents)
      })
      return
    }

    _setEvents(sortEventsByReceivedAt(newEvents))
  }

  return [events, setEvents]
}
