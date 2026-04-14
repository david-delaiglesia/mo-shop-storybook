import { useEffect, useRef } from 'react'

import messageReceivedSound from 'app/chat/assets/chat-message-received.mp3'
import { ChatEvent as ChatEventDomain } from 'app/chat/domain/chat-event'
import { ChatStatus as ChatStatusDomain } from 'app/chat/domain/chat-status'
import { ChatEvent, ChatStatusType } from 'app/chat/interfaces'
import { knownFeatureFlags, useFlag } from 'services/feature-flags'

interface UseChatSoundPlayerProps {
  events: ChatEvent[]
  chatStatus: ChatStatusType
  isChatOpen: boolean
  isSoundActive: boolean
}

export const useChatSoundPlayer = ({
  events,
  chatStatus,
  isChatOpen,
  isSoundActive,
}: UseChatSoundPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const isWebNewSupportChatToggleSoundFlagActive = useFlag(
    knownFeatureFlags.WEB_NEW_SUPPORT_CHAT_TOGGLE_SOUND,
  )

  useEffect(() => {
    if (!isWebNewSupportChatToggleSoundFlagActive) return
    if (!ChatStatusDomain.isStarted(chatStatus)) return
    if (!audioRef.current) {
      audioRef.current = new Audio(messageReceivedSound)
      audioRef.current.preload = 'auto'
    }

    const isTabActive =
      document.visibilityState === 'visible' && document.hasFocus()
    if (isTabActive && isChatOpen) return
    if (!isSoundActive) return

    const lastEvent = events[events.length - 1]
    if (!lastEvent) return

    const shouldPlayWhenMinimized =
      !isChatOpen && ChatEventDomain.isUnreadMessageFromAgent(lastEvent)
    const shouldPlayWhenTabInactive =
      !isTabActive && ChatEventDomain.isMessageFromAgent(lastEvent)

    if (!shouldPlayWhenMinimized && !shouldPlayWhenTabInactive) return

    audioRef.current?.pause()
    audioRef.current?.load()
    audioRef.current?.play().catch(() => {
      return
    })
  }, [
    events,
    isChatOpen,
    chatStatus,
    isWebNewSupportChatToggleSoundFlagActive,
    isSoundActive,
  ])

  useEffect(() => {
    return () => {
      audioRef.current?.pause()
      audioRef.current = null
    }
  }, [])
}
