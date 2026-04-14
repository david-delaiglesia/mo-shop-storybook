import { useEffect, useState } from 'react'

import { ChatEvent as ChatEventDomain } from 'app/chat/domain/chat-event'
import { AgentMessageTextChatEvent, ChatEvent } from 'app/chat/interfaces'

export const useChatVoiceOverAnnouncement = (
  events: ChatEvent[],
): AgentMessageTextChatEvent[] => {
  const [lastMessageAnnouncement, setLastMessageAnnouncement] = useState<
    AgentMessageTextChatEvent[]
  >([])

  useEffect(() => {
    if (!events?.length) return

    const lastEvent = events[events.length - 1]

    if (
      ChatEventDomain.isMessageFromAgent(lastEvent) &&
      lastEvent.payload.content.text !== null
    ) {
      setLastMessageAnnouncement((prev) => [
        ...prev,
        lastEvent as AgentMessageTextChatEvent,
      ])
    }
  }, [events])

  return lastMessageAnnouncement
}
